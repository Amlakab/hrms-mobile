import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { PropertyCard } from '../../components/PropertyCard';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { extractArray } from '../../utils/apiData';
import { House, PropertyType } from '../../types';

const { width } = Dimensions.get('window');

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    titleEn: 'Find Your Dream Home',
    titleAm: 'የህልምዎን ቤት ያግኙ',
    descEn: 'Discover verified luxury villas, modern apartments and prime plots in Ethiopia.',
    descAm: 'በኢትዮጵያ ውስጥ ያሉ የተመረጡ ዘመናዊ ቪላዎች እና የቅንጦት አፓርታማዎችን በቀላሉ ይፈልጉ።',
    badge: 'VERIFIED HOMES',
  },
  {
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    titleEn: 'Luxury Properties & Penthouses',
    titleAm: 'ዘመናዊ የቅንጦት ቤቶች',
    descEn: 'Explore exclusive premium estates in Bole, CMC, and prime Addis Ababa locations.',
    descAm: 'በቦሌ፣ ሲኤምሲ እና በመላው አዲስ አበባ ያሉ ተመራጭ የቅንጦት ቤቶችን ያስሱ።',
    badge: 'EXCLUSIVE LISTINGS',
  },
  {
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    titleEn: 'Secure Tenancy & Escrow Protection',
    titleAm: 'አስተማማኝ ኪራይ እና ክፍያ',
    descEn: 'Digital lease contracts, verified title deeds, and safe escrow milestone payments.',
    descAm: 'ህጋዊ የዲጂታል ኪራይ ውል፣ የተረጋገጡ ሰነዶች እና አስተማማኝ የክፍያ ጥበቃ።',
    badge: 'LEGAL BACKING',
  },
];

const STATS = [
  { count: '1,200+', labelEn: 'Listed Homes', labelAm: 'የተመዘገቡ ቤቶች', icon: 'home-outline' },
  { count: '850+', labelEn: 'Closed Deals', labelAm: 'የተሳኩ ስምምነቶች', icon: 'checkmark-done-circle-outline' },
  { count: '15+', labelEn: 'Cities Covered', labelAm: 'ከተሞች', icon: 'location-outline' },
  { count: '99.8%', labelEn: 'Client Trust', labelAm: 'የደንበኛ እርካታ', icon: 'shield-checkmark-outline' },
];

