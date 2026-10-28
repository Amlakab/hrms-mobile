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
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { PropertyCard } from '../../components/PropertyCard';
import { Badge } from '../../components/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { extractArray } from '../../utils/apiData';
import { House, HouseStatus, ApprovalStatus } from '../../types';

export const AdminHousesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user } = useAuth();

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'AVAILABLE' | 'RENTED' | 'SOLD' | 'PENDING'>('ALL');
  const [statusModalHouse, setStatusModalHouse] = useState<House | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch houses with proper admin authentication
      let res;
      try {
        res = await api.get('/houses');
      } catch {
        res = await api.get('/public/houses');
      }
      const data = extractArray<House>(res, 'houses');
      setHouses(data);
    } catch (err: any) {
      console.warn('Error fetching houses for admin:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHouses();
  };

  const handleDeleteHouse = (house: House) => {
    Alert.alert(
      isAmharic ? 'ቤቱን ሰርዝ' : 'Delete Property',
      isAmharic ? 'ይህንን ቤት ከሲስተሙ ላይ በቋሚነት መሰረዝ ይፈልጋሉ?' : 'Are you sure you want to permanently delete this listing?',
      [
        { text: isAmharic ? 'ይቅር' : 'Cancel', style: 'cancel' },
        {
          text: isAmharic ? 'አዎ አጥፋ' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/houses/${house._id}`);
              setHouses((prev) => prev.filter((h) => h._id !== house._id));
              Alert.alert(isAmharic ? 'ተሰርዟል' : 'Deleted', isAmharic ? 'ቤቱ በተሳካ ሁኔታ ተሰርዟል።' : 'Property deleted successfully.');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (newStatus: HouseStatus) => {
    if (!statusModalHouse) return;
    try {
      setUpdating(true);
      await api.patch(`/houses/${statusModalHouse._id}/status`, { status: newStatus });
      setHouses((prev) =>
        prev.map((h) => (h._id === statusModalHouse._id ? { ...h, status: newStatus } : h))
      );
      setStatusModalHouse(null);
      Alert.alert(isAmharic ? 'ተሳክቷል' : 'Status Updated', isAmharic ? 'የቤቱ ሁኔታ ተቀይሯል።' : 'House status successfully updated.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleApproveHouse = async (house: House, approve: boolean) => {
    try {
      const approvalStatus = approve ? 'APPROVED' : 'REJECTED';
      await api.patch(`/houses/${house._id}/approve`, { approvalStatus });
      setHouses((prev) =>
        prev.map((h) => (h._id === house._id ? { ...h, approvalStatus: approvalStatus as any } : h))
      );
      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        approve
          ? (isAmharic ? 'ቤቱ ጸድቆ ለህዝብ እይታ ክፍት ሆኗል' : 'House approved and published')
          : (isAmharic ? 'ቤቱ ውድቅ ተደርጓል' : 'House submission rejected')
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update approval status');
    }
  };

  const filteredHouses = houses.filter((h) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (h.title || '').toLowerCase().includes(q);
      const matchCity = (h.location?.city || '').toLowerCase().includes(q);
      const matchAddr = (h.location?.address || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchAddr) return false;
    }

    if (selectedFilter === 'AVAILABLE' && h.status !== 'AVAILABLE') return false;
    if (selectedFilter === 'RENTED' && h.status !== 'RENTED') return false;
    if (selectedFilter === 'SOLD' && h.status !== 'SOLD') return false;
    if (selectedFilter === 'PENDING' && h.approvalStatus !== 'PENDING') return false;

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('portal.houses', 'Properties Management')}
        subtitle={isAmharic ? 'ቤቶችን ማስተዳደር፣ ማጽደቅ እና ማስተካከል' : 'Manage listings, pricing, approvals & status'}
        showBack={true}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateHouse')}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>
              {isAmharic ? 'አዲስ ቤት' : 'Add'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={isAmharic ? 'ቤቶችን ይፈልጉ...' : 'Search properties by title or location...'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['ALL', 'AVAILABLE', 'RENTED', 'SOLD', 'PENDING'] as const).map((filterKey) => {
            const isSelected = selectedFilter === filterKey;
            let label = filterKey as string;
            if (filterKey === 'ALL') label = isAmharic ? 'ሁሉም' : 'All';
            if (filterKey === 'AVAILABLE') label = isAmharic ? 'የሚገኙ' : 'Available';
            if (filterKey === 'RENTED') label = isAmharic ? 'የተከራዩ' : 'Rented';
            if (filterKey === 'SOLD') label = isAmharic ? 'የተሸጡ' : 'Sold';
            if (filterKey === 'PENDING') label = isAmharic ? 'በመጠባበቅ' : 'Pending';

            return (
              <TouchableOpacity
                key={filterKey}
                onPress={() => setSelectedFilter(filterKey)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* House List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {isAmharic ? 'ቤቶች በመጫን ላይ ናቸው...' : 'Loading properties...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHouses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View style={[styles.houseCardWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <PropertyCard
                house={item}
                onPress={() => navigation.navigate('PropertyDetail', { house: item })}
              />

              {/* Action Buttons Bar */}
              <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                {item.approvalStatus === 'PENDING' && (
                  <TouchableOpacity
                    onPress={() => handleApproveHouse(item, true)}
                    style={[styles.actionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={[styles.actionBtnText, { color: "#10B981" }]}>
                      {isAmharic ? 'አጽድቅ' : 'Approve'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setStatusModalHouse(item)}
                  style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <Ionicons name="options-outline" size={16} color={colors.text} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>
                    {isAmharic ? 'ሁኔታ ቀይር' : 'Status'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('EditHouse', { houseId: item._id })}
                  style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                >
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                    {isAmharic ? 'አስተካክል' : 'Edit'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteHouse(item)}
                  style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>
                    {isAmharic ? 'ሰርዝ' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {isAmharic ? 'ምንም አይነት የተመዘገበ ቤት አልተገኘም' : 'No properties found'}
              </Text>
            </View>
          }
        />
      )}

      {/* Status Change Modal */}
      <Modal visible={!!statusModalHouse} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isAmharic ? 'የቤቱን ሁኔታ ይምረጡ' : 'Change Property Status'}
              </Text>
              <TouchableOpacity onPress={() => setStatusModalHouse(null)}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              {statusModalHouse?.title}
            </Text>

            <View style={styles.statusOptions}>
              {(['AVAILABLE', 'RENTED', 'SOLD', 'UNAVAILABLE'] as HouseStatus[]).map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => handleUpdateStatus(st)}
                  disabled={updating}
                  style={[
                    styles.statusChoiceBtn,
                    {
                      backgroundColor: statusModalHouse?.status === st ? colors.primaryLight : colors.surfaceSecondary,
                      borderColor: statusModalHouse?.status === st ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChoiceText,
                      { color: statusModalHouse?.status === st ? colors.primary : colors.text },
                    ]}
                  >
                    {t(`status.${st.toLowerCase()}`, st)}
                  </Text>
                  {statusModalHouse?.status === st && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.md,
  },
  houseCardWrapper: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    fontSize: 12,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: spacing.md,
  },
  statusOptions: {
    gap: spacing.sm,
  },
  statusChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  statusChoiceText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
