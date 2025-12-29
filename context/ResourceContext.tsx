import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Resource, Meeting } from '../types';
import { RESOURCES_DB } from '../constants';

const RESOURCES_LOCAL_STORAGE_KEY = 'rq.resources.v1';

interface ResourceContextType {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
  importResourcesFromFile: (file: File) => Promise<void>;
  geocodeMissingCoords: () => Promise<void>;
  geocodeProgress: {
    total: number;
    completed: number;
    running: boolean;
    error?: string | null;
  };
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

// Very small CSV parser for your use case
function parseCSVResources(text: string): Resource[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [];

  const header = lines[0].split(',').map((h) => h.trim());
  const idx = (key: string) => header.indexOf(key);

  const out: Resource[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((v) => v.trim());
    if (!row.length) continue;

    const idRaw = row[idx('id')] || i.toString();
    const name = row[idx('name')] || '';
    if (!name) continue;

    const type = row[idx('type')] || 'Resource';
    const address = row[idx('address')] || '';
    const tagsRaw = row[idx('tags')] || '';
    const verifiedRaw = row[idx('verified')] || '';
    const ratingRaw = row[idx('rating')] || '';
    const reviewsRaw = row[idx('reviews')] || '';
    const latRaw = row[idx('lat')] || '';
    const lngRaw = row[idx('lng')] || '';
    const kindRaw = row[idx('kind')] || '';

    out.push({
      id: isNaN(Number(idRaw)) ? idRaw : Number(idRaw),
      name,
      type,
      address,
      tags: tagsRaw
        ? tagsRaw.split('|').map((t) => t.trim()).filter(Boolean)
        : [],
      verified: verifiedRaw.toLowerCase() === 'true',
      rating: ratingRaw ? Number(ratingRaw) : undefined,
      reviews: reviewsRaw ? Number(reviewsRaw) : undefined,
      lat: latRaw ? Number(latRaw) : undefined,
      lng: lngRaw ? Number(lngRaw) : undefined,
      kind: kindRaw === 'provider' || kindRaw === 'meeting' ? (kindRaw as any) : 'other',
    });
  }

  return out;
}

export const ResourceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<Resource[]>(() => {
    // Try localStorage first, fall back to hard-coded DB
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(RESOURCES_LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Resource[];
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.warn('Failed to load resources from localStorage', e);
      }
    }
    return RESOURCES_DB;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        RESOURCES_LOCAL_STORAGE_KEY,
        JSON.stringify(resources)
      );
    } catch (e) {
      console.warn('Failed to persist resources', e);
    }
  }, [resources]);

  const importResourcesFromFile = async (file: File) => {
    const text = await file.text();

    let parsed: Resource[] = [];
    const isJSON = file.name.toLowerCase().endsWith('.json');

    if (isJSON) {
      // Expecting an array of Resource-like objects
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        parsed = data as Resource[];
      } else if (Array.isArray(data.resources)) {
        parsed = data.resources as Resource[];
      } else {
        throw new Error('JSON must be an array of resources or { resources: [] }');
      }
    } else {
      // Treat as CSV
      parsed = parseCSVResources(text);
    }

    if (!parsed.length) {
      throw new Error('No resources found in file');
    }

    // Simple sanity: ensure ids are unique-ish
    const seen = new Set<string | number>();
    parsed.forEach((r, i) => {
      const id = r.id ?? i;
      if (seen.has(id)) {
        // If duplicate, force a unique id for the imported runtime
        r.id = `${id}-${i}`;
      }
      seen.add(r.id);
    });

    setResources(parsed);
  };

  const [geocodeProgress, setGeocodeProgress] = useState<{
    total: number;
    completed: number;
    running: boolean;
    error?: string | null;
  }>({ total: 0, completed: 0, running: false, error: null });

  const geocodeAddress = async (
    address: string
  ): Promise<{ lat: number; lng: number } | null> => {
    // Simple mock / public API call. 
    // In a real app, use a proper geocoding service key.
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;

    try {
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          // User-Agent is polite for OSM
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

  const geocodeMissingCoords = async () => {
    const toGeocode = resources.filter(
      (r) =>
        r.address &&
        (r.lat === undefined || r.lng === undefined || isNaN(r.lat) || isNaN(r.lng))
    );

    if (!toGeocode.length) {
      setGeocodeProgress({
        total: 0,
        completed: 0,
        running: false,
        error: null,
      });
      return;
    }

    setGeocodeProgress({
      total: toGeocode.length,
      completed: 0,
      running: true,
      error: null,
    });

    const updated = [...resources];

    try {
      let completed = 0;

      for (const target of toGeocode) {
        const result = await geocodeAddress(target.address);
        if (result) {
          const idx = updated.findIndex((r) => r.id === target.id);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              lat: result.lat,
              lng: result.lng,
            };
          }
        }

        completed += 1;
        setGeocodeProgress((prev) => ({
          ...prev,
          completed,
        }));

        // Gentle rate limit for public Nominatim
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      setResources(updated);
      setGeocodeProgress((prev) => ({
        ...prev,
        running: false,
      }));
    } catch (err: any) {
      console.error('Geocoding failed', err);
      setGeocodeProgress((prev) => ({
        ...prev,
        running: false,
        error: err?.message || 'Geocoding failed',
      }));
    }
  };

  return (
    <ResourceContext.Provider
      value={{ 
        resources, 
        setResources, 
        importResourcesFromFile,
        geocodeMissingCoords,
        geocodeProgress
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

export const useResourcesStore = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResourcesStore must be used within ResourceProvider');
  }
  return context;
};