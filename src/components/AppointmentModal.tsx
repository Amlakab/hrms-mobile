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

interface AppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  house: House;
  onSuccess?: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  visible,
  onClose,
  house,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [tourType, setTourType] = useState<'IN_PERSON' | 'VIRTUAL'>('IN_PERSON');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      try {
        await api.post('/workflows/appointments', {
          houseId: house._id,
          visitDate: date,
          timeSlot: timeSlot || '10:00 AM - 11:00 AM',
          visitType: tourType === 'IN_PERSON' ? 'IN_PERSON' : 'VIRTUAL_TOUR',
          numberOfVisitors: 1,
          notes: notes.trim(),
        });
      } catch (workflowErr) {
        // Fallback to /orders if workflow route fails
        await api.post('/orders', {
          houseId: house._id,
          orderType: 'INQUIRY',
          message: `[Viewing Tour: ${tourType} on ${date} at ${timeSlot}] ${notes.trim()}`,
        });
      }

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        isAmharic
          ? 'የጉብኝት ቀጠሮዎ በተሳካ ሁኔታ ተመዝግቧል። አስተናጋጁ በቅርቡ ያነጋግርዎታል።'
          : 'Your property viewing appointment has been scheduled successfully.'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ቀጠሮ ማስያዝ አልተቻለም' : 'Failed to schedule appointment')
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
                {t('action.book_tour', 'Schedule Tour')}
              </Text>
              <Text style={[styles.houseTitle, { color: colors.textMuted }]} numberOfLines={1}>
                {house.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Tour Type */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የጉብኝት አይነት' : 'Tour Type'}
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor:
                      tourType === 'IN_PERSON' ? colors.primary : colors.surfaceSecondary,
                    borderColor: tourType === 'IN_PERSON' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setTourType('IN_PERSON')}
              >
                <Ionicons
                  name="walk-outline"
                  size={16}
                  color={tourType === 'IN_PERSON' ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: tourType === 'IN_PERSON' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {isAmharic ? 'በአካል መጎብኘት' : 'In-Person Tour'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor:
                      tourType === 'VIRTUAL' ? colors.primary : colors.surfaceSecondary,
                    borderColor: tourType === 'VIRTUAL' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setTourType('VIRTUAL')}
              >
                <Ionicons
                  name="videocam-outline"
                  size={16}
                  color={tourType === 'VIRTUAL' ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: tourType === 'VIRTUAL' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {isAmharic ? 'ቪዲዮ / ምናባዊ ጉብኝት' : 'Virtual Tour'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Input */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'ቀን (ዓ.ም / እ.ኤ.አ)' : 'Tour Date (YYYY-MM-DD)'}
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
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />

            {/* Time Slot */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'ተመራጭ ሰዓት' : 'Preferred Time Slot'}
            </Text>
            <View style={styles.timeSlotsRow}>
              {timeSlots.map((slot) => {
                const isSelected = timeSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slotPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setTimeSlot(slot)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notes */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'ተጨማሪ ማስታወሻ' : 'Special Notes or Questions'}
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
              numberOfLines={3}
              placeholder={isAmharic ? 'ስለ ቤቱ ማወቅ የሚፈልጉት ነገር ካለ...' : 'Any questions or preferences...'}
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>{t('action.book_tour', 'Schedule Tour')}</Text>
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
  houseTitle: {
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
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  timeSlotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 70,
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
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
