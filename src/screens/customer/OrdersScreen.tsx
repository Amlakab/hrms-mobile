import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { MaintenanceModal } from '../../components/MaintenanceModal';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { Order } from '../../types';

export const OrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PURCHASE' | 'RENT' | 'INQUIRY'>('ALL');
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const isCustomer = user?.role === 'customer' || user?.role === 'user';
      let res;
      try {
        res = await api.get(isCustomer ? '/orders/my' : '/orders');
      } catch {
        res = await api.get('/orders');
      }
      let data: Order[] = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      setOrders(data);
    } catch (err: any) {
      console.warn('Failed to fetch user orders', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.orderType === activeTab;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
      case 'CANCELLED':
        return 'error';
      case 'UNDER_REVIEW':
        return 'info';
      case 'PENDING':
      default:
        return 'warning';
    }
  };

  const tabs: Array<{ key: 'ALL' | 'PURCHASE' | 'RENT' | 'INQUIRY'; label: string }> = [
    { key: 'ALL', label: isAmharic ? 'ሁሉም' : 'All' },
    { key: 'RENT', label: isAmharic ? 'የኪራይ' : 'Rent' },
    { key: 'PURCHASE', label: isAmharic ? 'የግዢ' : 'Purchase' },
    { key: 'INQUIRY', label: isAmharic ? 'ጉብኝቶች' : 'Tours' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('nav.orders', 'My Orders & Leases')}
        subtitle={isAmharic ? 'የግዢ፣ የኪራይ እና የጉብኝት ጥያቄዎች' : 'Track offers, tenancy agreements, and tours'}
        rightAction={
          <TouchableOpacity
            style={[styles.maintenanceBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsMaintenanceOpen(true)}
          >
            <Ionicons name="construct-outline" size={15} color="#FFFFFF" />
            <Text style={styles.maintenanceBtnText}>
              {isAmharic ? 'ጥገና' : 'Fix'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.key;
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
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Order List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => {
            const houseObj = typeof item.houseId === 'object' ? item.houseId : null;
            return (
              <View
                style={[
                  styles.orderCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderTypeRow}>
                    <Ionicons
                      name={
                        item.orderType === 'PURCHASE'
                          ? 'cash-outline'
                          : item.orderType === 'RENT'
                          ? 'key-outline'
                          : 'calendar-outline'
                      }
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={[styles.orderTypeTitle, { color: colors.text }]}>
                      {item.orderType}
                    </Text>
                  </View>

                  <Badge
                    label={t(`status.${(item.status || 'PENDING').toLowerCase()}`, item.status)}
                    variant={getStatusVariant(item.status)}
                    size="sm"
                  />
                </View>

                {houseObj && (
                  <Text style={[styles.houseTitle, { color: colors.text }]} numberOfLines={1}>
                    {houseObj.title}
                  </Text>
                )}

                {item.proposedPrice && (
                  <Text style={[styles.priceTag, { color: colors.primary }]}>
                    ETB {item.proposedPrice.toLocaleString()}{' '}
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                      {item.orderType === 'RENT' ? (isAmharic ? '/ወር' : '/mo') : ''}
                    </Text>
                  </Text>
                )}

                {item.message ? (
                  <Text style={[styles.orderMessage, { color: colors.textMuted }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                ) : null}

                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <Text style={[styles.dateText, { color: colors.textMuted }]}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </Text>

                  {houseObj && (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('PropertyDetail', { house: houseObj })}
                      style={styles.viewHouseLink}
                    >
                      <Text style={[styles.viewHouseText, { color: colors.primary }]}>
                        {isAmharic ? 'ቤቱን ይመልከቱ' : 'View Property'}
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title={isAmharic ? 'ምንም ትዕዛዞች የሉም' : 'No Orders Yet'}
              description={
                isAmharic
                  ? 'እስካሁን ያቀረቡት የኪራይ ወይም የግዢ ጥያቄ የለም። ቤቶችን ያስሱ እና ጥያቄዎን ያቅርቡ።'
                  : 'You have not submitted any lease applications or purchase offers yet.'
              }
              actionLabel={isAmharic ? 'ቤቶችን ያስሱ' : 'Browse Properties'}
              onAction={() => navigation.navigate('Home')}
            />
          }
        />
      )}

      {/* Maintenance Ticket Modal */}
      <MaintenanceModal
        visible={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        onSuccess={fetchOrders}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  maintenanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: borderRadius.md,
  },
  maintenanceBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderTypeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  houseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  priceTag: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  orderMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  dateText: {
    fontSize: 11,
  },
  viewHouseLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewHouseText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
