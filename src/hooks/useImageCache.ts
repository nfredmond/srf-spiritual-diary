import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { GeneratedImage } from '../types/ImageProvider';

interface ImageDB extends DBSchema {
  images: {
    key: string;
    value: GeneratedImage;
  };
}

let db: IDBPDatabase<ImageDB> | null = null;

async function getDB() {
  if (db) return db;
  
  db = await openDB<ImageDB>('srf-diary-images', 1, {
    upgrade(database) {
      database.createObjectStore('images');
    },
  });
  
  return db;
}

export async function cacheImage(image: GeneratedImage) {
  const database = await getDB();
  await database.put('images', image, image.dateKey);
}

export async function getCachedImage(dateKey: string): Promise<GeneratedImage | null> {
  const database = await getDB();
  return (await database.get('images', dateKey)) || null;
}

export async function getAllCachedImages(): Promise<GeneratedImage[]> {
  const database = await getDB();
  return await database.getAll('images');
}

