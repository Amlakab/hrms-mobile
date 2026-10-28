import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { borderRadius, spacing, typography } from '../constants/theme';
import api from '../config/api';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  houseId?: string;
  houseTitle?: string;
  amount: number;
  paymentType?: 'RENT' | 'DEPOSIT' | 'DOWN_PAYMENT' | 'FEE';
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  houseId,
  houseTitle,
  amount,
  paymentType = 'RENT',
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();
  const { user } = useAuth();

  const [method, setMethod] = useState<'telebirr' | 'cbe' | 'cash'>('telebirr');
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const paymentConfig = {
    telebirr: {
      phone: '0911223344',
      name: 'HRMS Real Estate Telebirr Merchant',
    },
    cbe: {
      account: '1000123456789',
      name: 'HRMS Property Management CBE Account',
    },
  };

  const copyToClipboard = (text: string, key: string) => {
    Clipboard.setString(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePay = async () => {
    if (!transactionId.trim() && method !== 'cash') {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Required',
        isAmharic
          ? 'እባክዎ የግብይት መለያ ቁጥር (Transaction ID / Reference) ያስገቡ'
          : 'Please enter the transaction reference or slip number'
      );
      return;
    }

    try {
      setLoading(true);
      await api.post('/transactions', {
        userId: user?._id,
        houseId,
        amount,
        type: 'property_purchase',
        method,
        transactionId: transactionId.trim() || `REF_${Date.now()}`,
        reference: transactionId.trim() || `CASH_${Date.now()}`,
        senderPhone: senderPhone.trim() || undefined,
        description: description.trim() || `${paymentType} payment for ${houseTitle || 'Property'}`,
      });

      Alert.alert(
        isAmharic ? 'ክፍያ ተመዝግቧል' : 'Payment Recorded',
        isAmharic
          ? 'የክፍያ መረጃዎ በተሳካ ሁኔታ ተመዝግቧል። የሂሳብ ክፍሉ ካረጋገጠ በኋላ ደረሰኝ ይደርስዎታል።'
          : 'Your payment reference has been submitted and is awaiting accountant verification.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || 'Failed to submit payment'
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
                {isAmharic ? 'ክፍያ መፈጸሚያ' : 'Make Payment'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                {houseTitle || 'HRMS Property Payment'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Amount Banner */}
            <View style={[styles.amountBanner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.primary }]}>
              <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'የሚከፈለው ጠቅላላ መጠን' : 'Amount Due'}
              </Text>
              <Text style={[styles.amountValue, { color: colors.primary }]}>
                ETB {amount.toLocaleString()}
              </Text>
            </View>

            {/* Payment Method Selector */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isAmharic ? 'የክፍያ ዘዴ ይምረጡ' : 'Select Payment Method'}
            </Text>
            <View style={styles.methodsRow}>
              {/* Telebirr */}
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  {
                    backgroundColor: method === 'telebirr' ? colors.primary : colors.surfaceSecondary,
                    borderColor: method === 'telebirr' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setMethod('telebirr')}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={method === 'telebirr' ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    { color: method === 'telebirr' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  Telebirr
                </Text>
              </TouchableOpacity>

              {/* CBE Bank */}
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  {
                    backgroundColor: method === 'cbe' ? colors.primary : colors.surfaceSecondary,
                    borderColor: method === 'cbe' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setMethod('cbe')}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={method === 'cbe' ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    { color: method === 'cbe' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  CBE Bank
                </Text>
              </TouchableOpacity>

              {/* Cash / Bank Slip */}
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  {
                    backgroundColor: method === 'cash' ? colors.primary : colors.surfaceSecondary,
                    borderColor: method === 'cash' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setMethod('cash')}
              >
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={method === 'cash' ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    { color: method === 'cash' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  Cash / Slip
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recipient Account Details Box */}
            {method === 'telebirr' && (
              <View style={[styles.accountBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <View style={styles.accountRow}>
                  <Text style={[styles.accLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'የቴሌብር ቁጥር:' : 'Telebirr Merchant / Phone:'}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyRow}
                    onPress={() => copyToClipboard(paymentConfig.telebirr.phone, 'tb')}
                  >
                    <Text style={[styles.accValue, { color: colors.text }]}>
                      {paymentConfig.telebirr.phone}
                    </Text>
                    <Ionicons
                      name={copied === 'tb' ? 'checkmark' : 'copy-outline'}
                      size={15}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.accSub, { color: colors.textMuted }]}>
                  {paymentConfig.telebirr.name}
                </Text>
              </View>
            )}

            {method === 'cbe' && (
              <View style={[styles.accountBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <View style={styles.accountRow}>
                  <Text style={[styles.accLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'የCBE ሂሳብ ቁጥር:' : 'CBE Account Number:'}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyRow}
                    onPress={() => copyToClipboard(paymentConfig.cbe.account, 'cbe')}
                  >
                    <Text style={[styles.accValue, { color: colors.text }]}>
                      {paymentConfig.cbe.account}
                    </Text>
                    <Ionicons
                      name={copied === 'cbe' ? 'checkmark' : 'copy-outline'}
                      size={15}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.accSub, { color: colors.textMuted }]}>
                  {paymentConfig.cbe.name}
                </Text>
              </View>
            )}

            {/* Transaction Reference Input */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {isAmharic ? 'የግብይት መለያ ቁጥር (Transaction ID / Ref)' : 'Transaction ID / Reference Number'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="e.g. FT2603412984 or Telebirr SMS Code"
              placeholderTextColor={colors.textMuted}
              value={transactionId}
              onChangeText={setTransactionId}
            />

            {/* Sender Phone */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {isAmharic ? 'የከፋዩ ስልክ ቁጥር' : 'Sender Phone Number'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="0911223344"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={senderPhone}
              onChangeText={setSenderPhone}
            />

            {/* Note / Description */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {isAmharic ? 'ተጨማሪ ማብራሪያ' : 'Payment Notes'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={isAmharic ? 'ለምሳሌ፡ የጥቅምት ወር ኪራይ' : 'e.g. October Rent Installment'}
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handlePay}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isAmharic ? 'ክፍያውን አረጋግጥ' : 'Submit Payment Proof'}
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
    maxHeight: '90%',
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  amountBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amountLabel: {
    fontSize: 12,
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  methodBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  accountBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accLabel: {
    fontSize: 12,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  accSub: {
    fontSize: 11,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
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
