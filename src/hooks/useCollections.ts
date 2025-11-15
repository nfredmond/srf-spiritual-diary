import { useState, useEffect } from 'react';

export interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  dateKeys: string[];
  createdAt: number;
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('srf-collections');
    if (stored) {
      try {
        setCollections(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load collections:', e);
      }
    }
  }, []);

  const saveCollections = (newCollections: Collection[]) => {
    setCollections(newCollections);
    localStorage.setItem('srf-collections', JSON.stringify(newCollections));
  };

  const createCollection = (name: string, description: string, color: string) => {
    const newCollection: Collection = {
      id: `collection_${Date.now()}`,
      name,
      description,
      color,
      dateKeys: [],
      createdAt: Date.now(),
    };
    saveCollections([...collections, newCollection]);
    return newCollection;
  };

  const deleteCollection = (id: string) => {
    saveCollections(collections.filter(c => c.id !== id));
  };

  const addToCollection = (collectionId: string, dateKey: string) => {
    const updated = collections.map(c => {
      if (c.id === collectionId && !c.dateKeys.includes(dateKey)) {
        return { ...c, dateKeys: [...c.dateKeys, dateKey] };
      }
      return c;
    });
    saveCollections(updated);
  };

  const removeFromCollection = (collectionId: string, dateKey: string) => {
    const updated = collections.map(c => {
      if (c.id === collectionId) {
        return { ...c, dateKeys: c.dateKeys.filter(k => k !== dateKey) };
      }
      return c;
    });
    saveCollections(updated);
  };

  const getCollectionsForDate = (dateKey: string) => {
    return collections.filter(c => c.dateKeys.includes(dateKey));
  };

  return {
    collections,
    createCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    getCollectionsForDate,
  };
}
