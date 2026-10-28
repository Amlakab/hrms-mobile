import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { borderRadius, spacing, typography } from '../constants/theme';
import { House } from '../types';

interface CalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  house?: House;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  visible,
  onClose,
  house,
}) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const [price, setPrice] = useState(String(house?.price || 5000000));
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [tenureYears, setTenureYears] = useState(15);
  const [interestRate, setInterestRate] = useState('14.5');

  const numericPrice = parseFloat(price) || 0;
  const downPaymentAmount = (numericPrice * downPaymentPercent) / 100;
  const loanPrincipal = Math.max(0, numericPrice - downPaymentAmount);
  const annualRate = (parseFloat(interestRate) || 0) / 100;
  const monthlyRate = annualRate / 12;
  const totalMonths = tenureYears * 12;

  let monthlyPayment = 0;
  if (monthlyRate > 0 && totalMonths > 0 && loanPrincipal > 0) {
    monthlyPayment =
      (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else if (totalMonths > 0) {
    monthlyPayment = loanPrincipal / totalMonths;
  }

  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanPrincipal);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.modalBg }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {isAmharic ? 'የሞርጌጅ / የብድር ማስያ' : 'Mortgage Calculator'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {isAmharic ? 'ወርሃዊ የክፍያ መጠን እና የወለድ ስሌት' : 'Estimate your monthly loan installments'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Monthly Payment Hero Result Card */}
            <View style={[styles.resultCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.primary }]}>
              <Text style={[styles.resultLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'ግምታዊ ወርሃዊ ክፍያ' : 'Estimated Monthly Installment'}
              </Text>
              <Text style={[styles.resultAmount, { color: colors.primary }]}>
                ETB {Math.round(monthlyPayment).toLocaleString()}
                <Text style={styles.resultPeriod}>{isAmharic ? '/ወር' : '/mo'}</Text>
              </Text>
            </View>

            {/* Inputs: Price */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'የቤቱ አጠቃላይ ዋጋ (በብር)' : 'Property Value (ETB)'}
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
              value={price}
              onChangeText={setPrice}
              placeholder="e.g. 5,000,000"
              placeholderTextColor={colors.textMuted}
            />

            {/* Down Payment % */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? `የቅድመ ክፍያ መቶኛ (${downPaymentPercent}%)` : `Down Payment (${downPaymentPercent}%)`}
            </Text>
            <View style={styles.chipsRow}>
              {[10, 20, 30, 40, 50].map((pct) => {
                const isSelected = downPaymentPercent === pct;
                return (
                  <TouchableOpacity
                    key={pct}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setDownPaymentPercent(pct)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Loan Tenure (Years) */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? `የብድር ጊዜ ርዝማኔ (${tenureYears} ዓመታት)` : `Loan Tenure (${tenureYears} Years)`}
            </Text>
            <View style={styles.chipsRow}>
              {[5, 10, 15, 20, 25].map((yr) => {
                const isSelected = tenureYears === yr;
                return (
                  <TouchableOpacity
                    key={yr}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setTenureYears(yr)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {yr} {isAmharic ? 'ዓመት' : 'Yrs'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Interest Rate */}
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'ዓመታዊ የባንክ ወለድ (%)' : 'Annual Interest Rate (%)'}
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
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="e.g. 14.5"
              placeholderTextColor={colors.textMuted}
            />

            {/* Summary Breakdown */}
            <View style={[styles.summaryBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'የቅድመ ክፍያ መጠን' : 'Down Payment:'}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ETB {Math.round(downPaymentAmount).toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'የብድር ዋና ገንዘብ' : 'Loan Principal:'}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ETB {Math.round(loanPrincipal).toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'አጠቃላይ ወለድ' : 'Total Interest Payable:'}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>
                  ETB {Math.round(totalInterest).toLocaleString()}
                </Text>
              </View>
            </View>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  resultCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultAmount: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  resultPeriod: {
    fontSize: 14,
    fontWeight: '500',
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    height: 38,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
