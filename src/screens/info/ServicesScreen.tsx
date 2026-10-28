import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';

export const ServicesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const services = [
    {
      icon: 'key',
      color: '#3B82F6',
      title: isAmharic ? 'የረጅም ጊዜ የቤት ኪራይ' : 'Long-Term Property Leasing',
      desc: isAmharic
        ? 'በአዲስ አበባ ውስጥ ያሉ ዘመናዊ አፓርታማዎችን እና ቪላዎችን በህጋዊ ውል መከራየት።'
        : 'Curated luxury villas, condominiums, and apartments with verified digital lease agreements.',
    },
    {
      icon: 'cash',
      color: '#10B981',
      title: isAmharic ? 'የንብረት እና የቤት ሽያጭ' : 'Outright Real Estate Sales',
      desc: isAmharic
        ? 'የይዞታ ማረጋገጫ ካርታቸው የተረጋገጠ የመኖሪያ እና የንግድ ቤቶችን መግዛት።'
        : 'Title deed verified family houses, commercial complexes, and investment land plots.',
    },
    {
      icon: 'bed',
      color: '#8B5CF6',
      title: isAmharic ? 'የአጭር ጊዜ ቆይታ ቤቶች' : 'Short-Stay Serviced Apartments',
      desc: isAmharic
        ? 'የተሟላ የቤት ዕቃ፣ ዋይፋይ እና የጽዳት አገልግሎት ያላቸው አጫጭር ቆይታዎች።'
        : 'Fully furnished, serviced accommodations for business travelers and vacationers.',
    },
    {
      icon: 'construct',
      color: '#F59E0B',
      title: isAmharic ? 'የጥገና እና የቴክኒክ ድጋፍ' : 'Tenant Maintenance Services',
      desc: isAmharic
        ? 'የውሃ ቧንቧ፣ የኤሌክትሪክ እና የህንፃ ጥገና ጥያቄዎችን በሞባይል መተግበሪያው ማስተናገድ።'
        : 'Direct ticket logging for plumbing, electrical, and structural repairs with verified technicians.',
    },
    {
      icon: 'card',
      color: '#06B6D4',
      title: isAmharic ? 'የኤስክሮው ክፍያ ስርዓት' : 'Digital Escrow Management',
      desc: isAmharic
        ? 'የቴሌብር እና የባንክ ክፍያዎች በህጋዊ ዋስትና ገንዘቡ እስኪረጋገጥ የሚጠበቅበት ስርዓት።'
        : 'Guaranteed financial safety for buyers and tenants through staged milestone payouts.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'አገልግሎቶቻችን' : 'Our Services'}
        subtitle={isAmharic ? 'የምንሰጣቸው የሪል እስቴት አገልግሎቶች' : 'Comprehensive property solutions'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {services.map((svc, idx) => (
          <View
            key={idx}
            style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <View style={[styles.iconBox, { backgroundColor: `${svc.color}15` }]}>
              <Ionicons name={svc.icon as any} size={24} color={svc.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.serviceTitle, { color: colors.text }]}>{svc.title}</Text>
              <Text style={[styles.serviceDesc, { color: colors.textMuted }]}>{svc.desc}</Text>
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
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
});
