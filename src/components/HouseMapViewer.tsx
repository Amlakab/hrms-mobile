import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, spacing } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

interface HouseMapViewerProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  city: string;
  price?: number;
  height?: number;
}

export const HouseMapViewer: React.FC<HouseMapViewerProps> = ({
  latitude = 9.03,
  longitude = 38.74,
  title,
  address,
  city,
  price,
  height = 360,
}) => {
  const { isAmharic } = useLanguage();

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
      .custom-popup { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; }
      .custom-popup h4 { margin: 0 0 4px 0; color: #0284c7; font-size: 13px; font-weight: 700; }
      .custom-popup p { margin: 0; color: #475569; }
      .price-tag { color: #059669; font-weight: 700; margin-top: 4px; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const lat = ${latitude};
      const lng = ${longitude};
      const map = L.map('map', { zoomControl: false }).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(\`
        <div class="custom-popup">
          <h4>\${${JSON.stringify(title || 'Property')}}</h4>
          <p>\${${JSON.stringify(address || 'Location')}}</p>
          \${${price ? JSON.stringify(`<div class="price-tag">ETB ${price.toLocaleString()}</div>`) : "''"}}
        </div>
      \`).openPopup();
    </script>
  </body>
</html>
  `;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
      />

      {/* Floating Bottom Card */}
      <View style={styles.floatingCard}>
        <View style={styles.infoCol}>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color="#00FFFF" />
            <Text style={styles.addressText} numberOfLines={1}>
              {address || 'Addis Ababa'}, {city || 'Ethiopia'}
            </Text>
          </View>
          <Text style={styles.coordsText}>
            Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.mapBtn}
          onPress={handleOpenGoogleMaps}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={14} color="#FFFFFF" />
          <Text style={styles.mapBtnText}>
            {isAmharic ? 'ጉግል ካርታ' : 'Google Maps'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
  },
  webview: {
    flex: 1,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: borderRadius.md,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  coordsText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
    marginLeft: 20,
  },
  mapBtn: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
  },
  mapBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
