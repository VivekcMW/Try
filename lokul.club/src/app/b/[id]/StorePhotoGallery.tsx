"use client";

import { useState } from "react";
import { Camera } from "lucide-react";

export interface StorePhoto {
  id: string;
  url: string;
  caption: string;
  addedBy: "owner" | "neighbor";
  byName: string;
}

export function StorePhotoGallery({ photos }: Readonly<{ photos: StorePhoto[] }>) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = photos[activeIdx];

  return (
    <div>
      {/* Cover photo */}
      <div className="relative h-52 w-full sm:h-64 overflow-hidden">
        <img
          key={active.id}
          src={active.url}
          alt={active.caption}
          className="h-full w-full object-cover transition-opacity duration-200"
        />
        {/* Total photo count badge */}
        <span
          className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        >
          <Camera size={11} /> {photos.length} photos
        </span>

      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div
          className="flex gap-1.5 overflow-x-auto scrollbar-hide px-2 py-2"
          style={{ background: "var(--color-gray-100)" }}
        >
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className="relative shrink-0 h-16 w-16 overflow-hidden rounded-md focus:outline-none"
              style={{
                outline: i === activeIdx ? "2px solid var(--color-brand-500)" : "2px solid transparent",
                outlineOffset: "1px",
              }}
              aria-label={`View ${photo.caption}`}
              aria-pressed={i === activeIdx}
            >
              <img
                src={photo.url.replace("w=800&h=480", "w=200&h=200")}
                alt={photo.caption}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
