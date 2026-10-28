import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { spacing } from '../../constants/theme';

interface Transaction {
  _id: string;
  reference: string;
  amount: number;
  type: string;
  status: 'pending' | 'approved' | 'completed' | 'confirmed' | 'failed';
  method: string;
  description?: string;
  houseId?: {
    _id: string;
    title: string;
  };
  senderPhone?: string;
  senderName?: string;
  createdAt: string;
  approvedAt?: string;
}

export const CustomerPaymentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const url = user?._id ? `/transactions/user/${user._id}?limit=50` : '/transactions';
      const res = await api.get(url);
      setTransactions(res.data?.data || []);
    } catch (err: any) {
      console.warn('Could not fetch user transactions', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesTab =
      selectedTab === 'all' ||
      (selectedTab === 'pending' && tx.status === 'pending') ||
      (selectedTab === 'approved' && (tx.status === 'approved' || tx.status === 'confirmed')) ||
      (selectedTab === 'completed' && tx.status === 'completed') ||
      (selectedTab === 'failed' && tx.status === 'failed');

    const matchesSearch =
      !searchQuery.trim() ||
      tx.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.method?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const totalAmount = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const completedAmount = transactions
    .filter((t) => t.status === 'completed' || t.status === 'approved' || t.status === 'confirmed')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የክፍያ ታሪክ' : 'Payment History'}
        subtitle={isAmharic ? 'የባንክ እና የቴሌብር ክፍያዎች ማረጋገጫ' : 'All Bank Transfers & Telebirr Receipts'}
        showBack={true}
      />

      {/* Summary KPI Strip */}
      <View style={[styles.kpiStrip, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
            {isAmharic ? 'አጠቃላይ ክፍያ' : 'Total Volume'}
          </Text>
          <Text style={[styles.kpiVal, { color: colors.text }]}>ETB {totalAmount.toLocaleString()}</Text>
        </View>
        <View style={[styles.kpiDivider, { backgroundColor: colors.border }]} />
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
            {isAmharic ? 'የተረጋገጠ' : 'Confirmed'}
          </Text>
          <Text style={[styles.kpiVal, { color: colors.success }]}>ETB {completedAmount.toLocaleString()}</Text>
        </View>
        <View style={[styles.kpiDivider, { backgroundColor: colors.border }]} />
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
            {isAmharic ? 'በመጠባበቅ ላይ' : 'Pending'}
          </Text>
          <Text style={[styles.kpiVal, { color: colors.warning }]}>{pendingCount}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBox, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={isAmharic ? 'በማጣቀሻ ቁጥር ወይም በባንክ ፈልግ...' : 'Search by reference code or bank...'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.tabsWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'all', label: isAmharic ? 'ሁሉም' : 'All' },
            { id: 'pending', label: isAmharic ? 'በመጠባበቅ ላይ' : 'Pending' },
            { id: 'completed', label: isAmharic ? 'የተጠናቀቀ' : 'Completed' },
            { id: 'approved', label: isAmharic ? 'የተፈቀደ' : 'Approved' },
            { id: 'failed', label: isAmharic ? 'ያልተሳካ' : 'Failed' },
          ].map((tab) => {
            const isSelected = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setSelectedTab(tab.id)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : isDark ? '#111D32' : '#F8FAFC',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tabBtnText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Transaction List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTransactions(); }} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title={isAmharic ? 'ምንም ክፍያ አልተገኘም' : 'No Payments Found'}
              description={isAmharic ? 'ምንም የሚመሳሰል የክፍያ ታሪክ አልተገኘም።' : 'No transactions match your search filter.'}
            />
          }
          renderItem={({ item }) => {
            const propTitle = typeof item.houseId === 'object' ? item.houseId?.title : null;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTx(item)}
                style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                activeOpacity={0.8}
              >
                <View style={styles.txTopRow}>
                  <View style={styles.txRefGroup}>
                    <Ionicons
                      name={item.method === 'telebirr' ? 'phone-portrait-outline' : 'business-outline'}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.txRef, { color: colors.text }]}>{item.reference || 'N/A'}</Text>
                  </View>
                  <Badge
                    label={item.status}
                    variant={item.status === 'completed' || item.status === 'approved' ? 'success' : item.status === 'failed' ? 'danger' : 'warning'}
                    size="sm"
                  />
                </View>

                {propTitle ? (
                  <Text style={[styles.txProp, { color: colors.textSecondary }]} numberOfLines={1}>
                    {propTitle}
                  </Text>
                ) : null}

                <View style={styles.txBottomRow}>
                  <Text style={[styles.txAmount, { color: colors.success }]}>
                    ETB {item.amount?.toLocaleString()}
                  </Text>
                  <Text style={[styles.txDate, { color: colors.textMuted }]}>
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* DETAIL MODAL */}
      <Modal visible={!!selectedTx} transparent animationType="slide" onRequestClose={() => setSelectedTx(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0D1527' : '#FFFFFF', borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="receipt" size={22} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {isAmharic ? 'የክፍያ ዝርዝር መረጃ' : 'Transaction Receipt Details'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTx(null)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <ScrollView contentContainerStyle={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{isAmharic ? 'ማጣቀሻ' : 'Reference'}:</Text>
                  <Text style={[styles.detailValMono, { color: colors.primary }]}>{selectedTx.reference}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{isAmharic ? 'መጠን' : 'Amount'}:</Text>
                  <Text style={[styles.detailValBold, { color: colors.success }]}>ETB {selectedTx.amount?.toLocaleString()}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{isAmharic ? 'ሁኔታ' : 'Status'}:</Text>
                  <Badge label={selectedTx.status} variant={selectedTx.status === 'completed' || selectedTx.status === 'approved' ? 'success' : 'warning'} />
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{isAmharic ? 'ዘዴ' : 'Method'}:</Text>
                  <Text style={[styles.detailVal, { color: colors.text }]}>{selectedTx.method?.toUpperCase()}</Text>
                </View>

                {selectedTx.houseId && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{isAmharic ? 'ንብረት' : 'Property'}:</Text>
                    <Text style={[styles.detailVal, { color: colors.text }]} numberOfLines={2}>
                      {(selectedTx.houseId as any).title}
                    </Text>
                  </View>
                )}

                {selectedTx.senderPhone ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{isAmharic ? 'ስልክ' : 'Sender'}:</Text>
                    <Text style={[styles.detailVal, { color: colors.text }]}>{selectedTx.senderPhone}</Text>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{isAmharic ? 'ቀን' : 'Timestamp'}:</Text>
                  <Text style={[styles.detailVal, { color: colors.text }]}>
                    {new Date(selectedTx.createdAt).toLocaleString()}
                  </Text>
                </View>

                {selectedTx.description ? (
                  <View style={styles.detailBlock}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted, marginBottom: 4 }]}>
                      {isAmharic ? 'መግለጫ' : 'Description'}:
                    </Text>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>{selectedTx.description}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => setSelectedTx(null)}
                  style={[styles.closeModalBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.closeModalBtnText}>{isAmharic ? 'ዝጋ' : 'Close'}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  kpiStrip: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  kpiDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  kpiVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  searchWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  tabsWrap: {
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  tabsScroll: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    gap: 10,
  },
  txCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txRefGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txRef: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  txProp: {
    fontSize: 12,
    marginTop: 2,
  },
  txBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  txDate: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBody: {
    padding: 18,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailValMono: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  detailValBold: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailBlock: {
    paddingTop: 6,
  },
  detailText: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeModalBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
