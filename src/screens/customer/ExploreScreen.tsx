import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { PropertyCard } from '../../components/PropertyCard';
import { EmptyState } from '../../components/EmptyState';
import { FilterModal, FilterCriteria } from '../../components/FilterModal';
import api from '../../config/api';
import { extractArray } from '../../utils/apiData';
import { House, TransactionType } from '../../types';

const SAVED_HOUSES_KEY = '@hrms_saved_house_ids';

export const ExploreScreen: React.FC<{ route?: any; navigation: any }> = ({ route, navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, isAmharic, toggleLanguage } = useLanguage();
  const { user } = useAuth();

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | 'ALL'>('ALL');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria>({
    transactionType: 'ALL',
    propertyType: 'ALL',
    minBedrooms: 0,
    maxPrice: null,
  });

  // Load saved bookmarks
  useEffect(() => {
    AsyncStorage.getItem(SAVED_HOUSES_KEY).then((data) => {
      if (data) {
        try {
          setSavedIds(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  const toggleSaveHouse = async (houseId: string) => {
    let updated: string[];
    if (savedIds.includes(houseId)) {
      updated = savedIds.filter((id) => id !== houseId);
    } else {
      updated = [...savedIds, houseId];
    }
    setSavedIds(updated);
    await AsyncStorage.setItem(SAVED_HOUSES_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    if (route?.params?.initialSearch) {
      setSearchQuery(route.params.initialSearch);
    }
    if (route?.params?.initialType) {
      setAdvancedFilters((prev) => ({
        ...prev,
        propertyType: route.params.initialType,
      }));
    }
  }, [route?.params]);

  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      try {
        response = await api.get('/public/houses');
      } catch {
        response = await api.get('/houses');
      }
      const data = extractArray<House>(response, 'houses');
      setHouses(data);
    } catch (err: any) {
      console.warn('Error fetching houses:', err.message);
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

  // Filter pipeline
  const filteredHouses = houses.filter((h) => {
    // Search query matches title, description, or city
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (h.title || '').toLowerCase().includes(q);
      const matchCity = (h.location?.city || '').toLowerCase().includes(q);
      const matchDesc = (h.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchDesc) return false;
    }

    // Quick Tab filter
    if (selectedTransaction !== 'ALL') {
      if (h.transactionType && h.transactionType !== selectedTransaction) {
        return false;
      }
    }

    // Advanced filters
    if (advancedFilters.propertyType !== 'ALL') {
      if (h.propertyType !== advancedFilters.propertyType) {
        return false;
      }
    }

    if (advancedFilters.minBedrooms > 0) {
      if ((h.details?.bedrooms || 0) < advancedFilters.minBedrooms) {
        return false;
      }
    }

    if (advancedFilters.maxPrice && advancedFilters.maxPrice > 0) {
      if ((h.price || 0) > advancedFilters.maxPrice) {
        return false;
      }
    }

    return true;
  });

  const transactionPills: Array<{ key: TransactionType | 'ALL'; label: string }> = [
    { key: 'ALL', label: isAmharic ? 'ሁሉም' : 'All' },
    { key: 'RENT', label: isAmharic ? 'የሚከራይ' : 'For Rent' },
    { key: 'BUY', label: isAmharic ? 'የሚሸጥ' : 'For Sale' },
    { key: 'SHORT_STAY', label: isAmharic ? 'አጭር ቆይታ' : 'Short Stay' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surfaceSecondary,
                marginRight: 10,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.textMuted }]} numberOfLines={1}>
              {user?.name
                ? `${isAmharic ? 'እንኳን ደህና መጡ፣ ' : 'Welcome, '}${user.name}`
                : isAmharic ? 'እንኳን ደህና መጡ' : 'Welcome to HRMS'}
            </Text>
            <Text style={[styles.mainHeading, { color: colors.text }]} numberOfLines={1}>
              {isAmharic ? 'ምርጥ ቤቶችን ይፈልጉ' : 'Discover Properties'}
            </Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={[styles.smallPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          >
            <Text style={[styles.pillText, { color: colors.primary }]}>
              {isAmharic ? 'EN' : 'አማ'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={isDark ? '#F59E0B' : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('action.search', 'Search by city, title, or type...')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterTriggerBtn, { backgroundColor: '#06B6D4' }]}
          onPress={() => navigation.navigate('MapSearch')}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTriggerBtn, { backgroundColor: colors.primary }]}
          onPress={() => setIsFilterVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Transaction Pills Bar */}
      <View style={styles.pillsContainer}>
        <FlatList
          data={transactionPills}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
          renderItem={({ item }) => {
            const isSelected = selectedTransaction === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedTransaction(item.key);
                  setAdvancedFilters({ ...advancedFilters, transactionType: item.key });
                }}
              >
                <Text
                  style={[
                    styles.pillLabel,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Properties List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {isAmharic ? 'ቤቶች በመጫን ላይ ናቸው...' : 'Loading verified properties...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHouses}
          keyExtractor={(item) => item._id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <PropertyCard
              house={item}
              onPress={() => navigation.navigate('PropertyDetail', { house: item })}
              isSaved={savedIds.includes(item._id)}
              onToggleSave={() => toggleSaveHouse(item._id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="home-outline"
              title={isAmharic ? 'ምንም ቤቶች አልተገኙም' : 'No Properties Found'}
              description={
                isAmharic
                  ? 'ከተጠቀሰው ፍለጋ ጋር የሚስማማ ቤት አልተገኘም። ማጣሪያዎችን ይቀይሩ።'
                  : 'We could not find any properties matching your current search or filter criteria.'
              }
              actionLabel={isAmharic ? 'ማጣሪያዎችን አጥፋ' : 'Clear Filters'}
              onAction={() => {
                setSearchQuery('');
                setSelectedTransaction('ALL');
                setAdvancedFilters({
                  transactionType: 'ALL',
                  propertyType: 'ALL',
                  minBedrooms: 0,
                  maxPrice: null,
                });
              }}
            />
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        filters={advancedFilters}
        onApply={(f) => {
          setAdvancedFilters(f);
          setSelectedTransaction(f.transactionType);
        }}
        onReset={() => {
          setSelectedTransaction('ALL');
          setAdvancedFilters({
            transactionType: 'ALL',
            propertyType: 'ALL',
            minBedrooms: 0,
            maxPrice: null,
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 10) + 8 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  greeting: {
    ...typography.caption,
  },
  mainHeading: {
    ...typography.h3,
    fontWeight: '800',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  smallPill: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  filterTriggerBtn: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillsContainer: {
    paddingVertical: spacing.sm,
  },
  pillsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '600',
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
  loadingText: {
    ...typography.body2,
    marginTop: spacing.md,
  },
});
