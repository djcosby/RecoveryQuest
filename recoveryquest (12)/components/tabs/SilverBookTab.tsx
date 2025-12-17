
import React, { useState, useEffect, useMemo } from 'react';
import { Video, Shield, Star, Send, MessageSquare, Loader2, MapPin, Navigation, Crosshair, Filter, X, Calendar, Layers, Map, Clock, ExternalLink, Users, Home, Stethoscope, Scale, Heart, Utensils, Search, ArrowLeft, Database, Download, Plus, Globe, Phone } from 'lucide-react';
import { Resource, Meeting } from '../../types';
import { useResourcesStore } from '../../context/ResourceContext';
import { usePeerStore } from '../../context/PeerContext';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RAW_MEETINGS_CSV } from '../../constants';

// Fix Leaflet default icon issues in React
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  type: 'resource' | 'meeting' | 'peer';
  id: string | number;
  details?: any;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEETING_FORMATS = ['AA', 'NA', 'SMART', 'Other'];

// Helper to calculate distance in miles
function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // Radius of earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Geocode Address using Nominatim
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'RecoveryQuest/1.0',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;

    const first = data[0];
    const lat = Number(first.lat);
    const lon = Number(first.lon);
    if (isNaN(lat) || isNaN(lon)) return null;

    return { lat, lng: lon };
  } catch {
    return null;
  }
};

// Helper CSV parser function
function parseCsvLine(line: string): string[] {
  const regex = /("([^"]*(?:""[^"]*)*)"|[^,]*)(,|$)/g;
  const result: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    let value = match[1] || '';
    value = value.replace(/^"/, '').replace(/"$/, '').replace(/""/g, '"');
    result.push(value);
    if (!match[3]) break;
  }
  return result;
}

