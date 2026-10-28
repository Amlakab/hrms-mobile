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
import { PropertyCard } from '../../components/PropertyCard';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing } from '../../constants/theme';
import api from '../../config/api';
import { House } from '../../types';

import { extractArray } from '../../utils/apiData';

export const MyListingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user } = useAuth();

  const [myHouses, setMyHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch houses filtered by owner or agent
      const res = await api.get('/houses');
      const all: House[] = extractArray<House>(res, 'houses');

      // Filter by current user ID if present, or show all for owner demo
      const mine = all.filter(
        (h) =>
          h.owner_id === user?._id ||
          (typeof h.owner_id === 'object' && h.owner_id?._id === user?._id) ||
          h.agent_id === user?._id ||
          (typeof h.agent_id === 'object' && h.agent_id?._id === user?._id)
      );

      setMyHouses(mine.length > 0 ? mine : all.slice(0, 5));
    } catch (err: any) {
      console.warn('Error fetching host listings', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      fetchMyListings();
    });
    return unsub;
  }, [navigation, fetchMyListings]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('nav.listings', 'My Properties')}
        subtitle={isAmharic ? 'የእርስዎ ንብረቶች እና የማረጋገጫ ሁኔታ' : 'Your managed listings and approvals'}
        showBack={true}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={myHouses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMyListings();
              }}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <PropertyCard
                house={item}
                onPress={() => navigation.navigate('PropertyDetail', { house: item })}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditHouse', { house: item, houseId: item._id })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceSecondary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    gap: 4,
                  }}
                >
                  <Ionicons name="create-outline" size={15} color={colors.primary} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                    {isAmharic ? 'አሻሽል' : 'Edit'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      isAmharic ? 'ንብረት ሰርዝ' : 'Delete Listing',
                      isAmharic ? 'ይህንን ቤት ከስርዓቱ መሰረዝ እርግጠኛ ነዎት?' : 'Are you sure you want to delete this listing?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await api.delete(`/houses/${item._id}`);
                              fetchMyListings();
                            } catch (err: any) {
                              Alert.alert('Error', err.response?.data?.message || 'Failed to delete listing.');
                            }
                          },
                        },
                      ]
                    );
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    gap: 4,
                  }}
                >
                  <Ionicons name="trash-outline" size={15} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>
                    {isAmharic ? 'ሰርዝ' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title={isAmharic ? 'ምንም የተመዘገበ ቤት የለም' : 'No Listings Found'}
              description={
                isAmharic
                  ? 'እስካሁን ምንም ቤት አልመዘገቡም። "አዲስ ቤት መዝግብ" የሚለውን ይጫኑ።'
                  : 'You have not added any properties to your portfolio yet.'
              }
              actionLabel={isAmharic ? 'አዲስ ቤት መዝግብ' : 'Add Property'}
              onAction={() => navigation.navigate('CreateHouse')}
            />
          }
        />
      )}

      {/* Floating Add Property Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateHouse')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
