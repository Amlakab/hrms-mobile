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
import { House } from '../types';

interface PurchaseOfferModalProps {
  visible: boolean;
  onClose: () => void;
  house: House;
  onSuccess?: () => void;
}

export const PurchaseOfferModal: React.FC<PurchaseOfferModalProps> = ({
  visible,
  onClose,
  house,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();

  const [offerPrice, setOfferPrice] = useState(String(house.price || ''));
  const [downPayment, setDownPayment] = useState(
    house.price ? String(Math.round(house.price * 0.2)) : ''
  );
  const [financingType, setFinancingType] = useState<'CASH' | 'MORTGAGE'>('CASH');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const numericOffer = parseFloat(offerPrice);
    if (isNaN(numericOffer) || numericOffer <= 0) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        isAmharic ? 'እባክዎ ትክክለኛ የግዢ ዋጋ ያስገቡ' : 'Please enter a valid offer price'
      );
      return;
    }

    try {
      setLoading(true);
      try {
        await api.post('/workflows/offers', {
          houseId: house._id,
          offerAmount: numericOffer,
          earnestDepositAmount: parseFloat(downPayment) || 0,
          financingType,
          message: message.trim(),
          contingencies: [
            'Clean Title Deed Verification',
            'Physical and Structural Property Inspection',
            'Standard Property Handover',
          ],
        });
      } catch (workflowErr) {
        // Fallback to /orders if workflow route fails
        await api.post('/orders', {
          houseId: house._id,
          orderType: 'PURCHASE',
          proposedPrice: numericOffer,
          downPayment: parseFloat(downPayment) || undefined,
          message: `[Financing: ${financingType}] ${message}`,
        });
      }

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Offer Submitted',
        isAmharic
          ? 'የግዢ ጥያቄዎ ለንብረቱ ባለቤት/ደላላ ተልኳል።'
          : 'Your purchase offer has been successfully submitted to the seller.'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ጥያቄውን ማቅረብ አልተቻለም' : 'Failed to submit offer')
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
                {t('action.make_offer', 'Make Purchase Offer')}
              </Text>
              <Text style={[styles.houseTitle, { color: colors.textMuted }]} numberOfLines={1}>
                {house.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Listed Price reference banner */}
            <View style={[styles.priceBanner, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.bannerLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'የተጠየቀው ዋጋ' : 'Asking Price'}
              </Text>
              <Text style={[styles.bannerPrice, { color: colors.primary }]}>
                ETB {(house.price || 0).toLocaleString()}
              </Text>
            </View>

            {/* Proposed Offer Amount */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የእርስዎ የቀረበ ዋጋ (በብር)' : 'Your Offer Amount (ETB)'}
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
              value={offerPrice}
              onChangeText={setOfferPrice}
              placeholder={isAmharic ? 'የሚሰጡትን ዋጋ ያስገቡ' : 'Enter offer price'}
              placeholderTextColor={colors.textMuted}
            />

            {/* Down Payment */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የቅድመ ክፍያ መጠን (በብር)' : 'Down Payment Amount (ETB)'}
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
              value={downPayment}
              onChangeText={setDownPayment}
              placeholder={isAmharic ? 'የቅድመ ክፍያ' : 'Down payment'}
              placeholderTextColor={colors.textMuted}
            />

            {/* Financing Mode */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የክፍያ ዘዴ' : 'Payment Method / Financing'}
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor:
                      financingType === 'CASH' ? colors.primary : colors.surfaceSecondary,
                    borderColor: financingType === 'CASH' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFinancingType('CASH')}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: financingType === 'CASH' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {isAmharic ? 'ጥሬ ገንዘብ / ቀጥታ' : 'Full Cash Transfer'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor:
                      financingType === 'MORTGAGE' ? colors.primary : colors.surfaceSecondary,
                    borderColor: financingType === 'MORTGAGE' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFinancingType('MORTGAGE')}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: financingType === 'MORTGAGE' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {isAmharic ? 'የባንክ ብድር / ሞርጌጅ' : 'Bank Mortgage Loan'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Offer Terms & Contingencies */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'ተጨማሪ ሁኔታዎች ወይም ውሎች' : 'Conditions & Terms for Seller'}
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
              placeholder={
                isAmharic
                  ? 'ስለ ውል አፈፃፀም፣ የይዞታ ማረጋገጫ ወይም የጊዜ ገደብ...'
                  : 'Subject to deed verification, bank loan approval, etc...'
              }
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
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
                <Text style={styles.submitBtnText}>
                  {t('action.make_offer', 'Submit Purchase Offer')}
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
  priceBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bannerLabel: {
    fontSize: 12,
  },
  bannerPrice: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
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
  toggleBtn: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
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
    marginBottom: spacing.xl,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
