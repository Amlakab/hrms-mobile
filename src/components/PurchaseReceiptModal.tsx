import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface PurchaseReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  offer: any;
  milestone: any;
}

export const PurchaseReceiptModal: React.FC<PurchaseReceiptModalProps> = ({
  visible,
  onClose,
  offer,
  milestone,
}) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  if (!milestone) return null;

  const houseObj = offer && typeof offer.houseId === 'object' && offer.houseId ? offer.houseId : null;
  const houseTitle = houseObj?.title || 'Residential Real Estate';
  const houseAddress = houseObj?.location?.address
    ? `${houseObj.location.address}, ${houseObj.location.city || 'Addis Ababa'}`
    : 'Addis Ababa, Ethiopia';

  const receiptNum = milestone.receiptNumber || `RCP-BUY-${Date.now().toString().slice(-7)}`;
  const paidDateStr = milestone.paidAt
    ? new Date(milestone.paidAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  const handleShare = async () => {
    try {
      await Share.share({
        title: `HRMS Receipt ${receiptNum}`,
        message: `Official Sales Receipt\nReceipt No: ${receiptNum}\nProperty: ${houseTitle}\nMilestone: ${milestone.title}\nAmount Paid: ${milestone.amount?.toLocaleString()} ETB\nDate: ${paidDateStr}\nStatus: VERIFIED & CONFIRMED\nHRMS Real Estate Platform`,
      });
    } catch (error) {
      Alert.alert('Share', 'Could not open share sheet.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.receiptCard, { backgroundColor: isDark ? '#0D1527' : '#FFFFFF', borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="receipt-outline" size={22} color={colors.success} />
              <Text style={[styles.title, { color: colors.text }]}>
                {isAmharic ? 'ይፋዊ የንብረት ግዢ ደረሰኝ' : 'Official Sales Receipt'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Stamp Badge */}
            <View style={styles.stampWrap}>
              <View style={[styles.stampCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="checkmark-circle" size={44} color={colors.success} />
              </View>
              <Text style={[styles.confirmedTitle, { color: colors.success }]}>
                {isAmharic ? 'የግዢ ክፍያ ተረጋግጧል' : 'PAYMENT CONFIRMED'}
              </Text>
              <Text style={[styles.receiptNumber, { color: colors.primary }]}>
                {isAmharic ? 'የደረሰኝ ቁጥር' : 'Receipt No'}: {receiptNum}
              </Text>
            </View>

            {/* Receipt Breakdown Card */}
            <View style={[styles.breakdownBox, { backgroundColor: isDark ? '#162035' : '#F8FAFC', borderColor: colors.border }]}>
              {/* Property */}
              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'ንብረት' : 'Property'}:
                </Text>
                <Text style={[styles.itemValue, { color: colors.text }]} numberOfLines={1}>
                  {houseTitle}
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'አድራሻ' : 'Address'}:
                </Text>
                <Text style={[styles.itemValue, { color: colors.textSecondary }]} numberOfLines={1}>
                  {houseAddress}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Milestone Details */}
              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'የክፍያ ደረጃ' : 'Milestone'}:
                </Text>
                <Text style={[styles.itemValue, { color: colors.primary }]}>
                  {milestone.title} ({milestone.percentage}%)
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'የተከፈለ መጠን' : 'Amount Paid'}:
                </Text>
                <Text style={[styles.amountValue, { color: colors.success }]}>
                  {milestone.amount?.toLocaleString()} ETB
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'ቀን' : 'Date'}:
                </Text>
                <Text style={[styles.itemValue, { color: colors.text }]}>{paidDateStr}</Text>
              </View>

              {milestone.transactionReference ? (
                <View style={styles.itemRow}>
                  <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                    {isAmharic ? 'ማረጋገጫ ኮድ' : 'Ref / Slip'}:
                  </Text>
                  <Text style={[styles.itemValue, { color: colors.text, fontFamily: 'monospace' }]}>
                    {milestone.transactionReference}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Buyer */}
              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'ገዢ' : 'Buyer'}:
                </Text>
                <Text style={[styles.itemValue, { color: colors.text }]}>
                  {offer?.buyerName || offer?.buyerPhone || 'Authorized Client'}
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'የአስተዳደር ሁኔታ' : 'Status'}:
                </Text>
                <View style={styles.badgePill}>
                  <Ionicons name="shield-checkmark" size={13} color={colors.success} />
                  <Text style={[styles.badgeText, { color: colors.success }]}>VERIFIED ESCROW</Text>
                </View>
              </View>
            </View>

            {/* Footer Seal */}
            <View style={styles.footerSeal}>
              <Text style={[styles.sealText, { color: colors.textMuted }]}>
                {isAmharic
                  ? 'ይህ ሰነድ በHRMS ሪል እስቴት መድረክ በህጋዊ መንገድ የተረጋገጠ ኤሌክትሮኒክ ደረሰኝ ነው።'
                  : 'This electronic receipt is digitally registered and protected under HRMS Escrow Trust.'}
              </Text>
            </View>

            {/* Share / Save Action */}
            <TouchableOpacity onPress={handleShare} style={[styles.shareBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareBtnText}>
                {isAmharic ? 'ደረሰኝ አጋራ / አስቀምጥ' : 'Share / Save Receipt'}
              </Text>
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
    justifyContent: 'center',
    padding: 16,
  },
  receiptCard: {
    borderRadius: 22,
    borderWidth: 1,
    maxHeight: '88%',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 18,
  },
  stampWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stampCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmedTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  receiptNumber: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  breakdownBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerSeal: {
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  sealText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
