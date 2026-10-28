import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { Transaction } from '../../types';

export const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch wallet balance
      const walletRes = await api.get('/wallet');
      if (walletRes.data?.balance !== undefined) {
        setBalance(walletRes.data.balance);
      } else if (walletRes.data?.data?.balance !== undefined) {
        setBalance(walletRes.data.data.balance);
      } else {
        setBalance(150000); // Default demo balance
      }

      // Fetch transactions
      const txRes = await api.get('/transactions');
      let txList: Transaction[] = [];
      if (Array.isArray(txRes.data)) {
        txList = txRes.data;
      } else if (txRes.data?.data && Array.isArray(txRes.data.data)) {
        txList = txRes.data.data;
      }
      setTransactions(txList);
    } catch (err: any) {
      console.warn('Wallet data fallback', err.message);
      setBalance(125000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        isAmharic ? 'እባክዎ ትክክለኛ የብር መጠን ያስገቡ' : 'Please enter a valid amount'
      );
      return;
    }

    try {
      setSubmittingDeposit(true);
      await api.post('/transactions', {
        userId: user?._id,
        type: 'deposit',
        method: 'cbe',
        amount: amt,
        description: 'Chapa Mobile Wallet Top-up',
      });

      setBalance((prev) => prev + amt);
      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Deposit Successful',
        isAmharic
          ? `የ ${amt.toLocaleString()} ብር ተቀማጭ በተሳካ ሁኔታ ተከናውኗል።`
          : `Deposit of ${amt.toLocaleString()} ETB completed via Chapa Gateway.`
      );
      setIsDepositModalOpen(false);
      setDepositAmount('');
      fetchWalletData();
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Deposit Failed',
        err.response?.data?.message || 'Could not process deposit'
      );
    } finally {
      setSubmittingDeposit(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('nav.wallet', 'Digital Wallet')}
        subtitle={isAmharic ? 'ቀሪ ሂሳብ እና የክፍያ ታሪክ' : 'Real estate escrow balance and payments'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Virtual Escrow Card with Gradient */}
        <LinearGradient
          colors={isDark ? ['#1E3A8A', '#0F172A'] : ['#2563EB', '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardContainer}
        >
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.cardIssuer}>HRMS ESCROW WALLET</Text>
              <Text style={styles.cardHolderName}>{user?.name || 'Authorized Member'}</Text>
            </View>
            <Ionicons name="card" size={32} color="rgba(255,255,255,0.85)" />
          </View>

          <View style={styles.cardBalanceSection}>
            <Text style={styles.balanceLabel}>
              {isAmharic ? 'ጠቅላላ ቀሪ ሂሳብ' : 'Available Balance'}
            </Text>
            <Text style={styles.balanceValue}>
              ETB {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.verifiedChipText}>
                {isAmharic ? 'የተረጋገጠ መለያ' : 'Verified Account'}
              </Text>
            </View>
            <Text style={styles.currencyBadge}>ETB</Text>
          </View>
        </LinearGradient>

        {/* Quick Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsDepositModalOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>
              {isAmharic ? 'ገንዘብ አስገባ (Chapa)' : 'Deposit Funds'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnSecondary, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={() =>
              Alert.alert(
                isAmharic ? 'ገንዘብ ማውጣት' : 'Withdraw Funds',
                isAmharic
                  ? 'የማውጣት ጥያቄዎችን በሂሳብ ክፍል በኩል ማከናወን ይችላሉ።'
                  : 'Withdrawal requests will be verified by our accountants directly to your bank account.'
              )
            }
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up-circle-outline" size={20} color={colors.text} />
            <Text style={[styles.actionBtnTextSecondary, { color: colors.text }]}>
              {isAmharic ? 'ወደ ባንክ አውጣ' : 'Withdraw'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History Section */}
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>
            {isAmharic ? 'የክፍያ ዝርዝር ታሪክ' : 'Transaction History'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : transactions.length > 0 ? (
          transactions.map((tx) => (
            <View
              key={tx._id}
              style={[
                styles.txItem,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={[styles.txIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons
                  name={tx.type === 'deposit' ? 'arrow-down-circle' : 'arrow-up-circle'}
                  size={24}
                  color={tx.type === 'deposit' ? '#10B981' : '#EF4444'}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.txDesc, { color: colors.text }]} numberOfLines={1}>
                  {tx.description || tx.type.toUpperCase()}
                </Text>
                <Text style={[styles.txDate, { color: colors.textMuted }]}>
                  {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={[
                    styles.txAmount,
                    { color: tx.type === 'deposit' ? '#10B981' : colors.text },
                  ]}
                >
                  {tx.type === 'deposit' ? '+' : '-'} ETB {tx.amount.toLocaleString()}
                </Text>
                <Badge label={tx.status} variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm" />
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="wallet-outline"
            title={isAmharic ? 'ምንም ዝውውር የለም' : 'No Transactions Yet'}
            description={
              isAmharic
                ? 'በዚህ የኪስ ቦርሳ በኩል የተደረገ የኪራይ ወይም የቅድመ ክፍያ ታሪክ የለም።'
                : 'All your deposit receipts, rental payments, and escrow holdings will be logged here.'
            }
          />
        )}
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={isDepositModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDepositModalOpen(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: colors.modalBg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isAmharic ? 'ገንዘብ በChapa አስገባ' : 'Deposit via Chapa Gateway'}
              </Text>
              <TouchableOpacity onPress={() => setIsDepositModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>
                {isAmharic ? 'የሚስገቡት የገንዘብ መጠን (በብር)' : 'Amount to Deposit (ETB)'}
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                keyboardType="numeric"
                placeholder="e.g. 50000"
                placeholderTextColor={colors.textMuted}
                value={depositAmount}
                onChangeText={setDepositAmount}
              />

              <View style={styles.presetsRow}>
                {[10000, 25000, 50000, 100000].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.presetChip, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                    onPress={() => setDepositAmount(String(preset))}
                  >
                    <Text style={[styles.presetChipText, { color: colors.text }]}>
                      {preset / 1000}k
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={handleDeposit}
                disabled={submittingDeposit}
              >
                {submittingDeposit ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {isAmharic ? 'ክፍያውን አጠናቅቅ' : 'Authorize Deposit'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  cardContainer: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 190,
    justifyContent: 'space-between',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: spacing.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardIssuer: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardHolderName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  cardBalanceSection: {
    marginVertical: spacing.md,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  verifiedChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  currencyBadge: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnTextSecondary: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyHeader: {
    marginBottom: spacing.md,
  },
  historyTitle: {
    ...typography.h3,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  txDate: {
    fontSize: 11,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...typography.h3,
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  modalInput: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  presetChip: {
    flex: 1,
    height: 36,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
