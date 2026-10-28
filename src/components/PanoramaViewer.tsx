import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface PanoramaViewerProps {
  imageUrl: string;
  height?: number;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  imageUrl,
  height = 360,
}) => {
  const [loading, setLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(true);

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0f172a; touch-action: none; }
      #container { width: 100%; height: 100%; }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  </head>
  <body>
    <div id="container"></div>
    <script>
      let camera, scene, renderer;
      let isUserInteracting = false;
      let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
      let lon = 0, onPointerDownLon = 0;
      let lat = 0, onPointerDownLat = 0;
      let phi = 0, theta = 0;
      let autoRotate = ${isRotating};

      init();
      animate();

      function init() {
        const container = document.getElementById('container');
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);

        scene = new THREE.Scene();

        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const loader = new THREE.TextureLoader();
        loader.crossOrigin = 'anonymous';
        loader.load('${imageUrl}', function(texture) {
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        });

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        container.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        window.addEventListener('resize', onWindowResize);
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function onPointerDown(event) {
        if (event.isPrimary === false) return;
        isUserInteracting = true;
        onPointerDownMouseX = event.clientX;
        onPointerDownMouseY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
      }

      function onPointerMove(event) {
        if (isUserInteracting === true) {
          lon = (onPointerDownMouseX - event.clientX) * 0.15 + onPointerDownLon;
          lat = (event.clientY - onPointerDownMouseY) * 0.15 + onPointerDownLat;
        }
      }

      function onPointerUp() {
        isUserInteracting = false;
      }

      function animate() {
        requestAnimationFrame(animate);
        update();
      }

      function update() {
        if (!isUserInteracting && autoRotate) {
          lon += 0.15;
        }
        lat = Math.max(-85, Math.min(85, lat));
        phi = THREE.MathUtils.degToRad(90 - lat);
        theta = THREE.MathUtils.degToRad(lon);

        const targetX = 500 * Math.sin(phi) * Math.cos(theta);
        const targetY = 500 * Math.cos(phi);
        const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(targetX, targetY, targetZ);
        renderer.render(scene, camera);
      }
    </script>
  </body>
</html>
  `;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
      />

      {/* 360 Tour Badge */}
      <View style={styles.badge}>
        <Ionicons name="scan-outline" size={16} color="#00FFFF" />
        <Text style={styles.badgeText}>360° INTERACTIVE TOUR</Text>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00FFFF" />
          <Text style={styles.loadingText}>Loading 360° Virtual Panorama...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  badge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
});
