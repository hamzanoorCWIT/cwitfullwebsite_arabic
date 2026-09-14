"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { escapeHtml } from "@/app/lib/escape-html";

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface GoogleMapSectionProps {
  locations?: Location[];
  /** Optional override; normally comes from NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. */
  apiKey?: string;
  className?: string;
}

// Custom map style (inline JSON — applied because the map uses no Map ID).
const MAP_STYLES = [
  {
    stylers: [
      { hue: "#ff1a00" },
      { invert_lightness: true },
      { saturation: -100 },
      { lightness: 33 },
      { gamma: 0.5 },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#2D333C" }],
  },
];

// Brand-friendly marker colours, cycled per location.
const MARKER_COLORS = [
  "#00E0C6",
  "#4F8DFF",
  "#FF5C8A",
  "#FFB020",
  "#A66BFF",
  "#37D67A",
];

function pinIconUrl(color: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C12.27 0 6 6.27 6 14c0 10.5 14 26 14 26s14-15.5 14-26C34 6.27 27.73 0 20 0z" fill="${color}"/>
      <circle cx="20" cy="14" r="6" fill="#0b0f14"/>
    </svg>`
  )}`;
}

export default function GoogleMapSection({
  locations,
  apiKey,
  className = "",
}: GoogleMapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const googleMapsApiKey =
    apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const mapLocations = locations?.filter(Boolean) ?? [];

  useEffect(() => {
    if (!mapLocations.length || !mapRef.current || !googleMapsApiKey) return;

    const container = mapRef.current;
    let cancelled = false;

    setOptions({ key: googleMapsApiKey, v: "weekly" });

    (async () => {
      try {
        const [{ Map, InfoWindow }, { Marker }, { Size, Point, LatLngBounds }] =
          await Promise.all([
            importLibrary("maps"),
            importLibrary("marker"),
            importLibrary("core"),
          ]);

        if (cancelled || !container) return;

        const map = new Map(container, {
          center: {
            lat:
              mapLocations.reduce((sum, l) => sum + l.latitude, 0) /
              mapLocations.length,
            lng:
              mapLocations.reduce((sum, l) => sum + l.longitude, 0) /
              mapLocations.length,
          },
          zoom: 10,
          styles: MAP_STYLES,
          disableDefaultUI: false,
          clickableIcons: false,
        });

        const infoWindow = new InfoWindow();
        const bounds = new LatLngBounds();

        mapLocations.forEach((location, index) => {
          const position = { lat: location.latitude, lng: location.longitude };
          const marker = new Marker({
            map,
            position,
            title: location.name,
            icon: {
              url: pinIconUrl(MARKER_COLORS[index % MARKER_COLORS.length]),
              scaledSize: new Size(40, 40),
              anchor: new Point(20, 40),
            },
          });

          bounds.extend(position);

          const openInfo = () => {
            infoWindow.setContent(
              `<div style="padding:6px 8px;color:#0b0f14;max-width:240px;">
                 <h3 style="margin:0 0 4px;font-weight:600;font-size:15px;">${escapeHtml(
                   location.name
                 )}</h3>
                 <p style="margin:0;font-size:13px;color:#555;line-height:1.4;">${escapeHtml(
                   location.address
                 )}</p>
               </div>`
            );
            infoWindow.open({ map, anchor: marker });
          };

          marker.addListener("mouseover", openInfo);
          marker.addListener("click", openInfo);
        });

        if (mapLocations.length > 1) {
          map.fitBounds(bounds, 80);
        } else {
          map.setCenter({
            lat: mapLocations[0].latitude,
            lng: mapLocations[0].longitude,
          });
          map.setZoom(14);
        }
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(mapLocations), googleMapsApiKey]);

  if (!mapLocations.length) return null;

  return (
    <section
      className={`relative md:min-h-[800px] h-[400px] md:py-20 py-10 bg-black overflow-hidden ${className}`}
    >
      <div className="relative z-10 mx-auto px-3 md:px-0">
        <div className="w-full md:h-[800px] h-[400px] overflow-hidden rounded-lg">
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />
        </div>
      </div>
    </section>
  );
}