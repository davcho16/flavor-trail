// MapView.js
// React component that displays restaurant locations on an interactive map using Leaflet.
// Filters out invalid or missing coordinates before rendering markers.
// Each marker includes a popup showing the restaurant name and address.

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Customizes default Leaflet marker icons for use in React
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = ({ locations }) => {
  // Filters out invalid lat/lng values to avoid runtime errors
  const filtered = locations.filter(
    (loc) =>
      loc.latitude !== null &&
      loc.longitude !== null &&
      !isNaN(loc.latitude) &&
      !isNaN(loc.longitude)
  );

  return (
    <MapContainer
      center={[39.5, -98.35]} // Default map center
      zoom={4}
      scrollWheelZoom={true}
      style={{ height: '500px', width: '100%', marginBottom: '2rem' }}
    >
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filtered.map((loc, index) => (
        <Marker
          key={index}
          position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
        >
          <Popup>
            <strong>{loc.restaurant_name}</strong><br />
            {loc.street_address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
