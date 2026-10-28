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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { borderRadius, spacing, typography } from '../constants/theme';
import api from '../config/api';

interface MaintenanceModalProps {
  visible: boolean;
  onClose: () => void;
  houseId?: string;
  onSuccess?: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  visible,
  onClose,
  houseId,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const [category, setCategory] = useState<'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'STRUCTURAL' | 'APPLIANCE' | 'OTHER'>('PLUMBING');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { key: 'PLUMBING', label: isAmharic ? 'የቧንቧ' : 'Plumbing' },
    { key: 'ELECTRICAL', label: isAmharic ? 'የኤሌክትሪክ' : 'Electrical' },
    { key: 'HVAC', label: isAmharic ? 'አየር ማቀዝቀዣ' : 'HVAC / Heating' },
    { key: 'STRUCTURAL', label: isAmharic ? 'የግንባታ' : 'Structural' },
    { key: 'APPLIANCE', label: isAmharic ? 'የቤት ዕቃዎች' : 'Appliance' },
    { key: 'OTHER', label: isAmharic ? 'ሌላ' : 'Other' },
  ];

  const priorities = [
    { key: 'LOW', label: isAmharic ? 'ዝቅተኛ' : 'Low', color: '#10B981' },
    { key: 'MEDIUM', label: isAmharic ? 'መካከለኛ' : 'Medium', color: '#3B82F6' },
    { key: 'HIGH', label: isAmharic ? 'ከፍተኛ' : 'High', color: '#F59E0B' },
    { key: 'EMERGENCY', label: isAmharic ? 'አስቸኳይ' : 'Emergency', color: '#EF4444' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Missing Fields',
        isAmharic ? 'እባክዎ ርዕስ እና ዝርዝር ማብራሪያ ያስገቡ' : 'Please provide a title and problem description.'
      );
      return;
    }

    try {
      setLoading(true);
      try {
        await api.post('/workflows/maintenance', {
          houseId,
          category,
          priority,
          title: title.trim(),
          description: description.trim(),
        });
      } catch (workflowErr) {
        // Fallback to /feedback if maintenance workflow route differs
        await api.post('/feedback', {
          type: 'MAINTENANCE',
          houseId,
          title: title.trim(),
          message: `[Category: ${category}] [Priority: ${priority}] ${description.trim()}`,
        });
      }

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Ticket Submitted',
        isAmharic
          ? 'የጥገና ጥያቄዎ ለቴክኒሻን እና ለአስተዳዳሪው ደርሷል።'
          : 'Your maintenance ticket has been logged and assigned to the management team.'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ማስገባት አልተቻለም' : 'Failed to submit maintenance ticket')
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
            <Text style={[styles.title, { color: colors.text }]}>
              {isAmharic ? 'የጥገና ጥያቄ ማቅረቢያ' : 'Request Maintenance'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category selection */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የችግሩ ዘርፍ' : 'Issue Category'}
            </Text>
            <View style={styles.chipsRow}>
              {categories.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setCategory(cat.key as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Urgency Priority */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የአስቸኳይነት ደረጃ' : 'Priority Level'}
            </Text>
            <View style={styles.chipsRow}>
              {priorities.map((pri) => {
                const isSelected = priority === pri.key;
                return (
                  <TouchableOpacity
                    key={pri.key}
                    style={[
                      styles.priChip,
                      {
                        backgroundColor: isSelected ? pri.color : colors.surfaceSecondary,
                        borderColor: isSelected ? pri.color : colors.border,
                      },
                    ]}
                    onPress={() => setPriority(pri.key as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {pri.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የችግሩ አጭር ርዕስ' : 'Issue Summary / Title'}
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
              value={title}
              onChangeText={setTitle}
              placeholder={isAmharic ? 'ለምሳሌ፡ የውሃ ቧንቧ ማፍሰስ' : 'e.g. Kitchen sink pipe leaking'}
              placeholderTextColor={colors.textMuted}
            />

            {/* Description */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የችግሩ ዝርዝር ማብራሪያ' : 'Detailed Description'}
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
              placeholder={
                isAmharic
                  ? 'ችግሩ የት ቦታ እንደተከሰተ፣ መቼ እንደጀመረ...'
                  : 'Describe the issue location and any details...'
              }
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isAmharic ? 'ጥያቄውን ላክ' : 'Submit Maintenance Ticket'}
                </Text>
              )}
            </TouchableOpacity>
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
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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
  priChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
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
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