// Shared meeting parser logic
function parseMeetingsFromCSV(csvText: string, resources: Resource[]): Meeting[] {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Parse Header: id,name,type,address,dayOfWeek,time,format,tags
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  
  // Required columns
  const idx: Record<string, number> = {};
  const requiredCols = ['id', 'name', 'address', 'dayOfWeek', 'time'];
  
  for (const col of requiredCols) {
    const i = header.indexOf(col);
    idx[col] = i;
    // We allow missing ID/Name to be generated or defaulted if necessary, but ideally present
  }
  
  const typeIdx = header.indexOf('type');   // AA, NA, etc
  const formatIdx = header.indexOf('format'); // In-person, Online
  const tagsIdx = header.indexOf('tags');

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    
    // Safety check for malformed lines
    if (cols.length < 2) return null;

    // Parse base tags
    const tagsField = tagsIdx >= 0 ? (cols[tagsIdx] || '') : '';
    let tags = tagsField
      ? tagsField.split('|').map((t) => t.trim()).filter(Boolean)
      : [];

    // Map 'type' column (AA/NA) to Meeting.format property
    const rawType = typeIdx >= 0 ? cols[typeIdx] : 'Other';
    let format: Meeting['format'] = 'Other';
    if (['AA', 'NA', 'SMART'].includes(rawType)) {
      format = rawType as Meeting['format'];
    }

    // Map 'format' column (In-person/Online) to tags
    const rawFormat = formatIdx >= 0 ? cols[formatIdx] : '';
    if (rawFormat) {
      tags.push(rawFormat);
    }
    
    // Deduplicate tags
    tags = Array.from(new Set(tags));

    const address = idx['address'] >= 0 ? (cols[idx['address']] || '') : '';
    
    // Try to find a host resource for coords
    const host = resources.find(
      (r) =>
        r.address &&
        r.address.trim().toLowerCase() === address.trim().toLowerCase()
    );

    const meetingName = idx['name'] >= 0 ? (cols[idx['name']] || 'Meeting') : 'Meeting';
    const meetingId = (idx['id'] >= 0 ? cols[idx['id']] : null) || `meeting-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: meetingId,
      name: meetingName,
      type: 'meeting',
      format, 
      address,
      dayOfWeek: idx['dayOfWeek'] >= 0 ? (cols[idx['dayOfWeek']] || '') : '',
      time: idx['time'] >= 0 ? (cols[idx['time']] || '') : '',
      tags,
      lat: host?.lat,
      lng: host?.lng,
      hostResourceId: host?.id,
    };
  }).filter(Boolean) as Meeting[];
}

// Component to auto-fit map bounds
const MapBoundsFitter: React.FC<{ points: MapPoint[]; userLocation: [number, number] | null }> = ({ points, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0 && !userLocation) return;

    const bounds = L.latLngBounds([]);
    
    if (userLocation) {
      bounds.extend(userLocation);
    }

    points.forEach(p => bounds.extend([p.lat, p.lng]));

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points, userLocation, map]);

  return null;
};

// Component to handle map centering when selection changes
const MapRecenter: React.FC<{ points: MapPoint[]; selectedId?: string | number }> = ({ points, selectedId }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const target = points.find(p => p.id === selectedId);
    if (target) {
      map.flyTo([target.lat, target.lng], 16, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedId, points, map]);

  return null;
};

const InteractiveMap: React.FC<{
  resources: Resource[];
  meetings: Meeting[];
  userLocation: [number, number] | null;
  selectedId?: string | number;
  variant?: 'compact' | 'full';
  onMarkerClick: (type: 'resource' | 'meeting' | 'peer', id: string | number) => void;
  showPeers: boolean;
  peersPoints: MapPoint[];
}> = ({ resources, meetings, userLocation, selectedId, variant = 'compact', onMarkerClick, showPeers, peersPoints }) => {
  const heightClass = variant === 'compact' ? 'h-48' : 'h-[50vh]';

  // Combine all valid points
  const points: MapPoint[] = useMemo(() => {
    const pts: MapPoint[] = [];
    resources.forEach(r => {
      if (r.lat && r.lng) pts.push({ lat: r.lat, lng: r.lng, label: r.name, type: 'resource', id: r.id });
    });
    meetings.forEach(m => {
      if (m.lat && m.lng) pts.push({ lat: m.lat, lng: m.lng, label: m.name, type: 'meeting', id: m.id });
    });
    if (showPeers) {
        pts.push(...peersPoints);
    }
    return pts;
  }, [resources, meetings, showPeers, peersPoints]);

  return (
    <div className={`w-full ${heightClass} rounded-3xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 relative z-0`}>
      <MapContainer
        center={userLocation || [39.1031, -84.5120]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        {userLocation && (
          <>
            <CircleMarker 
              center={userLocation} 
              radius={8} 
              pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }} 
            >
              <Popup>You are here</Popup>
            </CircleMarker>
            {/* Pulse effect */}
            <CircleMarker 
              center={userLocation} 
              radius={20} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 0 }} 
            />
          </>
        )}

        {/* Resources, Meetings, & Peers */}
        {points.map((p, idx) => {
          const distance = (userLocation && p.lat && p.lng) 
            ? getDistanceMiles(userLocation[0], userLocation[1], p.lat, p.lng)
            : null;

          // Custom Icon Logic
          let icon: L.Icon | L.DivIcon = defaultIcon;
          if (p.type === 'peer') {
              icon = L.divIcon({
                  className: 'custom-peer-icon',
                  html: `<div style="background-color: #6366f1; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 16px;">👤</div>`,
                  iconSize: [30, 30],
                  iconAnchor: [15, 15],
                  popupAnchor: [0, -15]
              });
          }

          return (
            <Marker
              key={`${p.type}-${p.id}-${idx}`}
              position={[p.lat, p.lng]}
              icon={icon}
              zIndexOffset={selectedId === p.id ? 1000 : 0}
              eventHandlers={{
                click: () => p.id && onMarkerClick(p.type, p.id),
              }}
              opacity={selectedId === p.id ? 1 : 0.8}
            >
              <Popup>
                <div className="font-bold text-sm">{p.label}</div>
                <div className="text-[10px] text-slate-500 uppercase font-medium">{p.type}</div>
                {p.type === 'peer' && p.details && (
                    <div className="mt-1 border-t pt-1 border-slate-100">
                        <span className="text-xs text-indigo-600 font-bold">{p.details.role}</span>
                        <br/>
                        <span className="text-[10px] text-slate-500">{p.details.streak} day streak</span>
                    </div>
                )}
                {distance !== null && p.type !== 'peer' && (
                  <div className="text-[10px] font-bold text-blue-500 mt-1 flex items-center">
                    <Navigation size={10} className="mr-1" /> {distance.toFixed(1)} miles away
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}

        <MapRecenter points={points} selectedId={selectedId} />
        {!selectedId && <MapBoundsFitter points={points} userLocation={userLocation} />}
      </MapContainer>
    </div>
  );
};

const AddResourceModal: React.FC<{ onClose: () => void; onSave: (res: Resource) => void }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Resource>>({
    name: '',
    type: 'Support Group',
    address: '',
    phone: '',
    website: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;
    
    // Create new resource object
    const newResource: Resource = {
      id: Date.now(), // Generate a unique ID
      name: formData.name!,
      type: formData.type!,
      address: formData.address!,
      verified: false, // User submitted content is unverified by default
      kind: 'other',
      tags: tagInput ? tagInput.split(',').map(t => t.trim()) : [],
      phone: formData.phone,
      website: formData.website,
      description: formData.description
    };
    
    onSave(newResource);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-extrabold text-slate-800 text-lg">Add New Resource</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resource Name *</label>
            <input 
              required
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700" 
              placeholder="e.g. Community Hope Center"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="Support Group">Support Group</option>
                <option value="Therapy Center">Therapy Center</option>
                <option value="Wellness">Wellness</option>
                <option value="Medical">Medical</option>
                <option value="Housing">Housing</option>
                <option value="Food">Food Assistance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone (Optional)</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700" 
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address *</label>
            <input 
              required
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700" 
              placeholder="123 Main St, City, ST"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website (Optional)</label>
            <input 
              type="url" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700" 
              placeholder="https://example.org"
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 resize-none" 
              placeholder="Services offered, hours, eligibility..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tags (comma separated)</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700" 
              placeholder="Free, Spanish, Wheelchair Accessible"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center space-x-2">
            <Plus size={20} />
            <span>Add to SilverBook</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const SilverBookTab: React.FC = () => {
  const { resources, setResources, geocodeMissingCoords, geocodeProgress } = useResourcesStore();
  const { peers, getConnection } = usePeerStore();
  
  // View Mode: 'onboarding' (categories) vs 'map' (results)
  const [viewMode, setViewMode] = useState<'onboarding' | 'map'>('onboarding');

  // Search state
  const [searchText, setSearchText] = useState('');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'meeting' | 'resource'>('all');
  const [filterDay, setFilterDay] = useState('Any');
  const [filterFormat, setFilterFormat] = useState('Any');
  const [filterRadius, setFilterRadius] = useState<number | 'Any'>('Any');
  const [filterCategory, setFilterCategory] = useState('Any');
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  // User Geolocation
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<
    | { type: 'resource'; id: number | string }
    | { type: 'meeting'; id: string }
    | { type: 'peer'; id: string }
    | null
  >(null);

  const [showMappedOnly, setShowMappedOnly] = useState(false);
  const [mapMode, setMapMode] = useState<'split' | 'full'>('split');
  
  // New Filter State for Peers
  const [showPeers, setShowPeers] = useState(false);

  // Data Tools / Import UI
  const [showDataTools, setShowDataTools] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  
  // Add Resource Modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Meeting Geocoding State
  const [meetingGeocodeProgress, setMeetingGeocodeProgress] = useState<{
    total: number;
    completed: number;
    running: boolean;
    error?: string | null;
  }>({ total: 0, completed: 0, running: false, error: null });

  useEffect(() => {
    // Request location on mount
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => setGpsError(err.message),
      { enableHighAccuracy: true }
    );
  }, []);

  // Initialize with raw data
  useEffect(() => {
    if (meetings.length === 0 && RAW_MEETINGS_CSV) {
      const parsed = parseMeetingsFromCSV(RAW_MEETINGS_CSV, resources);
      setMeetings(parsed);
    }
  }, [resources, meetings.length]);

  const handleLocateMe = () => {
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => {
        setGpsError("Could not get location. Check permissions.");
        console.error(err);
      },
      { enableHighAccuracy: true }
    );
  };

  const sendReferral = (resourceName: string) =>
    window.alert(`Referral sent to ${resourceName}. Check your email.`);

  const clearFilters = () => {
    setFilterType('all');
    setFilterDay('Any');
    setFilterFormat('Any');
    setFilterRadius('Any');
    setFilterCategory('Any');
    setShowMappedOnly(false);
  };

  const handleQuickCategorySelect = (type: 'all' | 'meeting' | 'resource', category?: string) => {
      clearFilters();
      setFilterType(type);
      if (category) setFilterCategory(category);
      setViewMode('map');
  };

  const returnToCategories = () => {
      setViewMode('onboarding');
      clearFilters();
      setSearchText('');
  };

  const handleAddResource = (newResource: Resource) => {
    setResources([...resources, newResource]);
    setShowAddModal(false);
    // Optionally trigger geocode for the new resource here
  };

  const hasActiveFilters = filterType !== 'all' || filterDay !== 'Any' || filterFormat !== 'Any' || showMappedOnly || filterRadius !== 'Any' || filterCategory !== 'Any';

  // Get distinct Resource Types for Filter
  const resourceCategories = useMemo(() => {
    const types = new Set(resources.map(r => r.type));
    return Array.from(types).sort();
  }, [resources]);

  const missingResourceCoordsCount = useMemo(() => {
    return resources.filter(r => !r.lat || !r.lng).length;
  }, [resources]);

  const missingMeetingCoordsCount = useMemo(() => {
    return meetings.filter(m => (!m.lat || !m.lng) && m.address && m.address.length > 5).length;
  }, [meetings]);

  const geocodeMissingMeetingCoords = async () => {
    const toGeocode = meetings.filter(
      (m) => m.address && m.address.length > 5 && (m.lat === undefined || m.lng === undefined)
    );

    if (!toGeocode.length) return;

    setMeetingGeocodeProgress({
      total: toGeocode.length,
      completed: 0,
      running: true,
      error: null,
    });

    let workingMeetings = [...meetings];

    try {
      for (let i = 0; i < toGeocode.length; i++) {
          const item = toGeocode[i];
          // Use the local helper
          const coords = await geocodeAddress(item.address);
          
          if (coords) {
              // Update in working array
              const idx = workingMeetings.findIndex(m => m.id === item.id);
              if (idx !== -1) {
                  workingMeetings[idx] = { ...workingMeetings[idx], ...coords };
                  // Real-time update for map visualization
                  setMeetings([...workingMeetings]); 
              }
          }
          
          setMeetingGeocodeProgress(prev => ({
              ...prev,
              completed: prev.completed + 1
          }));

          // Gentle rate limit for Nominatim (1 request per second approx)
          await new Promise(r => setTimeout(r, 1200));
      }
    } catch (e) {
      console.error("Geocoding error", e);
      setMeetingGeocodeProgress(prev => ({ ...prev, error: "Failed to complete geocoding." }));
    } finally {
      setMeetings(workingMeetings);
      setMeetingGeocodeProgress(prev => ({ ...prev, running: false }));
    }
  };

  // Peer Logic
  const peersPoints = useMemo(() => {
      const pts: MapPoint[] = [];
      if (showPeers) {
          peers.forEach(p => {
              if (p.lat && p.lng) {
                  // Privacy check: Only show if connected OR they are in the same 'Program' (Mocked here as always true for demo)
                  const isConnected = !!getConnection(p.id);
                  // In a real app, you would fuzzy the location (randomize slightly) for safety
                  pts.push({
                      lat: p.lat,
                      lng: p.lng,
                      label: p.name,
                      type: 'peer',
                      id: p.id,
                      details: p
                  });
              }
          });
      }
      return pts;
  }, [peers, showPeers, getConnection]);

  // -- FILTER LOGIC --

  const filteredResources = resources.filter((r) => {
    // 1. Type Filter
    if (filterType === 'meeting') return false; 

    // 2. Category Filter
    if (filterCategory !== 'Any' && r.type !== filterCategory) return false;

    // 3. Text Search
    const term = searchText.toLowerCase();
    const matchesSearch =
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.address.toLowerCase().includes(term) ||
      r.tags.some(t => t.toLowerCase().includes(term));
    
    // 4. Mapped Only
    const passesMapped = !showMappedOnly || (r.lat && r.lng);

    // 5. Radius Filter
    if (filterRadius !== 'Any' && userPos && r.lat && r.lng) {
      const dist = getDistanceMiles(userPos[0], userPos[1], r.lat, r.lng);
      if (dist > filterRadius) return false;
    } else if (filterRadius !== 'Any' && (!r.lat || !r.lng)) {
        return false; // If radius is on, unmapped items are hidden
    }

    return matchesSearch && passesMapped;
  }).sort((a, b) => {
    // Sort by distance if user has location
    if (!userPos) return 0;
    const distA = (a.lat && a.lng) ? getDistanceMiles(userPos[0], userPos[1], a.lat, a.lng) : Infinity;
    const distB = (b.lat && b.lng) ? getDistanceMiles(userPos[0], userPos[1], b.lat, b.lng) : Infinity;
    return distA - distB;
  });

  const filteredMeetings = meetings.filter((m) => {
    // 1. Type Filter
    if (filterType === 'resource') return false;

    // 2. Day Filter
    if (filterDay !== 'Any' && m.dayOfWeek !== filterDay) return false;

    // 3. Format Filter (AA, NA, etc)
    if (filterFormat !== 'Any' && m.format !== filterFormat) return false;

    // 4. Text Search
    const term = searchText.toLowerCase();
    const matchesSearch =
      !term ||
      m.name.toLowerCase().includes(term) ||
      m.dayOfWeek.toLowerCase().includes(term) ||
      m.time.toLowerCase().includes(term) ||
      m.address.toLowerCase().includes(term) ||
      m.tags.some(t => t.toLowerCase().includes(term));

    // 5. Mapped Only
    const passesMapped = !showMappedOnly || (m.lat && m.lng);

    // 6. Radius Filter
    if (filterRadius !== 'Any' && userPos && m.lat && m.lng) {
        const dist = getDistanceMiles(userPos[0], userPos[1], m.lat, m.lng);
        if (dist > filterRadius) return false;
    } else if (filterRadius !== 'Any' && (!m.lat || !m.lng)) {
        return false;
    }

    return matchesSearch && passesMapped;
  }).sort((a, b) => {
    if (!userPos) return 0;
    const distA = (a.lat && a.lng) ? getDistanceMiles(userPos[0], userPos[1], a.lat, a.lng) : Infinity;
    const distB = (b.lat && b.lng) ? getDistanceMiles(userPos[0], userPos[1], b.lat, b.lng) : Infinity;
    return distA - distB;
  });

  const mappedResourcesCount = filteredResources.filter((r) => r.lat && r.lng).length;
  const mappedMeetingsCount = filteredMeetings.filter((m) => m.lat && m.lng).length;

  const handleImportMeetings = () => {
    try {
      setImportError(null);
      const text = importText.trim();
      if (!text) {
        setImportError('Paste CSV content first.');
        return;
      }
      
      const imported = parseMeetingsFromCSV(text, resources);
      if (imported.length === 0) {
        setImportError('Failed to parse rows. Check format.');
        return;
      }

      setMeetings((prev) => [...prev, ...imported]);
      setImportText('');
      setImportError(null);
    } catch (err: any) {
      console.error('Import error:', err);
      setImportError(err?.message || 'Failed to parse CSV.');
    }
  };

  const onMapMarkerClick = (type: 'resource' | 'meeting' | 'peer', id: string | number) => {
    if (type === 'meeting' || type === 'peer') {
      setSelectedLocation({ type, id: String(id) });
    } else {
      setSelectedLocation({ type, id });
    }
  };

  const selectedItem = useMemo(() => {
    if (!selectedLocation) return null;
    if (selectedLocation.type === 'resource') {
      return resources.find((r) => r.id === selectedLocation.id);
    } else if (selectedLocation.type === 'meeting') {
      return meetings.find((m) => m.id === selectedLocation.id);
    } else {
        return peers.find((p) => p.id === selectedLocation.id);
    }
  }, [selectedLocation, resources, meetings, peers]);

  // ONBOARDING VIEW
  if (viewMode === 'onboarding') {
      return (
          <div className="pb-24 px-4 pt-6 animate-fade-in min-h-screen bg-slate-50 flex flex-col items-center">
              <div className="w-full max-w-md">
                  <div className="text-center mb-8 mt-4">
                      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Welcome to SilverBook</h2>
                      <p className="text-slate-500 font-medium">How can we support you today?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <button 
                        onClick={() => handleQuickCategorySelect('meeting')}
                        className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex flex-col items-center text-center"
                      >
                          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-3 group-hover:scale-110 transition-transform">
                              <Users size={32} />
                          </div>
                          <h3 className="font-extrabold text-slate-700">Find a Meeting</h3>
                          <p className="text-xs text-slate-400 mt-1">AA, NA, SMART & more</p>
                      </button>

                      <button 
                        onClick={() => handleQuickCategorySelect('resource', 'Therapy Center')}
                        className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group flex flex-col items-center text-center"
                      >
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                              <Stethoscope size={32} />
                          </div>
                          <h3 className="font-extrabold text-slate-700">Therapy & Rehab</h3>
                          <p className="text-xs text-slate-400 mt-1">Professional Help</p>
                      </button>

                      <button 
                        onClick={() => handleQuickCategorySelect('resource', 'Housing')}
                        className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-orange-200 hover:shadow-md transition-all group flex flex-col items-center text-center"
                      >
                          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-3 group-hover:scale-110 transition-transform">
                              <Home size={32} />
                          </div>
                          <h3 className="font-extrabold text-slate-700">Housing</h3>
                          <p className="text-xs text-slate-400 mt-1">Shelter & Sober Living</p>
                      </button>

                      <button 
                        onClick={() => handleQuickCategorySelect('resource', 'Food Assistance')}
                        className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-rose-200 hover:shadow-md transition-all group flex flex-col items-center text-center"
                      >
                          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-3 group-hover:scale-110 transition-transform">
                              <Utensils size={32} />
                          </div>
                          <h3 className="font-extrabold text-slate-700">Food & Basics</h3>
                          <p className="text-xs text-slate-400 mt-1">Pantries & Supplies</p>
                      </button>
                  </div>

                  <div className="space-y-3">
                      <button 
                        onClick={() => handleQuickCategorySelect('resource', 'Legal Services')}
                        className="w-full bg-slate-100 hover:bg-slate-200 p-4 rounded-2xl flex items-center justify-between transition-colors group"
                      >
                          <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white rounded-xl text-slate-500"><Scale size={20} /></div>
                              <span className="font-bold text-slate-600">Legal Aid & Advocacy</span>
                          </div>
                          <Navigation size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={() => handleQuickCategorySelect('all')}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all"
                      >
                          <Search size={18} className="mr-2" />
                          Browse Everything
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // MAP / RESULTS VIEW
  return (
    <div className="pb-24 px-4 pt-6 animate-slide-in-bottom relative">
      
      {showAddModal && <AddResourceModal onClose={() => setShowAddModal(false)} onSave={handleAddResource} />}

      <div className="mb-2 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            The SilverBook
          </h2>
          <p className="text-emerald-600/80 text-sm font-bold">
            Verified Recovery Resources & Meetings
          </p>
        </div>
        <div className="flex space-x-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-full border-2 border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm"
              title="Add Resource"
            >
              <Plus size={20} />
            </button>
            <button 
            onClick={returnToCategories}
            className="p-2 rounded-full border-2 border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-colors"
            title="Back to Categories"
            >
            <ArrowLeft size={20} />
            </button>
            <button 
            onClick={handleLocateMe}
            className={`p-2 rounded-full border-2 transition-colors ${userPos ? 'bg-blue-50 border-blue-200 text-blue-500' : 'bg-white border-slate-200 text-slate-400'}`}
            title="Locate Me"
            >
            <Crosshair size={20} />
            </button>
        </div>
      </div>

      {/* Control Row */}
      <div className="mt-3 mb-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() =>
              setMapMode((prev) => (prev === 'split' ? 'full' : 'split'))
            }
            className="px-2.5 py-1 rounded-full border border-slate-300 bg-white text-slate-600 font-bold flex items-center space-x-1 hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <span>{mapMode === 'split' ? 'Full Map' : 'Split View'}</span>
          </button>
          <span className="text-slate-400 font-medium">
            {mappedResourcesCount + mappedMeetingsCount} pinned nearby
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
            <label className="inline-flex items-center space-x-1 cursor-pointer select-none">
                <span className={`font-semibold ${showPeers ? 'text-indigo-600' : 'text-slate-500'}`}>Community</span>
                <button
                    type="button"
                    onClick={() => setShowPeers((prev) => !prev)}
                    className={`w-8 h-4 rounded-full border transition-colors flex items-center ${
                    showPeers
                        ? 'bg-indigo-500 border-indigo-600 justify-end'
                        : 'bg-slate-200 border-slate-300 justify-start'
                    }`}
                >
                    <span className="w-3 h-3 rounded-full bg-white shadow" />
                </button>
            </label>

            <label className="inline-flex items-center space-x-1 cursor-pointer select-none">
            <span className="text-slate-500 font-semibold">Mapped only</span>
            <button
                type="button"
                onClick={() => setShowMappedOnly((prev) => !prev)}
                className={`w-8 h-4 rounded-full border transition-colors flex items-center ${
                showMappedOnly
                    ? 'bg-emerald-500 border-emerald-600 justify-end'
                    : 'bg-slate-200 border-slate-300 justify-start'
                }`}
            >
                <span className="w-3 h-3 rounded-full bg-white shadow" />
            </button>
            </label>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="mt-4 flex space-x-2">
        <div className="relative flex-1">
          <div className="absolute left-4 top-3.5 text-slate-400">
            <Video size={20} />
          </div>
          <input
            type="text"
            placeholder="Search providers, meetings..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none font-bold text-slate-600 placeholder:text-slate-400 transition-all"
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 rounded-2xl border-2 transition-all active:scale-95 flex items-center justify-center relative ${
            showFilters || hasActiveFilters
              ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-200'
              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
          }`}
        >
          {showFilters ? <X size={20} /> : <Filter size={20} />}
          {!showFilters && hasActiveFilters && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white"></div>
          )}
        </button>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="mt-3 bg-white border-2 border-slate-100 rounded-3xl p-4 shadow-sm animate-zoom-in">
           <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Filter Options</h4>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[10px] text-rose-500 font-bold hover:underline">Clear All</button>
              )}
           </div>
           
           {/* Type Toggle */}
           <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button 
                onClick={() => setFilterType('all')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >All</button>
              <button 
                onClick={() => setFilterType('meeting')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${filterType === 'meeting' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              ><Layers size={12} /><span>Meetings</span></button>
              <button 
                onClick={() => setFilterType('resource')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${filterType === 'resource' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              ><Shield size={12} /><span>Resources</span></button>
           </div>

           {/* Dropdowns Grid */}
           <div className="grid grid-cols-2 gap-3 mb-3">
             <div className={filterType === 'resource' ? 'opacity-50 pointer-events-none' : ''}>
               <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block">Day of Week</label>
               <div className="relative">
                 <select 
                   value={filterDay} 
                   onChange={(e) => setFilterDay(e.target.value)}
                   className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                 >
                    <option value="Any">Any Day</option>
                    {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
                 <Calendar className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={14} />
               </div>
             </div>
             
             <div className={filterType === 'resource' ? 'opacity-50 pointer-events-none' : ''}>
               <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block">Program</label>
               <div className="relative">
                 <select 
                   value={filterFormat} 
                   onChange={(e) => setFilterFormat(e.target.value)}
                   className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                 >
                    <option value="Any">Any Format</option>
                    {MEETING_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                 </select>
               </div>
             </div>
           </div>

           {/* Advanced Filters: Radius & Category */}
           <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block">Distance (Radius)</label>
                <div className="relative">
                    <select
                        value={filterRadius}
                        onChange={(e) => setFilterRadius(e.target.value === 'Any' ? 'Any' : Number(e.target.value))}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        disabled={!userPos}
                    >
                        <option value="Any">Any Distance</option>
                        <option value={1}>Within 1 mile</option>
                        <option value={5}>Within 5 miles</option>
                        <option value={10}>Within 10 miles</option>
                        <option value={25}>Within 25 miles</option>
                    </select>
                    <MapPin className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={14} />
                </div>
             </div>

             <div className={filterType === 'meeting' ? 'opacity-50 pointer-events-none' : ''}>
                <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block">Resource Type</label>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                    <option value="Any">All Categories</option>
                    {resourceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
             </div>
           </div>
        </div>
      )}

      {/* Map Section */}
      <div className={mapMode === 'full' ? 'mt-4 space-y-3' : 'mt-4 space-y-4'}>
        {/* Interactive Leaflet Map */}
        <InteractiveMap 
          resources={filteredResources}
          meetings={filteredMeetings}
          userLocation={userPos}
          selectedId={selectedLocation?.id}
          variant={mapMode === 'split' ? 'compact' : 'full'}
          onMarkerClick={onMapMarkerClick}
          showPeers={showPeers}
          peersPoints={peersPoints}
        />
        
        {gpsError && (
          <div className="text-[10px] text-rose-500 text-center font-bold">{gpsError}</div>
        )}
      </div>

      {/* Selected Item Detail Card */}
      {selectedItem && (
        <div className="mt-4 animate-fade-in bg-slate-800 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden border-2 border-slate-700">
           <button 
             onClick={() => setSelectedLocation(null)}
             className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
           >
             <X size={16} />
           </button>
           
           {selectedLocation?.type === 'resource' && selectedItem && (
              <>
                <div className="flex items-start justify-between mb-2 pr-8">
                  <div>
                    <h3 className="text-xl font-extrabold">{selectedItem.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold uppercase border border-blue-500/30">
                      {(selectedItem as Resource).type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mb-4 text-sm font-medium text-slate-300">
                   {typeof (selectedItem as Resource).rating === 'number' && (
                      <div className="flex items-center text-yellow-400">
                        <Star size={14} className="fill-current mr-1" />
                        <span>{(selectedItem as Resource).rating}</span>
                        <span className="text-slate-500 ml-1">({(selectedItem as Resource).reviews})</span>
                      </div>
                   )}
                   {(selectedItem as Resource).verified && (
                      <div className="flex items-center text-emerald-400">
                        <Shield size={14} className="mr-1" /> Verified
                      </div>
                   )}
                </div>
                
                {(selectedItem as Resource).description && (
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                        {(selectedItem as Resource).description}
                    </p>
                )}

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-slate-300 text-xs">
                        <MapPin size={14} className="mr-2 shrink-0 text-slate-400" />
                        {(selectedItem as Resource).address}
                    </div>
                    {(selectedItem as Resource).phone && (
                        <div className="flex items-center text-slate-300 text-xs">
                            <Phone size={14} className="mr-2 shrink-0 text-slate-400" />
                            <a href={`tel:${(selectedItem as Resource).phone}`} className="hover:text-white underline decoration-slate-500">{(selectedItem as Resource).phone}</a>
                        </div>
                    )}
                    {(selectedItem as Resource).website && (
                        <div className="flex items-center text-slate-300 text-xs">
                            <Globe size={14} className="mr-2 shrink-0 text-slate-400" />
                            <a href={(selectedItem as Resource).website} target="_blank" rel="noopener noreferrer" className="hover:text-white underline decoration-slate-500 truncate max-w-[200px]">{(selectedItem as Resource).website}</a>
                        </div>
                    )}
                </div>

                <div className="flex space-x-2">
                   <button onClick={() => sendReferral(selectedItem.name)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_0_0_rgba(16,185,129,1)] active:shadow-none active:translate-y-1 transition-all border-b-4 border-emerald-700 active:border-b-0 flex items-center justify-center"
                   >
                      <Send size={16} className="mr-2" />
                      Referral
                   </button>
                   <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center transition-colors">
                      <ExternalLink size={14} className="mr-2" /> Details
                   </button>
                </div>
              </>
           )}
           
           {selectedLocation?.type === 'meeting' && selectedItem && (
              <>
                <div className="flex items-start justify-between mb-2 pr-8">
                  <div>
                    <h3 className="text-xl font-extrabold">{selectedItem.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase border ${(selectedItem as Meeting).format === 'NA' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                          {(selectedItem as Meeting).format}
                        </span>
                        <span className="text-slate-400 text-xs font-bold">{(selectedItem as Meeting).dayOfWeek}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-slate-300 text-xs mb-2">
                   <Clock size={14} className="mr-2 shrink-0 text-slate-400" />
                   {(selectedItem as Meeting).time}
                </div>
                <div className="flex items-center text-slate-300 text-xs mb-4">
                   <MapPin size={14} className="mr-2 shrink-0 text-slate-400" />
                   {(selectedItem as Meeting).address}
                </div>
                <div className="flex flex-wrap gap-2">
                   {(selectedItem as Meeting).tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 text-[10px] rounded-lg">#{tag}</span>
                   ))}
                </div>
              </>
           )}

           {selectedLocation?.type === 'peer' && selectedItem && (
               <>
                <div className="flex items-start justify-between mb-4 pr-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white text-4xl rounded-full flex items-center justify-center">
                            {(selectedItem as any).avatar}
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold">{selectedItem.name}</h3>
                            <p className="text-indigo-400 text-xs font-bold uppercase tracking-wide">{(selectedItem as any).role}</p>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-slate-300 mb-6 font-medium italic">"{(selectedItem as any).bio}"</p>
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-slate-700/50 rounded-xl p-2 text-center">
                        <span className="block text-xl font-bold">{(selectedItem as any).level}</span>
                        <span className="text-[9px] uppercase text-slate-400">Level</span>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-2 text-center">
                        <span className="block text-xl font-bold">{(selectedItem as any).streak}</span>
                        <span className="text-[9px] uppercase text-slate-400">Streak</span>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-2 text-center">
                        <span className="block text-xl font-bold">{(selectedItem as any).tags.length}</span>
                        <span className="text-[9px] uppercase text-slate-400">Tags</span>
                    </div>
                </div>
                <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all">
                    <MessageSquare size={18} />
                    <span>Connect</span>
                </button>
               </>
           )}
        </div>
      )}

      {/* Bulk Import / Data Tools Panel */}
      <div className="mt-4 mb-4 border border-dashed border-slate-300 rounded-2xl p-3 bg-slate-50/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center">
            <Database size={12} className="mr-1.5" />
            Data Tools
          </span>
          <button
            type="button"
            onClick={() => setShowDataTools((prev) => !prev)}
            className="text-[11px] text-blue-500 underline"
          >
            {showDataTools ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showDataTools && (
          <div className="space-y-4 animate-fade-in">
            {/* Geocoding Section: Resources */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-bold text-slate-700 uppercase">Geocode Resources</h4>
                  <span className="text-[9px] text-slate-400">{missingResourceCoordsCount} missing</span>
               </div>
               
               {geocodeProgress.running ? (
                   <div className="space-y-1">
                       <div className="flex justify-between text-[9px] text-blue-600 font-bold">
                           <span>Processing...</span>
                           <span>{geocodeProgress.completed} / {geocodeProgress.total}</span>
                       </div>
                       <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(geocodeProgress.completed / geocodeProgress.total) * 100}%` }}></div>
                       </div>
                   </div>
               ) : (
                   <button 
                     onClick={geocodeMissingCoords}
                     disabled={missingResourceCoordsCount === 0}
                     className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                   >
                     <MapPin size={12} className="mr-1" />
                     {missingResourceCoordsCount > 0 ? `Auto-Geocode Resources (${missingResourceCoordsCount})` : 'Resources Mapped'}
                   </button>
               )}
               {geocodeProgress.error && (
                   <p className="text-[9px] text-rose-500 mt-1">Error: {geocodeProgress.error}</p>
               )}
            </div>

            {/* Geocoding Section: Meetings */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-bold text-slate-700 uppercase">Geocode Meetings</h4>
                  <span className="text-[9px] text-slate-400">{missingMeetingCoordsCount} missing</span>
               </div>
               
               {meetingGeocodeProgress.running ? (
                   <div className="space-y-1">
                       <div className="flex justify-between text-[9px] text-emerald-600 font-bold">
                           <span>Processing...</span>
                           <span>{meetingGeocodeProgress.completed} / {meetingGeocodeProgress.total}</span>
                       </div>
                       <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(meetingGeocodeProgress.completed / meetingGeocodeProgress.total) * 100}%` }}></div>
                       </div>
                   </div>
               ) : (
                   <button 
                     onClick={geocodeMissingMeetingCoords}
                     disabled={missingMeetingCoordsCount === 0}
                     className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                   >
                     <MapPin size={12} className="mr-1" />
                     {missingMeetingCoordsCount > 0 ? `Auto-Geocode Meetings (${missingMeetingCoordsCount})` : 'Meetings Mapped'}
                   </button>
               )}
               {meetingGeocodeProgress.error && (
                   <p className="text-[9px] text-rose-500 mt-1">Error: {meetingGeocodeProgress.error}</p>
               )}
            </div>

            {/* CSV Import Section */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-700 uppercase mb-2">Bulk Import (CSV)</h4>
                <p className="text-[9px] text-slate-400 mb-2">
                  Header: <span className="font-mono">id,name,type,address,dayOfWeek,time,format,tags</span>
                </p>
                <textarea
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-mono h-20 mb-2 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`"1","Safe Harbor","meeting","123 Main St","Mon","7:00 PM","AA","In-person"`}
                />
                {importError && (
                  <div className="text-[9px] text-rose-600 bg-rose-50 border border-rose-100 rounded px-2 py-1 mb-2">
                    {importError}
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleImportMeetings}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 active:scale-95 transition-transform flex items-center"
                  >
                    <Download size={12} className="mr-1" />
                    Import Rows
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Lists */}
      <div className="space-y-6">
        {/* Resource list */}
        {filterType !== 'meeting' && (
          <div>
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                Providers & Resources <span className="text-slate-300">({filteredResources.length})</span>
               </h3>
               {filterRadius !== 'Any' && (
                   <span className="text-[10px] font-bold text-blue-500 flex items-center">
                       <Map size={12} className="mr-1" /> within {filterRadius}mi
                   </span>
               )}
            </div>
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Loading resources...
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-bold text-xs">No resources match your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResources.map((resource) => {
                  // Calc distance
                  const distance = (userPos && resource.lat && resource.lng) 
                    ? getDistanceMiles(userPos[0], userPos[1], resource.lat, resource.lng) 
                    : null;

                  return (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() => setSelectedLocation({ type: 'resource', id: resource.id })}
                      className={`w-full text-left bg-white p-5 rounded-3xl shadow-sm border-2 transition-all group ${
                          selectedLocation?.id === resource.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-lg flex items-center">
                            {resource.name}
                            {resource.verified && (
                              <Shield size={16} className="text-emerald-500 ml-1.5 fill-emerald-100" />
                            )}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">{resource.type}</span>
                              {distance !== null && (
                                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                                      <Navigation size={10} className="mr-1" /> {distance.toFixed(1)} mi
                                  </span>
                              )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {typeof resource.rating === 'number' && (
                            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-lg text-yellow-700 font-bold text-xs border border-yellow-200">
                              <Star size={12} className="fill-current mr-1" />
                              {resource.rating}
                            </div>
                          )}
                          {typeof resource.reviews === 'number' && (
                            <span className="text-[10px] text-slate-400 mt-1 font-medium">
                              {resource.reviews} reviews
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-slate-500 text-xs font-medium mb-4">
                        <div className="mr-1"><MapPin size={14} /></div>
                        {resource.address}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {resource.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-lg font-bold uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendReferral(resource.name);
                          }}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_0_0_rgba(16,185,129,1)] active:shadow-none active:translate-y-1 transition-all border-b-4 border-emerald-700 active:border-b-0 flex items-center justify-center"
                        >
                          <Send size={16} className="mr-2" />
                          Referral
                        </button>
                        <div className="px-4 py-2 border-2 border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300 transition-colors">
                          <MessageSquare size={20} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Meeting list */}
        {filterType !== 'resource' && (
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wide mb-2 flex justify-between">
              <span>Meetings <span className="text-slate-300">({filteredMeetings.length})</span></span>
              {filterRadius !== 'Any' && (
                   <span className="text-[10px] font-bold text-blue-500 flex items-center">
                       <Map size={12} className="mr-1" /> within {filterRadius}mi
                   </span>
               )}
            </h3>
            {meetings.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-[11px]">
                No meetings imported yet. Use the CSV import above.
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-bold text-xs">No meetings match your filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMeetings.map((m) => {
                  const distance = (userPos && m.lat && m.lng) 
                    ? getDistanceMiles(userPos[0], userPos[1], m.lat, m.lng) 
                    : null;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedLocation({ type: 'meeting', id: m.id })}
                      className={`w-full text-left bg-white p-4 rounded-2xl border transition-colors ${
                          selectedLocation?.id === m.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md ${m.format === 'NA' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {m.format}
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {m.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {m.dayOfWeek} • {m.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <div className="flex items-center">
                              <span className="mr-1"><MapPin size={12} /></span>
                              <span className="truncate max-w-[200px]">{m.address}</span>
                          </div>
                          {distance !== null && (
                              <span className="text-blue-500 font-bold flex items-center">
                                  <Navigation size={10} className="mr-1" /> {distance.toFixed(1)} mi
                              </span>
                          )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded-lg font-bold uppercase tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                        {m.lat && m.lng && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[9px] rounded-lg font-bold uppercase tracking-wide">
                            Mapped
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
