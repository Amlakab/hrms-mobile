import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '../../components/Header';
import { PropertyCard } from '../../components/PropertyCard';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../constants/theme';
import api from '../../config/api';
import { House } from '../../types';

const SAVED_HOUSES_KEY = '@hrms_saved_house_ids';

export const FavoritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();

  const [savedHouses, setSavedHouses] = useState<House[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedHouses = useCallback(async () => {
    try {
      setLoading(true);
      const savedStr = await AsyncStorage.getItem(SAVED_HOUSES_KEY);
      if (!savedStr) {
        setSavedHouses([]);
        setSavedIds([]);
        return;
      }

      const ids: string[] = JSON.parse(savedStr);
      setSavedIds(ids);

      if (ids.length === 0) {
        setSavedHouses([]);
        return;
      }

      const res = await api.get('/houses');
      let allHouses: House[] = [];
      if (Array.isArray(res.data)) {
        allHouses = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        allHouses = res.data.data;
      }

      const filtered = allHouses.filter((h) => ids.includes(h._id));
      setSavedHouses(filtered);
    } catch (err: any) {
      console.warn('Error loading saved houses', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSavedHouses();
    });
    return unsubscribe;
  }, [navigation, fetchSavedHouses]);

  const removeBookmark = async (houseId: string) => {
    const updated = savedIds.filter((id) => id !== houseId);
    setSavedIds(updated);
    setSavedHouses((prev) => prev.filter((h) => h._id !== houseId));
    await AsyncStorage.setItem(SAVED_HOUSES_KEY, JSON.stringify(updated));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('nav.saved', 'Saved Properties')}
        subtitle={isAmharic ? 'የእርስዎ ተመራጭ ቤቶች ዝርዝር' : 'Your bookmarked homes and wishlist'}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={savedHouses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchSavedHouses();
              }}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <PropertyCard
              house={item}
              onPress={() => navigation.navigate('PropertyDetail', { house: item })}
              isSaved={true}
              onToggleSave={() => removeBookmark(item._id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title={isAmharic ? 'ምንም የተቀመጠ ቤት የለም' : 'No Saved Properties'}
              description={
                isAmharic
                  ? 'የወደዱትን ቤት ልብ ቅርጽ ያለውን ምልክት በመጫን እዚህ ማስቀመጥ ይችላሉ።'
                  : 'Tap the heart icon on any property to save it to your favorites list for quick access.'
              }
              actionLabel={isAmharic ? 'ቤቶችን ያስሱ' : 'Explore Homes'}
              onAction={() => navigation.navigate('Home')}
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
});
