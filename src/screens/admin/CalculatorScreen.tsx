import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';

export const CalculatorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [price, setPrice] = useState('6500000');
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
  const principalPercent = totalPayment > 0 ? Math.round((loanPrincipal / totalPayment) * 100) : 0;
  const interestPercent = 100 - principalPercent;

  // Preset Ethiopian Mortgage Programs
  const PRESETS = [
    { name: isAmharic ? 'የንግድ ባንክ (CBE)' : 'CBE Standard', rate: '14.5', down: 20, term: 15 },
    { name: isAmharic ? 'አዋሽ ባንክ' : 'Awash Housing', rate: '15.0', down: 25, term: 20 },
    { name: isAmharic ? 'ዳሸን ባንክ' : 'Dashen Desta', rate: '14.0', down: 15, term: 10 },
    { name: isAmharic ? 'የዳያስፖራ ብድር' : 'Diaspora Mortgage', rate: '11.5', down: 20, term: 20 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የሞርጌጅ / ብድር ማስያ' : 'Mortgage & Loan Calculator'}
        subtitle={isAmharic ? 'የሪል እስቴት ወርሃዊ ክፍያ እና የወለድ ተመን ስሌት' : 'Calculate property payments, interest & amortization'}
        showBack={true}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainTabs');
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Result Card Hero */}
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.resultSubtitle, { color: colors.textMuted }]}>
            {isAmharic ? 'የተገመተ ወርሃዊ ክፍያ' : 'Estimated Monthly Payment'}
          </Text>
          <Text style={[styles.resultAmount, { color: colors.primary }]}>
            ETB {Math.round(monthlyPayment).toLocaleString()}
          </Text>
          <Text style={[styles.resultTerm, { color: colors.textMuted }]}>
            {isAmharic ? `ለ${tenureYears} ዓመታት (${totalMonths} ወራት)` : `for ${tenureYears} years (${totalMonths} months)`}
          </Text>

          {/* Breakdown progress bar */}
          <View style={styles.breakdownBar}>
            <View style={[styles.barSegment, { flex: principalPercent || 1, backgroundColor: colors.primary }]} />
            <View style={[styles.barSegment, { flex: interestPercent || 1, backgroundColor: '#F59E0B' }]} />
          </View>

          <View style={styles.breakdownLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {isAmharic ? 'ዋና ገንዘብ (Principal)' : 'Principal'}: {principalPercent}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {isAmharic ? 'ወለድ (Interest)' : 'Interest'}: {interestPercent}%
              </Text>
            </View>
          </View>

          {/* Summary Mini Grid */}
          <View style={[styles.summaryGrid, { borderTopColor: colors.border }]}>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'የቅድመ ክፍያ' : 'Down Payment'}
              </Text>
              <Text style={[styles.gridVal, { color: colors.text }]}>
                ETB {Math.round(downPaymentAmount).toLocaleString()}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'የብድር መጠን' : 'Loan Amount'}
              </Text>
              <Text style={[styles.gridVal, { color: colors.text }]}>
                ETB {Math.round(loanPrincipal).toLocaleString()}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'ጠቅላላ ወለድ' : 'Total Interest'}
              </Text>
              <Text style={[styles.gridVal, { color: '#F59E0B' }]}>
                ETB {Math.round(totalInterest).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Bank Presets Ribbon */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isAmharic ? 'የባንክ ብድር አማራጮች' : 'Bank Programs & Presets'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
          {PRESETS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setInterestRate(p.rate);
                setDownPaymentPercent(p.down);
                setTenureYears(p.term);
              }}
              style={[styles.presetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.presetName, { color: colors.text }]}>{p.name}</Text>
              <Text style={[styles.presetDetails, { color: colors.primary }]}>
                {p.rate}% • {p.term} {isAmharic ? 'ዓመት' : 'yrs'} • {p.down}% {isAmharic ? 'ቅድመ' : 'down'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Form Inputs */}
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Property Price */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {isAmharic ? 'የቤቱ አጠቃላይ ዋጋ (ETB)' : 'Property Price (ETB)'}
          </Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Ionicons name="home-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.inputField, { color: colors.text }]}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="5000000"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Down Payment % */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {isAmharic ? 'የቅድመ ክፍያ መጠን (%)' : 'Down Payment (%)'}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
              {downPaymentPercent}% (ETB {Math.round(downPaymentAmount).toLocaleString()})
            </Text>
          </View>
          <View style={styles.percentRow}>
            {[10, 15, 20, 25, 30, 50].map((pct) => (
              <TouchableOpacity
                key={pct}
                onPress={() => setDownPaymentPercent(pct)}
                style={[
                  styles.pctBtn,
                  {
                    backgroundColor: downPaymentPercent === pct ? colors.primary : colors.surfaceSecondary,
                    borderColor: downPaymentPercent === pct ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: downPaymentPercent === pct ? '#FFFFFF' : colors.text,
                  }}
                >
                  {pct}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Loan Tenure (Years) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {isAmharic ? 'የብድር ዘመን (በዓመታት)' : 'Loan Term (Years)'}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
              {tenureYears} {isAmharic ? 'ዓመታት' : 'Years'}
            </Text>
          </View>
          <View style={styles.percentRow}>
            {[5, 10, 15, 20, 25, 30].map((yr) => (
              <TouchableOpacity
                key={yr}
                onPress={() => setTenureYears(yr)}
                style={[
                  styles.pctBtn,
                  {
                    backgroundColor: tenureYears === yr ? colors.primary : colors.surfaceSecondary,
                    borderColor: tenureYears === yr ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: tenureYears === yr ? '#FFFFFF' : colors.text,
                  }}
                >
                  {yr} {isAmharic ? 'ዓ' : 'yr'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Interest Rate */}
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: spacing.md }]}>
            {isAmharic ? 'ዓመታዊ የወለድ ተመን (%)' : 'Annual Interest Rate (%)'}
          </Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Ionicons name="trending-up-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.inputField, { color: colors.text }]}
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="numeric"
              placeholder="14.5"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.lg,
  },
  resultCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  resultSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultAmount: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  resultTerm: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  breakdownBar: {
    flexDirection: 'row',
    height: 10,
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  barSegment: {
    height: '100%',
  },
  breakdownLegend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  gridCol: {
    flex: 1,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  gridVal: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  presetsRow: {
    flexDirection: 'row',
    marginTop: -spacing.sm,
  },
  presetCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '700',
  },
  presetDetails: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  formCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  percentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 6,
  },
  pctBtn: {
    flex: 1,
    height: 36,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
