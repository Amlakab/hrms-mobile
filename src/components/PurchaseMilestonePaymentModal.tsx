import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../config/api';
import { PurchaseOffer } from '../types';

interface PurchaseMilestonePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  offer: PurchaseOffer | null;
  milestone: {
    _id?: string;
    id?: string;
    title: string;
    amount: number;
    percentage: number;
    dueDate?: string;
    status: string;
    transactionReference?: string;
    receiptNumber?: string;
  } | null;
  onSuccess?: () => void;
}

export const PurchaseMilestonePaymentModal: React.FC<PurchaseMilestonePaymentModalProps> = ({
  visible,
  onClose,
  offer,
  milestone,
  onSuccess,
}) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [method, setMethod] = useState<'cbe' | 'telebirr' | 'cash'>('cbe');
  const [transactionRef, setTransactionRef] = useState('');
  const [senderPhone, setSenderPhone] = useState(offer?.buyerPhone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible && offer) {
      setTransactionRef('');
      setSenderPhone(offer.buyerPhone || '');
      setNotes('');
      setCopied(false);
    }
  }, [visible, offer]);

  if (!offer || !milestone) return null;

  const houseObj = typeof offer.houseId === 'object' && offer.houseId ? offer.houseId : null;
  const houseTitle = houseObj?.title || 'Property Purchase';

  const accounts = {
    cbe: {
      bank: 'Commercial Bank of Ethiopia (CBE)',
      accountNo: '1000289123456',
      holder: 'HRMS Real Estate Platform Escrow',
    },
    telebirr: {
      bank: 'Telebirr SuperApp Merchant',
      accountNo: '0911234567',
      holder: 'HRMS Property Holdings',
    },
    cash: {
      bank: 'Awash Bank Escrow',
      accountNo: '01320897654300',
      holder: 'HRMS Real Estate Trust',
    },
  };

  const currentAccount = accounts[method];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert(
      isAmharic ? 'ተቀድቷል' : 'Copied!',
      isAmharic ? 'የሂሳብ ቁጥር ተቀድቷል' : 'Account number copied to clipboard.'
    );
  };

  const handleSubmit = async () => {
    if (!transactionRef.trim()) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Required',
        isAmharic ? 'እባክዎ የባንክ ማረጋገጫ ቁጥር ያስገቡ' : 'Please provide the transaction reference / bank slip code.'
      );
      return;
    }

    try {
      setLoading(true);
      await api.post(`/workflows/offers/${offer._id}/submit-milestone-payment`, {
        milestoneId: milestone._id || milestone.id,
        amount: milestone.amount,
        method,
        transactionReference: transactionRef.trim(),
        senderPhone: senderPhone.trim(),
        notes: notes.trim(),
      });

      Alert.alert(
        isAmharic ? 'ክፍያ ተልኳል!' : 'Payment Submitted!',
        isAmharic
          ? 'የክፍያ ማረጋገጫዎ በተሳካ ሁኔታ ለሂሳብ ክፍል ተልኳል።'
          : 'Your milestone payment has been submitted for escrow verification.'
      );
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Milestone payment error:', err);
      Alert.alert(
        isAmharic ? 'ስህተት ተከስቷል' : 'Submission Failed',
        err.response?.data?.message || (isAmharic ? 'ክፍያ ማስተላለፍ አልተቻለም' : 'Could not submit milestone payment.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? '#0D1527' : '#FFFFFF', borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="card-outline" size={22} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>
                {isAmharic ? 'የክፍያ ደረጃ ክፍያ' : 'Pay Milestone Installment'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Property and Milestone Banner */}
            <View style={[styles.banner, { backgroundColor: isDark ? '#162035' : '#F1F5F9' }]}>
              <Text style={[styles.bannerProperty, { color: colors.text }]} numberOfLines={1}>
                {houseTitle}
              </Text>
              <View style={styles.milestoneRow}>
                <Text style={[styles.milestoneTitle, { color: colors.primary }]}>{milestone.title}</Text>
                <Text style={[styles.milestoneAmount, { color: colors.success }]}>
                  {milestone.amount.toLocaleString()} ETB ({milestone.percentage}%)
                </Text>
              </View>
            </View>

            {/* Payment Method Selector */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {isAmharic ? 'የክፍያ ዘዴ ይምረጡ' : 'Select Payment Method'}
            </Text>
            <View style={styles.methodRow}>
              {(['cbe', 'telebirr', 'cash'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMethod(m)}
                  style={[
                    styles.methodChip,
                    {
                      backgroundColor: method === m ? colors.primary : isDark ? '#1E293B' : '#E2E8F0',
                      borderColor: method === m ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={m === 'telebirr' ? 'phone-portrait-outline' : m === 'cbe' ? 'business-outline' : 'cash-outline'}
                    size={18}
                    color={method === m ? '#FFFFFF' : colors.text}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      { color: method === m ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {m === 'cbe' ? 'CBE Bank' : m === 'telebirr' ? 'Telebirr' : 'Awash Bank'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Account Details Box */}
            <View style={[styles.accountBox, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', borderColor: colors.border }]}>
              <Text style={[styles.accountLabel, { color: colors.textMuted }]}>
                {currentAccount.bank}
              </Text>
              <View style={styles.accountNumberRow}>
                <Text style={[styles.accountNumber, { color: colors.text }]}>{currentAccount.accountNo}</Text>
                <TouchableOpacity onPress={handleCopy} style={[styles.copyBtn, { backgroundColor: colors.card }]}>
                  <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={colors.primary} />
                  <Text style={[styles.copyText, { color: colors.primary }]}>
                    {copied ? (isAmharic ? 'ተቀድቷል' : 'Copied') : (isAmharic ? 'ቅዳ' : 'Copy')}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.accountHolder, { color: colors.textSecondary }]}>
                {isAmharic ? 'የሂሳብ ስም' : 'Name'}: {currentAccount.holder}
              </Text>
            </View>

            {/* Reference Input */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {isAmharic ? 'የግብይት ማረጋገጫ ቁጥር (Txn Ref / FT / TT) *' : 'Transaction Reference / Bank Slip No *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              placeholder={isAmharic ? 'ምሳሌ፡ FT24289XX76' : 'e.g. FT2610287123 or Telebirr Txn ID'}
              placeholderTextColor={colors.textMuted}
              value={transactionRef}
              onChangeText={setTransactionRef}
              autoCapitalize="characters"
            />

            {/* Sender Phone Input */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {isAmharic ? 'የከፋይ ስልክ ቁጥር' : 'Sender Phone Number'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              placeholder="0911223344"
              placeholderTextColor={colors.textMuted}
              value={senderPhone}
              onChangeText={setSenderPhone}
              keyboardType="phone-pad"
            />

            {/* Notes Input */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {isAmharic ? 'ተጨማሪ ማስታወሻ (አማራጭ)' : 'Additional Notes (Optional)'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              placeholder={isAmharic ? 'ማስታወሻ ካለዎት እዚህ ይጻፉ...' : 'Branch name, deposit time or extra details...'}
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.submitBtn, { backgroundColor: colors.success }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>
                    {isAmharic ? 'ክፍያውን አረጋግጥ' : 'Submit Payment Proof'}
                  </Text>
                </>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 18,
  },
  banner: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  bannerProperty: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  milestoneAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '700',
  },
  accountBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  accountHolder: {
    fontSize: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
