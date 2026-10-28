import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { borderRadius, spacing, typography } from '../constants/theme';
import { PropertyType, TransactionType } from '../types';

export interface FilterCriteria {
  transactionType: TransactionType | 'ALL';
  propertyType: PropertyType | 'ALL';
  minBedrooms: number;
  maxPrice: number | null;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterCriteria;
  onApply: (filters: FilterCriteria) => void;
  onReset: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();

  const [localFilters, setLocalFilters] = useState<FilterCriteria>(filters);

  const transactionTypes: Array<{ key: TransactionType | 'ALL'; label: string }> = [
    { key: 'ALL', label: isAmharic ? 'ሁሉም' : 'All' },
    { key: 'RENT', label: isAmharic ? 'የሚከራይ' : 'For Rent' },
    { key: 'BUY', label: isAmharic ? 'የሚሸጥ' : 'For Sale' },
    { key: 'SHORT_STAY', label: isAmharic ? 'አጭር ቆይታ' : 'Short Stay' },
  ];

  const propertyTypes: Array<{ key: PropertyType | 'ALL'; label: string }> = [
    { key: 'ALL', label: isAmharic ? 'ሁሉም አይነቶች' : 'All Types' },
    { key: 'APARTMENT', label: isAmharic ? 'አፓርታማ' : 'Apartment' },
    { key: 'VILLA', label: isAmharic ? 'ቪላ' : 'Villa' },
    { key: 'CONDO', label: isAmharic ? 'ኮንዶሚኒየም' : 'Condominium' },
    { key: 'HOUSE', label: isAmharic ? 'የመኖሪያ ቤት' : 'House' },
    { key: 'LAND', label: isAmharic ? 'መሬት' : 'Land' },
  ];

  const bedroomOptions = [0, 1, 2, 3, 4, 5];

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterCriteria = {
      transactionType: 'ALL',
      propertyType: 'ALL',
      minBedrooms: 0,
      maxPrice: null,
    };
    setLocalFilters(defaultFilters);
    onReset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.modalBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('action.filter', 'Filters')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Transaction Type */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isAmharic ? 'የግብይት አይነት' : 'Transaction Purpose'}
            </Text>
            <View style={styles.chipsRow}>
              {transactionTypes.map((item) => {
                const isSelected = localFilters.transactionType === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, transactionType: item.key })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Property Type */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isAmharic ? 'የቤት አይነት' : 'Property Type'}
            </Text>
            <View style={styles.chipsRow}>
              {propertyTypes.map((item) => {
                const isSelected = localFilters.propertyType === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, propertyType: item.key })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bedrooms Count */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isAmharic ? 'አነስተኛ የመኝታ ክፍሎች' : 'Minimum Bedrooms'}
            </Text>
            <View style={styles.chipsRow}>
              {bedroomOptions.map((num) => {
                const isSelected = localFilters.minBedrooms === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.bedChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, minBedrooms: num })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {num === 0 ? (isAmharic ? 'ማናቸውም' : 'Any') : `${num}+`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Maximum Price (ETB) */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isAmharic ? 'ከፍተኛ ዋጋ (በብር)' : 'Maximum Price (ETB)'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              keyboardType="numeric"
              placeholder={isAmharic ? 'ምሳሌ፡ 50000' : 'e.g. 50000'}
              placeholderTextColor={colors.textMuted}
              value={localFilters.maxPrice ? String(localFilters.maxPrice) : ''}
              onChangeText={(val) => {
                const numeric = parseInt(val.replace(/[^0-9]/g, ''), 10);
                setLocalFilters({ ...localFilters, maxPrice: isNaN(numeric) ? null : numeric });
              }}
            />
          </ScrollView>

          {/* Bottom Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>
                {t('action.reset', 'Reset')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={styles.applyBtnText}>{t('action.apply', 'Apply Filters')}</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '80%',
    paddingBottom: 20,
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
  closeBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
  bedChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
