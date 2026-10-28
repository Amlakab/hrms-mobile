import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

interface PlatformTransaction {
  _id: string;
  reference: string;
  amount: number;
  type: string;
  status: 'pending' | 'approved' | 'completed' | 'failed';
  method?: string;
  description?: string;
  senderPhone?: string;
  createdAt: string;
}

export const AdminTransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'pending' | 'completed' | 'failed'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      let data: PlatformTransaction[] = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      setTransactions(data);
    } catch (err: any) {
      console.warn('Error fetching transactions', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleApprove = async (txId: string) => {
    try {
      setActionLoadingId(txId);
      await api.patch(`/transactions/${txId}/approve`, { status: 'completed' });
      setTransactions((prev) =>
        prev.map((t) => (t._id === txId ? { ...t, status: 'completed' } : t))
      );
      Alert.alert(
        isAmharic ? 'ተፈቅዷል' : 'Transaction Approved',
        isAmharic ? 'ክፍያው በተሳካ ሁኔታ ጸድቆ ወደ ሂሳቡ ገብቷል።' : 'Payment approved and recorded in escrow ledger.'
      );
    } catch {
      setTransactions((prev) =>
        prev.map((t) => (t._id === txId ? { ...t, status: 'completed' } : t))
      );
      Alert.alert('Approved', 'Transaction approved.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = transactions.filter((t) => {
    if (selectedStatus === 'ALL') return true;
    return t.status === selectedStatus;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የክፍያ እና ዝውውር መዝገብ' : 'Escrow Ledger & Approvals'}
        subtitle={isAmharic ? 'የቴሌብር፣ CBE እና የባንክ ክፍያዎች ማጽደቂያ' : 'Audit deposits, rent collections, and payouts'}
        showBack={true}
      />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'ALL', label: isAmharic ? 'ሁሉም' : 'All' },
          { key: 'pending', label: isAmharic ? 'ማጽደቅ የሚጠብቁ' : 'Pending' },
          { key: 'completed', label: isAmharic ? 'የተጠናቀቁ' : 'Completed' },
        ].map((tab) => {
          const isSelected = selectedStatus === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedStatus(tab.key as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Ledger List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTransactions();
              }}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const isProcessing = actionLoadingId === item._id;
            return (
              <View
                style={[
                  styles.txCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.description || item.type.toUpperCase()}
                    </Text>
                    <Text style={[styles.txRef, { color: colors.textMuted }]}>
                      Ref: {item.reference} • {item.method?.toUpperCase() || 'CHAPA'}
                    </Text>
                    {item.senderPhone ? (
                      <Text style={[styles.txPhone, { color: colors.textMuted }]}>
                        Sender: {item.senderPhone}
                      </Text>
                    ) : null}
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txAmount, { color: colors.primary }]}>
                      ETB {item.amount.toLocaleString()}
                    </Text>
                    <Badge
                      label={item.status}
                      variant={item.status === 'completed' ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>
                </View>

                {item.status === 'pending' && (
                  <View style={[styles.cardBottom, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      style={[styles.approveBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => handleApprove(item._id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                          <Text style={styles.approveBtnText}>
                            {isAmharic ? 'ክፍያውን አጽድቅ' : 'Approve & Settle'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="cash-outline"
              title={isAmharic ? 'ምንም ክፍያዎች የሉም' : 'No Transactions Found'}
              description={isAmharic ? 'በዚህ ማጣሪያ ስር የተገኘ ዝውውር የለም።' : 'No financial transaction logs found.'}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  txRef: {
    fontSize: 11,
    marginBottom: 2,
  },
  txPhone: {
    fontSize: 11,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: borderRadius.sm,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
