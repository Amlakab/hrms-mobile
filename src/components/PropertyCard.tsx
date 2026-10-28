import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { House } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { borderRadius, spacing, typography } from '../constants/theme';
import { Badge } from './Badge';

import { getHouseImageUrl } from '../utils/apiData';

interface PropertyCardProps {
  house: House;
  onPress: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';

export const PropertyCard: React.FC<PropertyCardProps> = ({
  house,
  onPress,
  isSaved = false,
  onToggleSave,
}) => {
  const { colors, isDark } = useTheme();
  const { t, isAmharic } = useLanguage();
  const [imageError, setImageError] = useState(false);

  // Determine property image uri
  let imageUri = FALLBACK_IMAGE;
  if (!imageError) {
    imageUri = getHouseImageUrl(house);
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US');
  };

  const getTransactionLabel = () => {
    switch (house.transactionType) {
      case 'BUY':
        return isAmharic ? 'የሚሸጥ' : 'FOR SALE';
      case 'SHORT_STAY':
        return isAmharic ? 'አጭር ቆይታ' : 'SHORT STAY';
      case 'RENT':
      default:
        return isAmharic ? 'የሚከራይ' : 'FOR RENT';
    }
  };

  const isVerified = house.verificationStatus === 'VERIFIED';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Property Thumbnail Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />

        {/* Transaction Type Tag */}
        <View style={styles.badgeTopLeft}>
          <View
            style={[
              styles.transactionPill,
              {
                backgroundColor:
                  house.transactionType === 'BUY' ? '#8B5CF6' : colors.primary,
              },
            ]}
          >
            <Text style={styles.transactionText}>{getTransactionLabel()}</Text>
          </View>
        </View>

        {/* Verified Badge */}
        {isVerified && (
          <View style={styles.badgeTopRight}>
            <View style={styles.verifiedPill}>
              <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
              <Text style={styles.verifiedText}>
                {isAmharic ? 'የተረጋገጠ' : 'Verified'}
              </Text>
            </View>
          </View>
        )}

        {/* Favorite Button */}
        {onToggleSave && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)' }]}
            onPress={onToggleSave}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={18}
              color={isSaved ? '#EF4444' : colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Card Content Body */}
      <View style={styles.body}>
        {/* Price & Status Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceWrapper}>
            <Text style={[styles.currencyText, { color: colors.primary }]}>ETB </Text>
            <Text style={[styles.priceText, { color: colors.text }]}>
              {formatPrice(house.price || 0)}
            </Text>
            {house.transactionType !== 'BUY' && (
              <Text style={[styles.periodText, { color: colors.textMuted }]}>
                {isAmharic ? '/ወር' : '/mo'}
              </Text>
            )}
          </View>

          <Badge
            label={t(`status.${(house.status || 'AVAILABLE').toLowerCase()}`, house.status)}
            variant={
              house.status === 'AVAILABLE'
                ? 'success'
                : house.status === 'SOLD' || house.status === 'RENTED'
                ? 'error'
                : 'warning'
            }
            size="sm"
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {house.title || 'Untitled Property'}
        </Text>

        {/* Location Row */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.locationText, { color: colors.textMuted }]} numberOfLines={1}>
            {house.location?.neighborhood ? `${house.location.neighborhood}, ` : ''}
            {house.location?.city || 'Addis Ababa'}, {house.location?.state || 'Ethiopia'}
          </Text>
        </View>

        {/* Property Features Spec Strip */}
        <View style={[styles.featuresStrip, { borderTopColor: colors.border }]}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={15} color={colors.primary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {house.details?.bedrooms || 0} {isAmharic ? 'መኝታ' : 'Beds'}
            </Text>
          </View>

          <View style={styles.specDivider} />

          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={15} color={colors.primary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {house.details?.bathrooms || 0} {isAmharic ? 'መታጠቢያ' : 'Baths'}
            </Text>
          </View>

          <View style={styles.specDivider} />

          <View style={styles.specItem}>
            <Ionicons name="scan-outline" size={15} color={colors.primary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {house.details?.area || 0} m²
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 185,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  transactionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  transactionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTopRight: {
    position: 'absolute',
    top: 10,
    right: 48,
  },
  verifiedPill: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
  },
  periodText: {
    fontSize: 12,
    marginLeft: 3,
  },
  title: {
    ...typography.h4,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    ...typography.body2,
    flex: 1,
  },
  featuresStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontSize: 12,
    fontWeight: '500',
  },
  specDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#94A3B833',
  },
});
