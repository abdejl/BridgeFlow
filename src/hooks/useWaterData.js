// src/hooks/useWaterData.js
import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";
import { createMockDataStream } from "../data/mockData";

const PULSE_INTERVAL_MS = 3000;

/**
 * Optimistic UI hook for water sensor data.
 *
 * 1. Starts a mock data stream that pulses every 3 seconds — UI is alive instantly.
 * 2. Subscribes to Firestore in the background.
 * 3. When live data arrives, stops the mock stream and swaps to real data.
 * 4. If Firestore fails, mock keeps pulsing — the demo never breaks.
 */
export function useWaterData() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [isLive, setIsLive]   = useState(false);

  const streamRef = useRef(null);
  const firestoreUnsubRef = useRef(null);

  useEffect(() => {
    // --- Mock pulse stream ---
    const stream = createMockDataStream((snapshot) => {
      setData(snapshot);
    }, PULSE_INTERVAL_MS);

    streamRef.current = stream;
    stream.start();

    // --- Firestore background subscription ---
    if (db) {
      try {
        const q = query(
          collection(db, "water_data"),
          orderBy("sectorId", "asc")
        );

        firestoreUnsubRef.current = onSnapshot(
          q,
          (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            if (docs.length > 0) {
              // Kill the mock pulse — real data has arrived.
              stream.stop();
              setData(docs);
              setIsLive(true);
            }
          },
          (err) => {
            console.error("Firestore error:", err);
            setError(err.message);
            // Mock stream keeps pulsing — demo continues.
          }
        );
      } catch (err) {
        console.warn("Firestore subscription failed:", err.message);
        // Mock stream keeps pulsing — demo continues.
      }
    }

    // Cleanup on unmount.
    return () => {
      stream.stop();
      if (firestoreUnsubRef.current) {
        firestoreUnsubRef.current();
      }
    };
  }, []);

  return { data, loading, error, isLive };
}
