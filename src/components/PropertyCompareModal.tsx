import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { borderRadius, spacing, typography } from '../constants/theme';
import { House } from '../types';

interface PropertyCompareModalProps {
  visible: boolean;
  onClose: () => void;
  properties: House[];
  onSelectProperty?: (house: House) => void;
  onRemoveProperty?: (houseId: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80';

export const PropertyCompareModal: React.FC<PropertyCompareModalProps> = ({
  visible,
  onClose,
  properties,
  onSelectProperty,
  onRemoveProperty,
}) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  if (properties.length === 0) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.modalBg }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {isAmharic ? 'ቤቶችን እርስ በእርስ ያወዳድሩ' : 'Compare Properties'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {properties.length} {isAmharic ? 'የተመረጡ ቤቶች' : 'properties selected'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
            {properties.map((house) => (
              <View
                key={house._id}
                style={[styles.colCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              >
                {/* Remove button */}
                {onRemoveProperty && (
                  <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: colors.surface }]}
                    onPress={() => onRemoveProperty(house._id)}
                  >
                    <Ionicons name="close" size={14} color={colors.text} />
                  </TouchableOpacity>
                )}

                <Image source={{ uri: FALLBACK_IMAGE }} style={styles.colImage} resizeMode="cover" />

                <Text style={[styles.colTitle, { color: colors.text }]} numberOfLines={2}>
                  {house.title}
                </Text>

                <Text style={[styles.colPrice, { color: colors.primary }]}>
                  ETB {(house.price || 0).toLocaleString()}
                </Text>

                {/* Specs comparison */}
                <View style={[styles.featureRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.featLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'አይነት' : 'Type'}
                  </Text>
                  <Text style={[styles.featVal, { color: colors.text }]}>{house.propertyType}</Text>
                </View>

                <View style={[styles.featureRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.featLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'መኝታ' : 'Bedrooms'}
                  </Text>
                  <Text style={[styles.featVal, { color: colors.text }]}>
                    {house.details?.bedrooms || 0}
                  </Text>
                </View>

                <View style={[styles.featureRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.featLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'መታጠቢያ' : 'Bathrooms'}
                  </Text>
                  <Text style={[styles.featVal, { color: colors.text }]}>
                    {house.details?.bathrooms || 0}
                  </Text>
                </View>

                <View style={[styles.featureRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.featLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'ስፋት' : 'Area'}
                  </Text>
                  <Text style={[styles.featVal, { color: colors.text }]}>
                    {house.details?.area || 0} m²
                  </Text>
                </View>

                <View style={[styles.featureRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.featLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'ቦታ' : 'City'}
                  </Text>
                  <Text style={[styles.featVal, { color: colors.text }]}>
                    {house.location?.city || 'Addis Ababa'}
                  </Text>
                </View>

                <View style={[styles.featureRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.featLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'ማረጋገጫ' : 'Verified'}
                  </Text>
                  <Text
                    style={[
                      styles.featVal,
                      { color: house.verificationStatus === 'VERIFIED' ? '#10B981' : colors.textMuted },
                    ]}
                  >
                    {house.verificationStatus === 'VERIFIED' ? '✓ Verified' : 'Standard'}
                  </Text>
                </View>

                {onSelectProperty && (
                  <TouchableOpacity
                    style={[styles.viewBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      onClose();
                      onSelectProperty(house);
                    }}
                  >
                    <Text style={styles.viewBtnText}>{isAmharic ? 'ይመልከቱ' : 'View Detail'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.h3,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  colCard: {
    width: 220,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  colImage: {
    width: '100%',
    height: 110,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  colTitle: {
    fontSize: 14,
    fontWeight: '700',
    minHeight: 38,
  },
  colPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 4,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  featLabel: {
    fontSize: 12,
  },
  featVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewBtn: {
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
