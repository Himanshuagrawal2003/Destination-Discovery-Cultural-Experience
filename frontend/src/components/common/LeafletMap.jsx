import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues with bundlers (like Vite)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function LeafletMap({ lat, lng, popupText, zoom = 13 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use default coordinates if not provided or invalid
    const mapLat = typeof lat === 'number' && !isNaN(lat) ? lat : 0;
    const mapLng = typeof lng === 'number' && !isNaN(lng) ? lng : 0;

    // Initialize Map instance
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([mapLat, mapLng], zoom);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    } else {
      // If map is already initialized, just update its view
      mapInstanceRef.current.setView([mapLat, mapLng], zoom);
    }

    // Update or create Marker
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([mapLat, mapLng]);
    } else {
      markerInstanceRef.current = L.marker([mapLat, mapLng])
        .addTo(mapInstanceRef.current);
    }

    // Bind Popup
    if (popupText) {
      markerInstanceRef.current.bindPopup(`<b>${popupText}</b>`).openPopup();
    }

    // Cleanup on unmount
    return () => {
      // Wait, we should only destroy if unmounting completely
    };
  }, [lat, lng, popupText, zoom]);

  // Handle cleanup separately to ensure clean canvas recycling
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full z-10 border-none rounded-b-2xl"
      style={{ minHeight: '100%' }}
    />
  );
}
