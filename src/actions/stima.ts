'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

const COORD_PRECISION = 3;

function roundCoord(coord: number): string {
  return coord.toFixed(COORD_PRECISION);
}

export async function checkIfStima(lat: number, lng: number): Promise<{ status: boolean | 'unknown' }> {
  try {
    const roundedLat = roundCoord(lat);
    const roundedLng = roundCoord(lng);
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const client = await clientPromise;
    const db = client.db('kwenukunastima');
    const collection = db.collection('stima_reports');

    const result = await collection.findOne(
      { 
        lat: roundedLat, 
        lng: roundedLng,
        updatedAt: { $gt: oneHourAgo }
      },
      { sort: { updatedAt: -1 } }
    );

    if (result) {
      return { status: result.hasStima };
    }
    return { status: 'unknown' };
  } catch (error) {
    console.error('Failed to check stima:', error);
    return { status: 'unknown' };
  }
}

export async function setIfStima(lat: number, lng: number, hasStima: boolean) {
  try {
    const roundedLat = roundCoord(lat);
    const roundedLng = roundCoord(lng);

    const client = await clientPromise;
    const db = client.db('kwenukunastima');
    const collection = db.collection('stima_reports');

    await collection.updateOne(
      { lat: roundedLat, lng: roundedLng },
      { 
        $set: { 
          hasStima, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true } // Insert if doesn't exist, update if it does
    );

    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    console.error('Failed to set stima:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function getMap() {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const client = await clientPromise;
    const db = client.db('kwenukunastima');
    const collection = db.collection('stima_reports');

    const results = await collection.find({
      updatedAt: { $gt: oneHourAgo }
    }).toArray();

    // Map the results to standard JS objects without MongoDB ObjectIds to pass to client
    return results.map(doc => ({
      lat: doc.lat,
      lng: doc.lng,
      hasStima: doc.hasStima,
      updatedAt: doc.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to get map pins:', error);
    return [];
  }
}
