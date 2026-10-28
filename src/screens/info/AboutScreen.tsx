import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';

export const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const values = [
    {
      icon: 'shield-checkmark',
      title: isAmharic ? 'የተረጋገጡ ንብረቶች' : 'Officially Verified',
      desc: isAmharic
        ? 'እያንዳንዱ ቤት የይዞታ ማረጋገጫ ካርታ እና ህጋዊ ሰነዱ በአስተዳዳሪው የተረጋገጠ ነው።'
        : 'Every listed property undergoes rigorous title deed and cadastral ownership verification.',
    },
    {
      icon: 'card',
      title: isAmharic ? 'አስተማማኝ ክፍያ' : 'Secure Escrow Payments',
      desc: isAmharic
        ? 'በቴሌብር እና በCBE ባንክ የሚደረጉ ክፍያዎች በህጋዊ የኪስ ቦርሳ በኩል በጥንቃቄ ይጠበቃሉ።'
        : 'Telebirr and CBE bank deposits are protected through our digital escrow milestone ledger.',
    },
    {
      icon: 'document-text',
      title: isAmharic ? 'ህጋዊ ዲጂታል ውል' : 'Digital Lease Agreements',
      desc: isAmharic
        ? 'የኪራይ ውሎችን በሞባይል ስልክዎ በቀላሉ ፈርመው ደረሰኝ ማግኘት ይችላሉ።'
        : 'Sign tenancy agreements electronically with full legal backing and payment schedules.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'ስለ እኛ' : 'About HRMS'}
        subtitle={isAmharic ? 'የቤት ኪራይ እና ሽያጭ መድረክ' : 'Real estate management system'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={[styles.logoCircle, { backgroundColor: '#FFFFFF', overflow: 'hidden' }]}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            HRMS REAL ESTATE
          </Text>
          <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
            {isAmharic
              ? 'በኢትዮጵያ ውስጥ ያሉ ዘመናዊ ቤቶችን፣ አፓርታማዎችን እና ቪላዎችን ያለምንም ውጣ ውረድ ለመከራየት ወይም ለመግዛት የሚያስችል አስተማማኝ የቴክኖሎጂ መድረክ።'
              : 'Ethiopia’s leading unified digital platform for verified home rentals, luxury property acquisitions, automated lease contracting, and escrow management.'}
          </Text>
        </View>

        {/* Core Pillars */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isAmharic ? 'ዋና ዋና እሴቶቻችን' : 'Why Choose HRMS?'}
        </Text>

        {values.map((v, idx) => (
          <View
            key={idx}
            style={[styles.valCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <View style={[styles.valIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name={v.icon as any} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.valTitle, { color: colors.text }]}>{v.title}</Text>
              <Text style={[styles.valDesc, { color: colors.textMuted }]}>{v.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  heroCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.xs,
  },
  valCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  valIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  valDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});
