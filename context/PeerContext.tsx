
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Peer, Connection, ConnectionType } from '../types';

// Mock Database of other users in the ecosystem
const MOCK_PEERS: Peer[] = [
  { 
    id: 'p1', name: 'Sarah K.', avatar: '👩', bio: '2 years sober. Hiking enthusiast.', 
    level: 12, streak: 50, xp: 3200, role: 'Guide', tags: ['Nature', 'AA', 'Mentor'], status: 'online', lastActive: 'Now',
    lat: 39.1031, lng: -84.5120, programId: 'house_1', isSponsor: true
  },
  { 
    id: 'p2', name: 'Mike R.', avatar: '🧔', bio: 'Day 48. Focused on fitness.', 
    level: 8, streak: 48, xp: 3150, role: 'Builder', tags: ['Fitness', 'SMART'], status: 'away', lastActive: '2h ago',
    lat: 39.1225, lng: -84.5215, programId: 'house_1'
  },
  { 
    id: 'p3', name: 'Jessica T.', avatar: '👱‍♀️', bio: 'Artist in recovery. Looking for community.', 
    level: 5, streak: 30, xp: 2100, role: 'Creator', tags: ['Art', 'Meditation'], status: 'offline', lastActive: '1d ago',
    lat: 39.0950, lng: -84.4950
  },
  { 
    id: 'p4', name: 'David L.', avatar: '👨', bio: 'Just starting over. One day at a time.', 
    level: 3, streak: 12, xp: 1900, role: 'Novice', tags: ['Reading', 'NA'], status: 'online', lastActive: '5m ago',
    lat: 39.1500, lng: -84.4700, programId: 'iop_group_a'
  },
  { 
    id: 'p5', name: 'Coach Carter', avatar: '🧢', bio: 'Certified Peer Supporter.', 
    level: 50, streak: 1500, xp: 15000, role: 'Veteran', tags: ['Professional', 'Support'], status: 'online', lastActive: 'Now',
    lat: 39.1100, lng: -84.5000, isSponsor: true
  }
];

interface PeerContextType {
  peers: Peer[];
  connections: Connection[];
  addConnection: (peerId: string, type: ConnectionType) => void;
  removeConnection: (peerId: string) => void;
  getConnection: (peerId: string) => Connection | undefined;
  getPeer: (peerId: string) => Peer | undefined;
  getPeersInProgram: (programId: string) => Peer[];
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

const CONNECTIONS_STORAGE_KEY = 'rq.connections.v1';

export const PeerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [peers] = useState<Peer[]>(MOCK_PEERS);
  const [connections, setConnections] = useState<Connection[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(CONNECTIONS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error("Failed to load connections", e);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
    }
  }, [connections]);

  const addConnection = (peerId: string, type: ConnectionType) => {
    setConnections(prev => {
      // Remove existing if exists to update type, or just push
      const filtered = prev.filter(c => c.peerId !== peerId);
      return [...filtered, { peerId, type, since: new Date().toISOString() }];
    });
  };

  const removeConnection = (peerId: string) => {
    setConnections(prev => prev.filter(c => c.peerId !== peerId));
  };

  const getConnection = (peerId: string) => {
    return connections.find(c => c.peerId === peerId);
  };

  const getPeer = (peerId: string) => {
    return peers.find(p => p.id === peerId);
  };

  const getPeersInProgram = (programId: string) => {
      return peers.filter(p => p.programId === programId);
  };

  return (
    <PeerContext.Provider value={{ peers, connections, addConnection, removeConnection, getConnection, getPeer, getPeersInProgram }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeerStore = () => {
  const context = useContext(PeerContext);
  if (!context) throw new Error("usePeerStore must be used within PeerProvider");
  return context;
};
