import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { borderRadius, spacing } from '../constants/theme';
import { FloorPlanRoom } from '../types';

interface FloorPlanViewerProps {
  floorPlanUrl?: string;
  rooms?: FloorPlanRoom[];
  totalArea?: number;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  floorPlanUrl,
  rooms = [],
  totalArea,
}) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null);

  const defaultRooms: FloorPlanRoom[] = rooms.length > 0 ? rooms : [
    { name: 'Living & Dining Room', dimensions: '7.5m x 5.8m', areaSqM: 43.5 },
    { name: 'Master Bedroom', dimensions: '5.0m x 4.2m', areaSqM: 21.0 },
    { name: 'Kitchen & Pantry', dimensions: '4.2m x 3.5m', areaSqM: 14.7 },
    { name: 'Bedroom 2', dimensions: '4.0m x 3.6m', areaSqM: 14.4 },
    { name: 'Balcony / Terrace', dimensions: '5.5m x 2.0m', areaSqM: 11.0 },
  ];

  const calculatedTotalArea =
    totalArea || defaultRooms.reduce((acc, r) => acc + (r.areaSqM || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header Stat Strip */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
            <Ionicons name="scan-outline" size={18} color="#06B6D4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isAmharic ? 'የቤት ንድፍ እና የክፍሎች ስፋት' : 'Architectural Floor Plan'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {isAmharic ? 'የክፍሎች ዝርዝር ልኬት' : 'Room dimensions & architectural layout'}
            </Text>
          </View>
        </View>

        <View style={styles.areaBadge}>
          <Text style={styles.areaBadgeText}>
            {calculatedTotalArea.toFixed(1)} m²
          </Text>
        </View>
      </View>

      {/* Visual Canvas or Schematic Diagram */}
      {floorPlanUrl ? (
        <View style={[styles.imageWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
          <Image
            source={{ uri: floorPlanUrl }}
            style={styles.floorPlanImage}
            resizeMode="contain"
          />
        </View>
      ) : (
        /* Vector Architectural Schematic Representation */
        <View style={[styles.schematicBox, { borderColor: colors.border, backgroundColor: isDark ? '#0A192F' : '#F8FAFC' }]}>
          <View style={styles.blueprintGrid}>
            <View style={styles.blueprintRow}>
              <View
                style={[
                  styles.roomCell,
                  { flex: 2, borderColor: selectedRoomIndex === 0 ? '#06B6D4' : '#64748B' },
                ]}
              >
                <Text style={styles.blueprintRoomName}>Living & Dining</Text>
                <Text style={styles.blueprintRoomDim}>7.5m × 5.8m (43.5m²)</Text>
              </View>
              <View
                style={[
                  styles.roomCell,
                  { flex: 1, borderColor: selectedRoomIndex === 2 ? '#06B6D4' : '#64748B' },
                ]}
              >
                <Text style={styles.blueprintRoomName}>Kitchen</Text>
                <Text style={styles.blueprintRoomDim}>4.2m × 3.5m</Text>
              </View>
            </View>

            <View style={styles.blueprintRow}>
              <View
                style={[
                  styles.roomCell,
                  { flex: 1.5, borderColor: selectedRoomIndex === 1 ? '#06B6D4' : '#64748B' },
                ]}
              >
                <Text style={styles.blueprintRoomName}>Master Bed</Text>
                <Text style={styles.blueprintRoomDim}>5.0m × 4.2m</Text>
              </View>
              <View
                style={[
                  styles.roomCell,
                  { flex: 1.2, borderColor: selectedRoomIndex === 3 ? '#06B6D4' : '#64748B' },
                ]}
              >
                <Text style={styles.blueprintRoomName}>Bedroom 2</Text>
                <Text style={styles.blueprintRoomDim}>4.0m × 3.6m</Text>
              </View>
              <View
                style={[
                  styles.roomCell,
                  { flex: 0.8, borderColor: selectedRoomIndex === 4 ? '#06B6D4' : '#64748B' },
                ]}
              >
                <Text style={styles.blueprintRoomName}>Balcony</Text>
                <Text style={styles.blueprintRoomDim}>5.5m × 2.0m</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Room Dimensions Breakdown List */}
      <Text style={[styles.breakdownHeader, { color: colors.text }]}>
        {isAmharic ? 'የክፍሎች ዝርዝር መረጃ' : 'Room Dimension Specifications'}
      </Text>

      <View style={styles.roomsList}>
        {defaultRooms.map((room, idx) => {
          const isSelected = selectedRoomIndex === idx;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedRoomIndex(isSelected ? null : idx)}
              style={[
                styles.roomCard,
                {
                  backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : colors.surfaceSecondary,
                  borderColor: isSelected ? '#06B6D4' : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.roomIconWrap}>
                <Ionicons name="home-outline" size={16} color="#06B6D4" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.roomNameText, { color: colors.text }]}>{room.name}</Text>
                <Text style={[styles.roomDimText, { color: colors.textMuted }]}>
                  {room.dimensions}
                </Text>
              </View>

              <View style={styles.roomAreaPill}>
                <Text style={styles.roomAreaPillText}>{room.areaSqM} m²</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  areaBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  areaBadgeText: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '800',
  },
  imageWrap: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  floorPlanImage: {
    width: '100%',
    height: '100%',
  },
  schematicBox: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  blueprintGrid: {
    flex: 1,
    gap: 6,
  },
  blueprintRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  roomCell: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
  },
  blueprintRoomName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06B6D4',
  },
  blueprintRoomDim: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  breakdownHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  roomsList: {
    gap: spacing.xs,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 10,
  },
  roomIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roomDimText: {
    fontSize: 11,
    marginTop: 1,
  },
  roomAreaPill: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  roomAreaPillText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '700',
  },
});
