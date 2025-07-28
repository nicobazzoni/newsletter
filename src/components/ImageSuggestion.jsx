// src/components/ImageSuggestion.jsx
import React, { useEffect, useState } from 'react';

export default function ImageSuggestion({ keywords, onSelect }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        let url;
        let usingFallback = false;

        const query = keywords.length > 0 ? keywords.join(' ') : '';
        console.log('🟡 Fetching images for:', query || 'curated fallback');

        if (query && query.length > 2) {
          url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6`;
        } else {
          url = `https://api.pexels.com/v1/curated?per_page=6`;
          usingFallback = true;
        }

        const res = await fetch(url, {
          headers: {
            Authorization: import.meta.env.VITE_PEXELS_API_KEY,
          },
        });

        if (!res.ok) {
          console.error('🔴 Pexels API error:', res.status, await res.text());
          return;
        }

        const data = await res.json();
        if (data.photos.length === 0 && !usingFallback) {
          // fallback to curated
          console.warn('🟠 No images found for keywords, falling back to curated.');
          const fallbackRes = await fetch(`https://api.pexels.com/v1/curated?per_page=6`, {
            headers: {
              Authorization: import.meta.env.VITE_PEXELS_API_KEY,
            },
          });
          const fallbackData = await fallbackRes.json();
          setImages(fallbackData.photos);
        } else {
          setImages(data.photos);
        }

      } catch (err) {
        console.error('❌ Image fetch error:', err);
      }
    };

    fetchImages();
  }, [keywords]);

  return (
    <div className="overflow-x-auto flex gap-2 mt-2">
      {images.length === 0 ? (
        <p className="text-sm text-gray-500">No images found.</p>
      ) : (
        images.map((img) => (
          <img
            key={img.id}
            src={img.src.medium}
            alt={img.alt}
            className="w-32 h-20 object-cover rounded cursor-pointer hover:opacity-80"
            onClick={() => onSelect(img.src.large)}
          />
        ))
      )}
    </div>
  );
}