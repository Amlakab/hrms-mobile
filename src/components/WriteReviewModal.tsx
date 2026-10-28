import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { borderRadius, spacing } from '../constants/theme';
import api from '../config/api';

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  houseId: string;
  onSuccess: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  visible,
  onClose,
  houseId,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert(
        isAmharic ? 'ማስጠንቀቂያ' : 'Validation',
        isAmharic ? 'እባክዎ አስተያየትዎን ይጻፉ' : 'Please provide your review comment'
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/reviews/house', {
        houseId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Review Submitted',
        isAmharic ? 'አስተያየትዎ በተሳካ ሁኔታ ተልኳል!' : 'Thank you for your feedback!'
      );
      setTitle('');
      setComment('');
      setRating(5);
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'አስተያየት መላክ አልተቻለም' : 'Failed to submit review')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isAmharic ? 'አስተያየት እና ደረጃ ይስጡ' : 'Write a Review'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Star Rating Select */}
          <Text style={[styles.label, { color: colors.text }]}>
            {isAmharic ? 'ደረጃ (Rating)' : 'Rating'}
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color="#F59E0B"
                />
              </TouchableOpacity>
            ))}
            <Text style={[styles.ratingNumber, { color: colors.text }]}>
              {rating} / 5
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>
            {isAmharic ? 'የአስተያየት ርዕስ (አማራጭ)' : 'Review Title (Optional)'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
            placeholder={isAmharic ? 'ምሳሌ፡ በጣም ምቹ እና ጸጥ ያለ ቤት' : 'e.g. Beautiful and serene apartment'}
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            {isAmharic ? 'ዝርዝር አስተያየት *' : 'Detailed Review *'}
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
            placeholder={isAmharic ? 'ስለ ቤቱ፣ አገልግሎቶች እና አካባቢው ያለዎትን ልምድ ያጋሩ...' : 'Describe your experience with this property and neighborhood...'}
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}
              onPress={onClose}
            >
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {isAmharic ? 'ይቅር' : 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {isAmharic ? 'አስተያየት ላክ' : 'Submit Review'}
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  ratingNumber: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  textArea: {
    height: 90,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
