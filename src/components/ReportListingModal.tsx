import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { borderRadius, spacing, typography } from '../constants/theme';
import api from '../config/api';
import { House } from '../types';

interface ReportListingModalProps {
  visible: boolean;
  onClose: () => void;
  house: House;
}

export const ReportListingModal: React.FC<ReportListingModalProps> = ({
  visible,
  onClose,
  house,
}) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const [reason, setReason] = useState('MISLEADING_PRICE');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    { key: 'MISLEADING_PRICE', label: isAmharic ? 'የተሳሳተ ዋጋ' : 'Misleading Price' },
    { key: 'FRAUD_SCAM', label: isAmharic ? 'ማጭበርበር / አጠራጣሪ' : 'Fraud / Scam' },
    { key: 'FAKE_PHOTOS', label: isAmharic ? 'የውሸት ፎቶዎች' : 'Fake Photos' },
    { key: 'DUPLICATE_LISTING', label: isAmharic ? 'የተደገመ ምዝገባ' : 'Duplicate Listing' },
    { key: 'INCORRECT_LOCATION', label: isAmharic ? 'የተሳሳተ አድራሻ' : 'Incorrect Location' },
  ];

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Required',
        isAmharic ? 'እባክዎ የተመለከቱትን ችግር በዝርዝር ያስረዱ' : 'Please provide specific details explaining the issue.'
      );
      return;
    }

    try {
      setLoading(true);
      await api.post('/reviews/report', {
        houseId: house._id,
        reason,
        description: description.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
        reporterEmail: reporterEmail.trim() || undefined,
      });

      Alert.alert(
        isAmharic ? 'ሪፖርት ተልኳል' : 'Report Submitted',
        isAmharic
          ? 'ስለ ጥቆማዎ እናመሰግናለን። የአስተዳዳሪው ቡድን ንብረቱን በአፋጣኝ ይመረምራል።'
          : 'Thank you for your report. The administration team will inspect this listing immediately.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || 'Failed to submit report'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.modalBg }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {isAmharic ? 'አጠራጣሪ ንብረት ሪፖርት ያድርጉ' : 'Report Listing'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                {house.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የሪፖርት ምክንያት' : 'Select Violation Reason'}
            </Text>

            <View style={styles.reasonsList}>
              {reasons.map((r) => {
                const isSelected = reason === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[
                      styles.reasonItem,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setReason(r.key)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? '#FFFFFF' : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.reasonText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'ዝርዝር ማብራሪያ' : 'Specific Details'}
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              multiline
              numberOfLines={4}
              placeholder={isAmharic ? 'ችግሩን ያስረዱ...' : 'Explain the issue with this listing...'}
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.error }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isAmharic ? 'ሪፖርት ላክ' : 'Submit Report'}
                </Text>
              )}
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
    paddingBottom: 30,
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  reasonsList: {
    gap: 6,
    marginBottom: spacing.md,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 80,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
