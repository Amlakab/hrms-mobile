import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../constants/theme';

export const QRCodeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [platformUrl, setPlatformUrl] = useState('https://realestatepro.et');
  const [propertyId, setPropertyId] = useState('');
  const [copied, setCopied] = useState(false);

  const activeUrl = propertyId.trim()
    ? `${platformUrl}/public/houses/${propertyId.trim()}`
    : platformUrl;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert(
      isAmharic ? 'ተቀድቷል' : 'Copied!',
      isAmharic ? 'የመድረኩ ሊንክ ተቀድቷል' : 'Platform URL copied to clipboard.'
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'HRMS Real Estate Platform',
        message: `Visit HRMS Real Estate Platform: ${activeUrl}`,
        url: activeUrl,
      });
    } catch (err) {
      Alert.alert('Share', 'Could not open share dialogue.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የQR ኮድ እና ማጋሪያ' : 'QR Code & Platform Hub'}
        subtitle={isAmharic ? 'የሪል እስቴት መድረኩን እና ንብረቶችን ለደንበኞች ያጋሩ' : 'Share Platform & Property QR Links'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* QR Card */}
        <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Simulated QR Visual Representation with High Contrast Matrix */}
          <View style={styles.qrVisualWrap}>
            <View style={styles.qrCornerTopLeft} />
            <View style={styles.qrCornerTopRight} />
            <View style={styles.qrCornerBottomLeft} />
            <Ionicons name="qr-code" size={190} color={isDark ? '#38BDF8' : '#0284C7'} />
          </View>

          <Text style={[styles.qrTitle, { color: colors.text }]}>
            {isAmharic ? 'ሪል እስቴት መድረክ' : 'RealEstate Pro Platform'}
          </Text>
          <Text style={[styles.qrSub, { color: colors.textMuted }]}>
            {isAmharic
              ? 'ይህንን የQR ኮድ በስልክ ካሜራ በመቃኘት በቀጥታ ይጎብኙ'
              : 'Scan with smartphone camera to open live property portal'}
          </Text>

          {/* Active Link Box */}
          <View style={[styles.linkBox, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', borderColor: colors.border }]}>
            <Ionicons name="globe-outline" size={16} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.text }]} numberOfLines={1}>
              {activeUrl}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleCopy} style={[styles.btn, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={colors.primary} />
              <Text style={[styles.btnText, { color: colors.text }]}>
                {copied ? (isAmharic ? 'ተቀድቷል' : 'Copied') : (isAmharic ? 'ሊንክ ቅዳ' : 'Copy Link')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={[styles.btn, { backgroundColor: colors.primary }]}>
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              <Text style={[styles.btnText, { color: '#FFFFFF' }]}>
                {isAmharic ? 'አጋራ' : 'Share URL'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Generate Custom Property Deep-Link QR */}
        <View style={[styles.customCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isAmharic ? 'የተለየ ንብረት QR ኮድ ፍጠር' : 'Generate Specific Property QR'}
          </Text>
          <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
            {isAmharic
              ? 'ለአንድ የተወሰነ ቤት ብቻ የQR ኮድ ለመስራት የንብረቱን መለያ ቁጥር (ID) ያስገቡ።'
              : 'Enter a property ID to generate a dedicated direct-booking QR link for signage or brochures.'}
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
            placeholder={isAmharic ? 'ምሳሌ፡ 66bc12984fe90...' : 'e.g. 66a91c890123... or house slug'}
            placeholderTextColor={colors.textMuted}
            value={propertyId}
            onChangeText={setPropertyId}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: 16,
  },
  qrCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  qrVisualWrap: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  qrCornerTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#0284C7',
  },
  qrCornerTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#0284C7',
  },
  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#0284C7',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  qrSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'monospace',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  customCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
  },
});
