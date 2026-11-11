"use client";

import { PinMap, type MapPin } from "@vamos-ui/react";

const stores: MapPin[] = [
  { id: "karakoy", lat: 41.024, lng: 28.976, label: "Karaköy", description: "38 orders today · open until 21:00" },
  { id: "moda", lat: 40.984, lng: 29.027, label: "Moda", description: "52 orders today · open until 22:00" },
  { id: "bebek", lat: 41.077, lng: 29.043, label: "Bebek", description: "21 orders today · open until 20:00" },
  { id: "atasehir", lat: 40.992, lng: 29.124, label: "Ataşehir", description: "Closed for refurbishment", tone: "neutral" },
  { id: "bakirkoy", lat: 40.98, lng: 28.872, label: "Bakırköy", description: "29 orders today · open until 21:00" },
  { id: "tuzla", lat: 40.83, lng: 29.3, label: "Tuzla cross-dock", description: "Warehouse · 140 parcels out", tone: "info" },
];

export default function PinMapDemo() {
  return (
    <div className="w-full max-w-2xl">
      <PinMap aria-label="Stores and warehouses in Istanbul" pins={stores} defaultSelectedId="moda" bounds={{ north: 41.14, south: 40.8, west: 28.78, east: 29.36 }} />
    </div>
  );
}