const PROPERTY_TYPES: Array<{ type: string; labelEn: string; labelAm: string; icon: string }> = [
  { type: 'ALL', labelEn: 'All', labelAm: 'ሁሉም', icon: 'grid-outline' },
  { type: 'APARTMENT', labelEn: 'Apartment', labelAm: 'አፓርታማ', icon: 'business-outline' },
  { type: 'VILLA', labelEn: 'Villa', labelAm: 'ቪላ', icon: 'home-outline' },
  { type: 'CONDO', labelEn: 'Condo', labelAm: 'ኮንዶሚኒየም', icon: 'albums-outline' },
  { type: 'HOUSE', labelEn: 'Family House', labelAm: 'መኖሪያ ቤት', icon: 'bed-outline' },
  { type: 'LAND', labelEn: 'Land', labelAm: 'ቦታ / መሬት', icon: 'map-outline' },
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user } = useAuth();

  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [featuredHouses, setFeaturedHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const slideRef = useRef<FlatList>(null);

  // Fetch featured properties
  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      // Attempt public houses endpoint first
      let res;
      try {
        res = await api.get('/public/houses?limit=6');
      } catch {
        res = await api.get('/houses?limit=6');
      }
      const data = extractArray<House>(res, 'houses');
      setFeaturedHouses(data);
    } catch (err: any) {
      console.warn('Error fetching featured houses:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeatured();
  };

  const handleSearchSubmit = () => {
    navigation.navigate('Explore', {
      initialSearch: searchQuery,
      initialType: selectedType !== 'ALL' ? selectedType : undefined,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('app.name', 'HRMS Real Estate')}
        subtitle={isAmharic ? 'የቤት ኪራይ እና ሽያጭ መድረክ' : 'Unified Property Marketplace'}
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* User Greeting Bar */}
        {user && (
          <View style={[styles.userBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.userBarLeft}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.greetingSmall, { color: colors.textMuted }]}>
                  {isAmharic ? 'እንኳን ደህና መጡ' : 'Welcome back,'}
                </Text>
                <Text style={[styles.greetingName, { color: colors.text }]} numberOfLines={1}>
                  {user.name || user.phone || 'User'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Portal')}
              style={[styles.portalChip, { backgroundColor: colors.primaryLight }]}
              activeOpacity={0.7}
            >
              <Ionicons name="grid-outline" size={14} color={colors.primary} />
              <Text style={[styles.portalChipText, { color: colors.primary }]}>
                {isAmharic ? 'ፖርታል' : 'Portal'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero Slider */}
        <View style={styles.heroSection}>
          <FlatList
            ref={slideRef}
            data={HERO_SLIDES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const slideIdx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveSlide(slideIdx);
            }}
            keyExtractor={(_, index) => `slide-${index}`}
            renderItem={({ item }) => (
              <View style={[styles.slideCard, { width: width - spacing.lg * 2 }]}>
                <Image source={{ uri: item.image }} style={styles.slideImage} resizeMode="cover" />
                <View style={styles.slideOverlay} />
                <View style={styles.slideContent}>
                  <View style={styles.slideBadge}>
                    <Text style={styles.slideBadgeText}>{item.badge}</Text>
                  </View>
                  <Text style={styles.slideTitle}>
                    {isAmharic ? item.titleAm : item.titleEn}
                  </Text>
                  <Text style={styles.slideDesc} numberOfLines={2}>
                    {isAmharic ? item.descAm : item.descEn}
                  </Text>
                  <View style={styles.slideActions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Explore')}
                      style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="compass-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.btnPrimaryText}>
                        {isAmharic ? 'ቤቶችን አስስ' : 'Explore Properties'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('Map')}
                      style={styles.btnSecondary}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="map-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.btnSecondaryText}>
                        {isAmharic ? 'ካርታ' : 'Map View'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {HERO_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeSlide
                    ? [styles.dotActive, { backgroundColor: colors.primary }]
                    : [styles.dotInactive, { backgroundColor: colors.border }],
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Search & Filters */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.searchInputRow}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder={t('action.search', 'Search by city, title or neighborhood...')}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Property Type Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typePills}>
            {PROPERTY_TYPES.map((pt) => {
              const isSelected = selectedType === pt.type;
              return (
                <TouchableOpacity
                  key={pt.type}
                  onPress={() => setSelectedType(pt.type)}
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={pt.icon as any}
                    size={14}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typePillText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {isAmharic ? pt.labelAm : pt.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={handleSearchSubmit}
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={18} color="#FFFFFF" />
            <Text style={styles.searchBtnText}>
              {isAmharic ? 'ቤቶችን ፈልግ' : 'Search Properties'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((s, idx) => (
            <View
              key={idx}
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={s.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statCount, { color: colors.text }]}>{s.count}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {isAmharic ? s.labelAm : s.labelEn}
              </Text>
            </View>
          ))}
        </View>

        {/* Featured Properties */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.featured_title', 'Featured Properties')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              {t('home.featured_subtitle', 'Handpicked verified homes ready for lease or purchase')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Explore')}
            style={styles.seeAllBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              {isAmharic ? 'ሁሉንም' : 'See all'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              {isAmharic ? 'ቤቶች በመጫን ላይ ናቸው...' : 'Loading featured properties...'}
            </Text>
          </View>
        ) : featuredHouses.length > 0 ? (
          <View style={styles.featuredList}>
            {featuredHouses.map((house) => (
              <PropertyCard
                key={house._id}
                house={house}
                onPress={() => navigation.navigate('PropertyDetail', { house })}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="home-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('msg.no_properties', 'No featured properties currently available.')}
            </Text>
          </View>
        )}

        {/* Why Choose Us */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.why_choose_us', 'Why Choose HRMS?')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              {isAmharic ? 'የእኛ ልዩ ጥቅሞች እና ዋስትናዎች' : 'Verified standards and digital protections'}
            </Text>
          </View>
        </View>

        <View style={styles.whyList}>
          <View style={[styles.whyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.whyTitle, { color: colors.text }]}>
                {t('home.why_verified', '100% Verified Title Deeds')}
              </Text>
              <Text style={[styles.whyDesc, { color: colors.textMuted }]}>
                {t('home.why_verified_desc', 'Every property is physically inspected and verified with administrative records.')}
              </Text>
            </View>
          </View>

          <View style={[styles.whyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="lock-closed" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.whyTitle, { color: colors.text }]}>
                {t('home.why_escrow', 'Secure Escrow Ledger')}
              </Text>
              <Text style={[styles.whyDesc, { color: colors.textMuted }]}>
                {t('home.why_escrow_desc', 'Payments are held safely and released only upon agreed milestone verification.')}
              </Text>
            </View>
          </View>

          <View style={[styles.whyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="document-text" size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.whyTitle, { color: colors.text }]}>
                {t('home.why_lease', 'Digital Tenancy Contracts')}
              </Text>
              <Text style={[styles.whyDesc, { color: colors.textMuted }]}>
                {t('home.why_lease_desc', 'Legally binding digital agreements signed right on your phone.')}
              </Text>
            </View>
          </View>
        </View>

        {/* Call to Action Banner */}
        <View style={[styles.ctaBanner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="home" size={36} color={colors.primary} />
          <Text style={[styles.ctaTitle, { color: colors.text }]}>
            {t('home.cta_title', 'Ready to Find Your New Home?')}
          </Text>
          <Text style={[styles.ctaDesc, { color: colors.textMuted }]}>
            {t('home.cta_desc', 'Explore hundreds of verified properties or speak with our certified agents today.')}
          </Text>
          <View style={styles.ctaActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Explore')}
              style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={16} color="#FFFFFF" />
              <Text style={styles.btnPrimaryText}>
                {t('action.browse_all', 'Browse All Properties')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Contact')}
              style={[styles.btnOutline, { borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={16} color={colors.text} />
              <Text style={[styles.btnOutlineText, { color: colors.text }]}>
                {t('nav.contact', 'Contact Us')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl * 2,
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  userBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  greetingSmall: {
    fontSize: 11,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 15,
    fontWeight: '700',
  },
  portalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  portalChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroSection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  slideCard: {
    height: 240,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 13, 24, 0.65)',
  },
  slideContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  slideBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  slideBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  slideDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  slideActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  btnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
  },
  dotInactive: {
    width: 6,
  },
  searchBox: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  typePills: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  featuredList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  loadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    marginTop: spacing.sm,
  },
  emptyBox: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  whyList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  whyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  whyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  whyDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  ctaBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  ctaActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
