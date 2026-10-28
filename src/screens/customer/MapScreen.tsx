import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { House, TransactionType } from '../../types';

const { width } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80';

import { extractArray } from '../../utils/apiData';

export const MapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | 'ALL'>('ALL');

  useEffect(() => {
    const loadMapData = async () => {
      try {
        let res;
        try {
          res = await api.get('/public/houses');
        } catch {
          res = await api.get('/houses');
        }
        const data = extractArray<House>(res, 'houses');
        setHouses(data);
        if (data.length > 0) {
          setSelectedHouse(data[0]);
        }
      } catch (err: any) {
        console.warn('Map houses load err', err.message);
      }
    };
    loadMapData();
  }, []);

  const filteredHouses = houses.filter((h) => {
    if (selectedTransaction !== 'ALL' && h.transactionType !== selectedTransaction) {
      return false;
    }
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'በካርታ ይፈልጉ' : 'Interactive Map Search'}
        subtitle={isAmharic ? 'በአዲስ አበባ እና ዙሪያዋ የሚገኙ ቤቶች' : 'Explore properties across Addis Ababa'}
        showBack={true}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'ALL', label: isAmharic ? 'ሁሉም' : 'All' },
          { key: 'RENT', label: isAmharic ? 'የሚከራይ' : 'For Rent' },
          { key: 'BUY', label: isAmharic ? 'የሚሸጥ' : 'For Sale' },
        ].map((item) => {
          const isSelected = selectedTransaction === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedTransaction(item.key as any)}
            >
              <Text style={[styles.pillText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Map Graphic Canvas / Pins Presentation */}
      <View style={[styles.mapCanvas, { backgroundColor: isDark ? '#0B1528' : '#E2E8F0' }]}>
        {/* Stylized Grid Lines representing City map sectors */}
        <View style={styles.gridOverlay}>
          <View style={[styles.gridRoadH, { top: '35%' }]} />
          <View style={[styles.gridRoadH, { top: '65%' }]} />
          <View style={[styles.gridRoadV, { left: '30%' }]} />
          <View style={[styles.gridRoadV, { left: '70%' }]} />

          <View style={styles.centerCityBadge}>
            <Text style={styles.centerCityText}>Addis Ababa • Bole / Kazanchis</Text>
          </View>
        </View>

        {/* Dynamic Property Map Marker Pins */}
        {filteredHouses.slice(0, 6).map((house, idx) => {
          const isSelected = selectedHouse?._id === house._id;
          const pinPositions = [
            { top: '25%', left: '25%' },
            { top: '30%', left: '60%' },
            { top: '50%', left: '40%' },
            { top: '55%', left: '75%' },
            { top: '70%', left: '20%' },
            { top: '75%', left: '55%' },
          ];
          const pos = pinPositions[idx % pinPositions.length];

          return (
            <TouchableOpacity
              key={house._id}
              style={[
                styles.mapMarker,
                pos as any,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? '#FFFFFF' : colors.primary,
                  transform: [{ scale: isSelected ? 1.15 : 1 }],
                },
              ]}
              onPress={() => setSelectedHouse(house)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="home"
                size={13}
                color={isSelected ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  styles.markerPrice,
                  { color: isSelected ? '#FFFFFF' : colors.text },
                ]}
              >
                {Math.round((house.price || 0) / 1000)}k
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Selected Property Sheet Card */}
      {selectedHouse && (
        <View style={[styles.bottomCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Image source={{ uri: FALLBACK_IMAGE }} style={styles.cardThumb} />

          <View style={{ flex: 1 }}>
            <View style={styles.cardHeaderRow}>
              <Badge
                label={selectedHouse.transactionType || 'RENT'}
                variant={selectedHouse.transactionType === 'BUY' ? 'primary' : 'success'}
                size="sm"
              />
              {selectedHouse.verificationStatus === 'VERIFIED' && (
                <View style={styles.miniVerified}>
                  <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                  <Text style={styles.miniVerifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedHouse.title}
            </Text>

            <Text style={[styles.cardPrice, { color: colors.primary }]}>
              ETB {(selectedHouse.price || 0).toLocaleString()}
            </Text>

            <Text style={[styles.cardLoc, { color: colors.textMuted }]} numberOfLines={1}>
              {selectedHouse.location?.city || 'Addis Ababa'} • {selectedHouse.details?.bedrooms || 0} Beds • {selectedHouse.details?.area || 0} m²
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.arrowBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('PropertyDetail', { house: selectedHouse })}
          >
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
  },
  gridRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  centerCityBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.round,
  },
  centerCityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  mapMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerPrice: {
    fontSize: 11,
    fontWeight: '800',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 20,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  cardThumb: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  miniVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  miniVerifiedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 2,
  },
  cardLoc: {
    fontSize: 11,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
