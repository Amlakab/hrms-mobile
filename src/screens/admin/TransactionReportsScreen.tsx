import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../config/api';
import { spacing } from '../../constants/theme';

export const TransactionReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions?limit=100');
      setTransactions(res.data?.data || []);
    } catch (err: any) {
      console.warn('Could not fetch transaction report data', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Aggregate metrics
  const totalVolume = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalPurchases = transactions
    .filter((t) => t.type === 'property_purchase' || t.type === 'milestone')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const completedCount = transactions.filter((t) => t.status === 'completed' || t.status === 'approved' || t.status === 'confirmed').length;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType =
      selectedType === 'ALL' ||
      (selectedType === 'DEPOSIT' && tx.type === 'deposit') ||
      (selectedType === 'PURCHASE' && (tx.type === 'property_purchase' || tx.type === 'milestone'));

    const matchesMethod =
      selectedMethod === 'ALL' ||
      tx.method?.toLowerCase() === selectedMethod.toLowerCase();

    const matchesSearch =
      !search.trim() ||
      tx.reference?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.senderPhone?.includes(search);

    return matchesType && matchesMethod && matchesSearch;
  });

  const handleShareReport = async () => {
    try {
      await Share.share({
        title: 'HRMS Financial & Transaction Audit Report',
        message: `HRMS Real Estate Platform - Financial & Transaction Summary\n\nTotal Volume: ETB ${totalVolume.toLocaleString()}\nTotal Deposits: ETB ${totalDeposits.toLocaleString()}\nTotal Property Sales: ETB ${totalPurchases.toLocaleString()}\nSettled Transactions: ${completedCount}\nPending Escrow Verifications: ${pendingCount}\nTotal Transactions Tracked: ${transactions.length}\nDate Generated: ${new Date().toLocaleDateString()}`,
      });
    } catch (err) {
      Alert.alert('Share', 'Could not open share dialogue.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የግብይት ሪፖርቶች እና ኦዲት' : 'Financial Reports'}
        subtitle={isAmharic ? 'የገንዘብ ዝውውር፣ የተቀማጭ እና የሽያጭ ትንተና' : 'Transaction Volumes, Escrow & Revenue Audit'}
        showBack={true}
        rightAction={
          <TouchableOpacity onPress={handleShareReport} style={[styles.exportBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="share-outline" size={16} color="#FFFFFF" />
            <Text style={styles.exportBtnText}>{isAmharic ? 'አጋራ' : 'Export'}</Text>
          </TouchableOpacity>
        }
      />

      {/* KPI Cards Grid */}
      <View style={[styles.kpiGrid, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.kpiBox, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{isAmharic ? 'አጠቃላይ ዝውውር' : 'Total Volume'}</Text>
          <Text style={[styles.kpiVal, { color: colors.primary }]}>ETB {totalVolume.toLocaleString()}</Text>
        </View>

        <View style={[styles.kpiBox, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{isAmharic ? 'የንብረት ሽያጭ' : 'Property Sales'}</Text>
          <Text style={[styles.kpiVal, { color: colors.success }]}>ETB {totalPurchases.toLocaleString()}</Text>
        </View>

        <View style={[styles.kpiBox, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{isAmharic ? 'የኪስ ተቀማጭ' : 'Deposits'}</Text>
          <Text style={[styles.kpiVal, { color: colors.text }]}>ETB {totalDeposits.toLocaleString()}</Text>
        </View>

        <View style={[styles.kpiBox, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{isAmharic ? 'በመጠባበቅ ላይ' : 'Pending Escrow'}</Text>
          <Text style={[styles.kpiVal, { color: colors.warning }]}>{pendingCount} Txns</Text>
        </View>
      </View>

      {/* Filter and Search Bar */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={isAmharic ? 'በማጣቀሻ ወይም በስልክ ፈልግ...' : 'Search by reference or phone...'}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'PURCHASE', label: 'Property Sales' },
            { id: 'DEPOSIT', label: 'Deposits' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelectedType(item.id)}
              style={[
                styles.typePill,
                {
                  backgroundColor: selectedType === item.id ? colors.primary : isDark ? '#1E293B' : '#E2E8F0',
                  borderColor: selectedType === item.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.typePillText, { color: selectedType === item.id ? '#FFFFFF' : colors.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReports(); }} />}
        >
          {filteredTransactions.map((tx: any) => (
            <View
              key={tx._id}
              style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <View style={styles.reportCardHeader}>
                <View style={styles.refRow}>
                  <Ionicons
                    name={tx.method === 'telebirr' ? 'phone-portrait-outline' : 'business-outline'}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.refCode, { color: colors.text }]}>{tx.reference || 'N/A'}</Text>
                </View>
                <Badge
                  label={tx.status}
                  variant={tx.status === 'completed' || tx.status === 'approved' ? 'success' : tx.status === 'failed' ? 'danger' : 'warning'}
                  size="sm"
                />
              </View>

              <View style={styles.reportCardBody}>
                <Text style={[styles.amountText, { color: colors.success }]}>
                  ETB {tx.amount?.toLocaleString()}
                </Text>
                <Text style={[styles.typeMethod, { color: colors.textSecondary }]}>
                  {tx.type} • {tx.method?.toUpperCase()}
                </Text>
              </View>

              <View style={[styles.reportCardFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.dateText, { color: colors.textMuted }]}>
                  {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {tx.senderPhone ? (
                  <Text style={[styles.senderText, { color: colors.textMuted }]}>
                    Sender: {tx.senderPhone}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}

          {filteredTransactions.length === 0 && (
            <EmptyState
              icon="bar-chart-outline"
              title="No Matching Records"
              description="No financial transactions match your filter criteria."
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    marginRight: 6,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  kpiBox: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  kpiVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  filterBar: {
    padding: spacing.md,
    gap: 8,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  typeScroll: {
    gap: 8,
    paddingTop: 4,
  },
  typePill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollList: {
    padding: spacing.md,
    gap: 10,
  },
  reportCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refCode: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  reportCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  typeMethod: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  reportCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 0.5,
  },
  dateText: {
    fontSize: 11,
  },
  senderText: {
    fontSize: 11,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
