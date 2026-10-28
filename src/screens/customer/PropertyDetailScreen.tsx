import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { Badge } from '../../components/Badge';
import { AppointmentModal } from '../../components/AppointmentModal';
import { PurchaseOfferModal } from '../../components/PurchaseOfferModal';
import { CalculatorModal } from '../../components/CalculatorModal';
import { PropertyCompareModal } from '../../components/PropertyCompareModal';
import { ReportListingModal } from '../../components/ReportListingModal';
import { PaymentModal } from '../../components/PaymentModal';
import { PanoramaViewer } from '../../components/PanoramaViewer';
import { ThreeDViewer } from '../../components/ThreeDViewer';
import { FloorPlanViewer } from '../../components/FloorPlanViewer';
import { HouseMapViewer } from '../../components/HouseMapViewer';
import { RentalApplicationModal } from '../../components/RentalApplicationModal';
import { WriteReviewModal } from '../../components/WriteReviewModal';
import { House, Review } from '../../types';
import api from '../../config/api';
import { extractArray } from '../../utils/apiData';

const { width } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80';

export const PropertyDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const initialHouse: House = route.params?.house;
  const houseId: string = initialHouse?._id || route.params?.houseId;

  const { colors, isDark } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Full detailed house state
  const [house, setHouse] = useState<House>(initialHouse);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [similarHouses, setSimilarHouses] = useState<House[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  // Active media tab: 'images' | 'map' | '360' | '3d' | 'floorplan' | 'video'
  const [activeMediaTab, setActiveMediaTab] = useState<'images' | 'map' | '360' | '3d' | 'floorplan' | 'video'>('images');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Modals state
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isRentalAppOpen, setIsRentalAppOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  // Fetch full house details matching frontend
  const fetchFullHouse = useCallback(async () => {
    if (!houseId) return;
    try {
      setLoading(true);
      const res = await api.get(`/public/houses/${houseId}`);
      if (res.data?.success && res.data.data) {
        setHouse(res.data.data);
      }
    } catch (err: any) {
      console.warn('Could not fetch full house detail:', err.message);
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  // Fetch reviews matching frontend
  const fetchReviews = useCallback(async () => {
    if (!houseId) return;
    try {
      const res = await api.get(`/reviews/house/${houseId}`);
      if (res.data?.success) {
        setReviews(res.data.data.reviews || []);
        setReviewStats(res.data.data.stats || { avgRating: 0, totalReviews: 0 });
      }
    } catch {
      // ignore
    }
  }, [houseId]);

  // Fetch similar houses matching frontend
  const fetchSimilarHouses = useCallback(async () => {
    if (!houseId) return;
    try {
      const res = await api.get(`/properties/${houseId}/similar`);
      if (res.data?.success) {
        setSimilarHouses(res.data.data || []);
      }
    } catch {
      // ignore
    }
  }, [houseId]);

  useEffect(() => {
    fetchFullHouse();
    fetchReviews();
    fetchSimilarHouses();
  }, [fetchFullHouse, fetchReviews, fetchSimilarHouses]);

  // Check initial like status
  useEffect(() => {
    if (house && user) {
      const likes = house.likes || [];
      setIsLiked(likes.includes(user._id));
    }
  }, [house, user]);

  // Extract images
  const imageList = useMemo(() => {
    if (house?.images && house.images.length > 0) {
      return house.images;
    }
    return [{ data: FALLBACK_IMAGE }];
  }, [house?.images]);

  const formatPrice = (price: number) => {
    return price ? Number(price).toLocaleString('en-US') : '0';
  };

  const isForSale = house?.transactionType === 'BUY';
  const isShortStay = house?.transactionType === 'SHORT_STAY';

  const getTransactionLabel = () => {
    if (isForSale) return isAmharic ? 'የሚሸጥ' : 'FOR SALE';
    if (isShortStay) return isAmharic ? 'አጭር ቆይታ' : 'SHORT STAY';
    return isAmharic ? 'የሚከራይ' : 'FOR RENT';
  };

  const handleLikeToggle = async () => {
    if (!user) {
      Alert.alert(
        isAmharic ? 'መግባት ያስፈልጋል' : 'Login Required',
        isAmharic ? 'ንብረቱን ለመውደድ እባክዎ መጀመሪያ ይግቡ።' : 'Please log in to add this property to your favorites.'
      );
      return;
    }

    try {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      const res = await api.post(`/properties/${houseId}/like`, {});
      if (res.data?.success) {
        setIsLiked(res.data.data.liked);
      }
    } catch {
      // revert if failed
      setIsLiked(!isLiked);
    }
  };

  const handleShare = async () => {
    try {
      const priceText = `ETB ${formatPrice(house.pricing?.price || house.price || 0)}`;
      await Share.share({
        title: house.title,
        message: `${house.title} - ${priceText}\nCheck out this listing on HRMS: ${house.location?.address || ''}, ${house.location?.city || ''}`,
      });
    } catch {
      // ignore
    }
  };

  const handleCall = () => {
    const phone =
      (typeof house.agent_id === 'object' && house.agent_id?.phone) ||
      (typeof house.owner_id === 'object' && house.owner_id?.phone) ||
      house.agentId?.phone ||
      house.agentContact ||
      '0911223344';

    Linking.openURL(`tel:${phone}`);
  };

  const handleChat = () => {
    if (!user) {
      Alert.alert(
        isAmharic ? 'መግባት ያስፈልጋል' : 'Login Required',
        isAmharic ? 'መልዕክት ለመላክ እባክዎ መጀመሪያ ይግቡ።' : 'Please sign in to chat with the host or agent.'
      );
      return;
    }

    const contactUser =
      (typeof house.agent_id === 'object' && house.agent_id) ||
      (typeof house.owner_id === 'object' && house.owner_id) ||
      (house.agentId?._id ? { _id: house.agentId._id, name: house.agentName || 'Agent' } : null);

    navigation.navigate('ChatDetail', {
      recipient: contactUser || {
        _id: 'agent_contact',
        name: house.agentName || (isAmharic ? 'የንብረት ወኪል' : 'Property Representative'),
      },
      houseId: house._id,
      houseTitle: house.title,
    });
  };

  const default3D = useMemo(() => {
    if (!house?.threeDModels?.length) return null;
    return house.threeDModels.find((m) => m.isDefault) || house.threeDModels[0];
  }, [house?.threeDModels]);

  const amenities = house?.details?.amenities?.length
    ? house.details.amenities
    : ['Wi-Fi Ready', 'Water Reservoir Tank', 'Backup Generator', '24/7 Security Guard', 'Balcony', 'Modern Kitchen'];

  const features = house?.details?.features || [];

  const mainPrice = house?.pricing?.price ?? house?.price ?? 0;
  const securityDeposit = house?.pricing?.securityDeposit ?? house?.rentalPricing?.securityDeposit ?? house?.securityDeposit ?? 0;
  const maintenanceFee = house?.pricing?.maintenanceFee ?? 0;
  const taxAmount = house?.pricing?.taxAmount ?? 0;
  const pricePerSqft = house?.pricing?.pricePerSqft;

  // Resolve Image URI helper
  const getImageUri = (img: any, idx: number) => {
    if (img?.data) {
      if (img.data.startsWith('http') || img.data.startsWith('data:')) {
        return img.data;
      }
      const ct = img.contentType || 'image/jpeg';
      return `data:${ct};base64,${img.data}`;
    }
    // Backend image route fallback
    return `${api.defaults.baseURL}/public/houses/${house._id}/image?index=${idx}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* ── Media Gallery Hero / Multi-Tab Viewer ── */}
        <View style={styles.mediaContainer}>
          {/* Media Mode Tabs Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaTabsStrip}
            contentContainerStyle={styles.mediaTabsContent}
          >
            <TouchableOpacity
              style={[
                styles.mediaTabBtn,
                activeMediaTab === 'images' && { backgroundColor: '#06B6D4' },
              ]}
              onPress={() => setActiveMediaTab('images')}
            >
              <Ionicons
                name="images-outline"
                size={14}
                color={activeMediaTab === 'images' ? '#FFFFFF' : '#94A3B8'}
              />
              <Text style={[styles.mediaTabText, activeMediaTab === 'images' && { color: '#FFFFFF' }]}>
                {isAmharic ? `ፎቶዎች (${imageList.length})` : `Photos (${imageList.length})`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mediaTabBtn,
                activeMediaTab === 'map' && { backgroundColor: '#3B82F6' },
              ]}
              onPress={() => setActiveMediaTab('map')}
            >
              <Ionicons
                name="map-outline"
                size={14}
                color={activeMediaTab === 'map' ? '#FFFFFF' : '#94A3B8'}
              />
              <Text style={[styles.mediaTabText, activeMediaTab === 'map' && { color: '#FFFFFF' }]}>
                {isAmharic ? 'ካርታ' : 'Map'}
              </Text>
            </TouchableOpacity>

            {(house?.panoramic360?.enabled || house?.panoramic360?.imageUrl) && (
              <TouchableOpacity
                style={[
                  styles.mediaTabBtn,
                  activeMediaTab === '360' && { backgroundColor: '#A855F7' },
                ]}
                onPress={() => setActiveMediaTab('360')}
              >
                <Ionicons
                  name="scan-outline"
                  size={14}
                  color={activeMediaTab === '360' ? '#FFFFFF' : '#94A3B8'}
                />
                <Text style={[styles.mediaTabText, activeMediaTab === '360' && { color: '#FFFFFF' }]}>
                  360° Tour
                </Text>
              </TouchableOpacity>
            )}

            {default3D && (
              <TouchableOpacity
                style={[
                  styles.mediaTabBtn,
                  activeMediaTab === '3d' && { backgroundColor: '#0284C7' },
                ]}
                onPress={() => setActiveMediaTab('3d')}
              >
                <Ionicons
                  name="cube-outline"
                  size={14}
                  color={activeMediaTab === '3d' ? '#FFFFFF' : '#94A3B8'}
                />
                <Text style={[styles.mediaTabText, activeMediaTab === '3d' && { color: '#FFFFFF' }]}>
                  3D Model
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.mediaTabBtn,
                activeMediaTab === 'floorplan' && { backgroundColor: '#10B981' },
              ]}
              onPress={() => setActiveMediaTab('floorplan')}
            >
              <Ionicons
                name="layers-outline"
                size={14}
                color={activeMediaTab === 'floorplan' ? '#FFFFFF' : '#94A3B8'}
              />
              <Text style={[styles.mediaTabText, activeMediaTab === 'floorplan' && { color: '#FFFFFF' }]}>
                {isAmharic ? 'የቤት ንድፍ' : 'Floor Plan'}
              </Text>
            </TouchableOpacity>

            {house?.videoUrl && (
              <TouchableOpacity
                style={[
                  styles.mediaTabBtn,
                  activeMediaTab === 'video' && { backgroundColor: '#F43F5E' },
                ]}
                onPress={() => setActiveMediaTab('video')}
              >
                <Ionicons
                  name="videocam-outline"
                  size={14}
                  color={activeMediaTab === 'video' ? '#FFFFFF' : '#94A3B8'}
                />
                <Text style={[styles.mediaTabText, activeMediaTab === 'video' && { color: '#FFFFFF' }]}>
                  Video
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Active Viewer Canvas */}
          {activeMediaTab === 'images' && (
            <View style={{ height: 290, width: '100%', position: 'relative' }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const slide = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveImageIndex(slide);
                }}
                scrollEventThrottle={16}
              >
                {imageList.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: getImageUri(img, idx) }}
                    style={{ width, height: 290 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              {/* Prev / Next Chevrons */}
              {imageList.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.arrowBtn, { left: 10 }]}
                    onPress={() =>
                      setActiveImageIndex((p) => (p > 0 ? p - 1 : imageList.length - 1))
                    }
                  >
                    <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.arrowBtn, { right: 10 }]}
                    onPress={() =>
                      setActiveImageIndex((p) => (p < imageList.length - 1 ? p + 1 : 0))
                    }
                  >
                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              )}

              {/* Image Counter & Label */}
              <View style={styles.imageIndicatorPill}>
                <Text style={styles.imageIndicatorText}>
                  {activeImageIndex + 1} / {imageList.length}
                </Text>
              </View>

              {imageList[activeImageIndex]?.roomLabel && (
                <View style={styles.roomLabelBadge}>
                  <Text style={styles.roomLabelText}>
                    {imageList[activeImageIndex].roomLabel}
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeMediaTab === 'map' && (
            <HouseMapViewer
              latitude={house.location?.coordinates?.lat || house.location?.coordinates?.latitude || 9.03}
              longitude={house.location?.coordinates?.lng || house.location?.coordinates?.longitude || 38.74}
              title={house.title}
              address={house.location?.address || ''}
              city={house.location?.city || ''}
              price={mainPrice}
              height={290}
            />
          )}

          {activeMediaTab === '360' && (
            <PanoramaViewer
              imageUrl={
                house.panoramic360?.imageUrl ||
                (house.images?.[0] ? getImageUri(house.images[0], 0) : FALLBACK_IMAGE)
              }
              height={290}
            />
          )}

          {activeMediaTab === '3d' && default3D && (
            <ThreeDViewer
              modelUrl={`${api.defaults.baseURL}/public/houses/${house._id}/3d`}
              height={290}
            />
          )}

          {activeMediaTab === 'floorplan' && (
            <FloorPlanViewer
              floorPlanUrl={house.floorPlan?.url}
              rooms={house.floorPlan?.rooms}
              totalArea={house.details?.area}
            />
          )}

          {activeMediaTab === 'video' && (
            <View style={[styles.videoContainer, { backgroundColor: '#0F172A', height: 290 }]}>
              <Ionicons name="play-circle-outline" size={64} color="#F43F5E" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginTop: 8 }}>
                {isAmharic ? 'የቪዲዮ ጉብኝት' : 'Video Walkthrough Tour'}
              </Text>
              <TouchableOpacity
                style={styles.openVideoBtn}
                onPress={() => house.videoUrl && Linking.openURL(house.videoUrl)}
              >
                <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                  {isAmharic ? 'ቪዲዮውን ክፈት' : 'Open Walkthrough Video'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Floating Back, Share & Heart Header */}
          <View style={[styles.floatingHeader, { top: Math.max(insets.top, 16) }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.floatingIconBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleShare}
                style={[styles.floatingIconBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
              >
                <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLikeToggle}
                style={[styles.floatingIconBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isLiked ? '#EF4444' : '#FFFFFF'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsReportOpen(true)}
                style={[styles.floatingIconBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
              >
                <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Content Body ── */}
        <View style={styles.body}>
          {/* Badges Strip */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.transactionBadge,
                { backgroundColor: isForSale ? '#10B981' : isShortStay ? '#F59E0B' : '#06B6D4' },
              ]}
            >
              <Text style={styles.transactionBadgeText}>{getTransactionLabel()}</Text>
            </View>

            <Badge
              label={house.propertyType || 'Property'}
              variant="neutral"
            />

            <Badge
              label={t(`status.${(house.status || 'AVAILABLE').toLowerCase()}`, house.status || 'AVAILABLE')}
              variant={house.status === 'AVAILABLE' ? 'success' : 'warning'}
            />

            {(house.isVerified || house.verificationStatus === 'VERIFIED') && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
                <Text style={styles.verifiedBadgeText}>
                  {isAmharic ? 'የተረጋገጠ' : 'Verified'}
                </Text>
              </View>
            )}

            {house.featured && (
              <View style={[styles.verifiedBadge, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="star" size={13} color="#FFFFFF" />
                <Text style={styles.verifiedBadgeText}>Featured</Text>
              </View>
            )}

            {(house.trendingScore || 0) > 0 && (
              <View style={[styles.verifiedBadge, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="trending-up" size={13} color="#FFFFFF" />
                <Text style={styles.verifiedBadgeText}>Trending</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{house.title}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#06B6D4" />
            <Text style={[styles.locationText, { color: colors.textMuted }]}>
              {[
                house.location?.address,
                house.location?.neighborhood,
                house.location?.city,
                house.location?.state,
              ]
                .filter(Boolean)
                .join(', ') || 'Addis Ababa, Ethiopia'}
            </Text>
          </View>

          {/* Price Card */}
          <View style={[styles.priceBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>
                {isForSale
                  ? isAmharic ? 'የመሸጫ ዋጋ' : 'Asking Price'
                  : isAmharic ? 'ወርሃዊ ኪራይ' : 'Monthly Rent'}
              </Text>
              <View style={styles.priceNumberRow}>
                <Text style={[styles.currency, { color: '#06B6D4' }]}>ETB </Text>
                <Text style={[styles.priceNumber, { color: colors.text }]}>
                  {formatPrice(mainPrice)}
                </Text>
                {!isForSale && (
                  <Text style={[styles.pricePeriod, { color: colors.textMuted }]}>
                    {isAmharic ? ' / በወር' : ' / month'}
                  </Text>
                )}
              </View>
            </View>

            {securityDeposit > 0 && (
              <View style={styles.depositCol}>
                <Text style={[styles.depositLabel, { color: colors.textMuted }]}>
                  {isAmharic ? 'መያዣ (Deposit)' : 'Deposit'}
                </Text>
                <Text style={[styles.depositVal, { color: colors.text }]}>
                  ETB {formatPrice(securityDeposit)}
                </Text>
              </View>
            )}

            {isForSale && house.saleTerms?.isNegotiable && (
              <View style={styles.negotiablePill}>
                <Text style={styles.negotiablePillText}>
                  {isAmharic ? 'ድርድር አለው' : 'Negotiable'}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Specs Grid */}
          <View style={[styles.specsGrid, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={styles.specColumn}>
              <Ionicons name="bed-outline" size={22} color="#06B6D4" />
              <Text style={[styles.specValue, { color: colors.text }]}>
                {house.details?.bedrooms || 0}
              </Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'መኝታ ቤቶች' : 'Bedrooms'}
              </Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.specColumn}>
              <Ionicons name="water-outline" size={22} color="#06B6D4" />
              <Text style={[styles.specValue, { color: colors.text }]}>
                {house.details?.bathrooms || 0}
              </Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'መታጠቢያ' : 'Bathrooms'}
              </Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.specColumn}>
              <Ionicons name="scan-outline" size={22} color="#06B6D4" />
              <Text style={[styles.specValue, { color: colors.text }]}>
                {house.details?.area || 0}
              </Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'ስፋት (m²)' : 'Area (m²)'}
              </Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.specColumn}>
              <Ionicons name="car-outline" size={22} color="#06B6D4" />
              <Text style={[styles.specValue, { color: colors.text }]}>
                {house.details?.parkingSpaces ?? 1}
              </Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'ፓርኪንግ' : 'Parking'}
              </Text>
            </View>
          </View>

          {/* Description Section */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            {isAmharic ? 'ስለ ንብረቱ ማብራሪያ' : 'About this Property'}
          </Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {house.description ||
              (isAmharic
                ? 'ይህ ንብረት በዋና ከተማው ምቹ ስፍራ ላይ የሚገኝ ዘመናዊ እና የተሟላ አገልግሎት ያለው ነው።'
                : 'A modern, prime-location property featuring excellent architecture, premium interior design, and continuous utility supplies.')}
          </Text>

          {/* Specifications Breakdown */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            {isAmharic ? 'የንብረት ዝርዝር መረጃ (Specifications)' : 'Property Specifications'}
          </Text>
          <View style={styles.kvGrid}>
            <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                {isAmharic ? 'የተገነባበት ዓመት' : 'Year Built'}
              </Text>
              <Text style={[styles.kvVal, { color: colors.text }]}>
                {house.details?.yearBuilt || '—'}
              </Text>
            </View>

            <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                {isAmharic ? 'ፎቆች' : 'Floors'}
              </Text>
              <Text style={[styles.kvVal, { color: colors.text }]}>
                {house.details?.floors ?? house.details?.totalFloors ?? '—'}
              </Text>
            </View>

            <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                {isAmharic ? 'የይዞታ ስፋት' : 'Lot Size'}
              </Text>
              <Text style={[styles.kvVal, { color: colors.text }]}>
                {house.details?.lotSize ? `${house.details.lotSize} m²` : '—'}
              </Text>
            </View>

            <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                {isAmharic ? 'የእቃ አቅርቦት' : 'Furnishing'}
              </Text>
              <Text style={[styles.kvVal, { color: colors.text }]}>
                {house.details?.furnishingStatus || (house.details?.furnished ? 'Furnished' : 'Unfurnished')}
              </Text>
            </View>
          </View>

          {/* Pricing Breakdown */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            {isAmharic ? 'የክፍያ ዝርዝር መረጃ (Pricing Breakdown)' : 'Pricing Breakdown'}
          </Text>
          <View style={styles.kvGrid}>
            <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                {isAmharic ? 'ዋና ዋጋ' : 'Main Price'}
              </Text>
              <Text style={[styles.kvVal, { color: '#06B6D4' }]}>
                ETB {formatPrice(mainPrice)}
              </Text>
            </View>

            <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                {isAmharic ? 'የጥገና ክፍያ' : 'Maintenance Fee'}
              </Text>
              <Text style={[styles.kvVal, { color: colors.text }]}>
                ETB {formatPrice(maintenanceFee)}
              </Text>
            </View>

            <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                {isAmharic ? 'ግብር (Tax)' : 'Tax Amount'}
              </Text>
              <Text style={[styles.kvVal, { color: colors.text }]}>
                ETB {formatPrice(taxAmount)}
              </Text>
            </View>

            <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                {isAmharic ? 'ዋጋ በ ካ.ሜ' : 'Price / sqft'}
              </Text>
              <Text style={[styles.kvVal, { color: colors.text }]}>
                {pricePerSqft ? `ETB ${formatPrice(pricePerSqft)}` : '—'}
              </Text>
            </View>
          </View>

          {/* Sale Terms (if For Sale) */}
          {isForSale && house.saleTerms && (
            <>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {isAmharic ? 'የሽያጭ ውል መረጃ (Sale Terms)' : 'Sale Terms'}
              </Text>
              <View style={styles.kvGrid}>
                <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                    {isAmharic ? 'የባለቤትነት ሰነድ' : 'Ownership Doc'}
                  </Text>
                  <Text style={[styles.kvVal, { color: colors.text }]}>
                    {house.saleTerms.ownershipDocType || 'Carta / Title Deed'}
                  </Text>
                </View>
                <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                    {isAmharic ? 'ኤስክሮው ይደገፋል' : 'Escrow Supported'}
                  </Text>
                  <Text style={[styles.kvVal, { color: '#10B981' }]}>
                    {house.saleTerms.escrowSupported !== false ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                    {isAmharic ? 'ዝቅተኛ የቅድመ ክፍያ' : 'Min Down Payment'}
                  </Text>
                  <Text style={[styles.kvVal, { color: colors.text }]}>
                    {house.saleTerms.downPaymentMin != null ? `${house.saleTerms.downPaymentMin}%` : '20%'}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Rental Terms (if For Rent) */}
          {!isForSale && house.rentalPricing && (
            <>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {isAmharic ? 'የኪራይ ውል መረጃ (Rental Terms)' : 'Rental Terms'}
              </Text>
              <View style={styles.kvGrid}>
                <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                    {isAmharic ? 'የክፍያ ድግግሞሽ' : 'Frequency'}
                  </Text>
                  <Text style={[styles.kvVal, { color: colors.text }]}>
                    {house.rentalPricing.frequency || 'Monthly'}
                  </Text>
                </View>
                <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                    {isAmharic ? 'ቅድመ ክፍያ (ወራት)' : 'Advance Payments'}
                  </Text>
                  <Text style={[styles.kvVal, { color: colors.text }]}>
                    {house.rentalPricing.advancePayments ?? 1}
                  </Text>
                </View>
                <View style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.kvKey, { color: colors.textMuted }]}>
                    {isAmharic ? 'ዝቅተኛ የኪራይ ጊዜ' : 'Min Lease Duration'}
                  </Text>
                  <Text style={[styles.kvVal, { color: colors.text }]}>
                    {house.rentalPricing.minLeaseDuration ?? 6} {isAmharic ? 'ወራት' : 'months'}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Category Attributes */}
          {house.categoryAttributes && Object.keys(house.categoryAttributes).length > 0 && (
            <>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {isAmharic ? 'ተጨማሪ ዝርዝሮች' : 'Category Specifications'}
              </Text>
              <View style={styles.kvGrid}>
                {Object.entries(house.categoryAttributes).map(([k, v]) => (
                  <View key={k} style={[styles.kvCell, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.kvKey, { color: colors.textMuted }]}>{k}</Text>
                    <Text style={[styles.kvVal, { color: colors.text }]}>
                      {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Amenities & Facilities */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            {isAmharic ? 'አገልግሎቶች እና መገልገያዎች' : 'Amenities & Facilities'}
          </Text>
          <View style={styles.amenitiesContainer}>
            {amenities.map((item, idx) => (
              <View
                key={idx}
                style={[styles.amenityPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              >
                <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                <Text style={[styles.amenityText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Interior Features */}
          {features.length > 0 && (
            <>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {isAmharic ? 'የውስጥ ዲዛይን ገጽታዎች' : 'Interior Features'}
              </Text>
              <View style={styles.amenitiesContainer}>
                {features.map((feat, idx) => (
                  <View
                    key={idx}
                    style={[styles.amenityPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                  >
                    <Ionicons name="ribbon-outline" size={15} color="#A855F7" />
                    <Text style={[styles.amenityText, { color: colors.text }]}>{feat}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Neighborhood Landmarks */}
          {(house.nearbyAmenities?.length ?? 0) > 0 && (
            <>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {isAmharic ? 'የአቅራቢያ ተቋማት እና አገልግሎቶች' : 'Neighborhood Landmarks'}
              </Text>
              <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
                {house.nearbyAmenities!.map((a, i) => (
                  <View
                    key={i}
                    style={[
                      styles.landmarkRow,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    ]}
                  >
                    <Ionicons
                      name={
                        a.type === 'school'
                          ? 'school-outline'
                          : a.type === 'hospital'
                          ? 'medkit-outline'
                          : a.type === 'shopping'
                          ? 'cart-outline'
                          : 'navigate-outline'
                      }
                      size={18}
                      color="#06B6D4"
                    />
                    <Text style={[styles.landmarkName, { color: colors.text }]}>{a.name}</Text>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{a.distanceKm} km</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Statistics Bar */}
          <View style={[styles.statsBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={styles.statCol}>
              <Ionicons name="eye-outline" size={16} color="#06B6D4" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {house.views ?? house.view ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'እይታዎች' : 'Views'}
              </Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.statCol}>
              <Ionicons name="mail-outline" size={16} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {house.inquiries ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'ጥያቄዎች' : 'Inquiries'}
              </Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.statCol}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {reviewStats.avgRating ? reviewStats.avgRating.toFixed(1) : (house.rating || 0).toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {isAmharic ? 'ደረጃ' : 'Rating'}
              </Text>
            </View>
          </View>

          {/* Quick Utility Actions Row */}
          <View style={styles.utilityActionsRow}>
            <TouchableOpacity
              style={[styles.utilityBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={() => setIsCompareOpen(true)}
            >
              <Ionicons name="git-compare-outline" size={16} color="#06B6D4" />
              <Text style={[styles.utilityBtnText, { color: colors.text }]}>
                {isAmharic ? 'አወዳድር' : 'Compare'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.utilityBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={() => setIsPaymentOpen(true)}
            >
              <Ionicons name="card-outline" size={16} color="#10B981" />
              <Text style={[styles.utilityBtnText, { color: colors.text }]}>
                {isAmharic ? 'ክፍያ ፈጽም' : 'Pay Slip'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.utilityBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={() => setIsCalculatorOpen(true)}
            >
              <Ionicons name="calculator-outline" size={16} color="#8B5CF6" />
              <Text style={[styles.utilityBtnText, { color: colors.text }]}>
                {isAmharic ? 'ማስያ' : 'Mortgage'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Customer Reviews Section */}
          <View style={styles.reviewsHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 0 }]}>
              {isAmharic ? 'የደንበኞች አስተያየት' : 'Customer Reviews'} ({reviews.length})
            </Text>
            <TouchableOpacity
              style={[styles.writeReviewBtn, { backgroundColor: colors.primary }]}
              onPress={() => setIsWriteReviewOpen(true)}
            >
              <Ionicons name="create-outline" size={14} color="#FFFFFF" />
              <Text style={styles.writeReviewBtnText}>
                {isAmharic ? 'አስተያየት ስጥ' : 'Write Review'}
              </Text>
            </TouchableOpacity>
          </View>

          {reviews.length > 0 ? (
            <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
              {reviews.map((rev) => (
                <View
                  key={rev._id}
                  style={[
                    styles.reviewCard,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.reviewUserRow}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {(rev.userName || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reviewUserName, { color: colors.text }]}>
                        {rev.userName}
                      </Text>
                      {rev.isVerifiedResident && (
                        <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '700' }}>
                          ✓ {isAmharic ? 'የተረጋገጠ ነዋሪ' : 'Verified Resident'}
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < rev.rating ? 'star' : 'star-outline'}
                          size={13}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                  {rev.title ? (
                    <Text style={[styles.reviewTitleText, { color: colors.text }]}>
                      {rev.title}
                    </Text>
                  ) : null}
                  <Text style={[styles.reviewCommentText, { color: colors.textSecondary }]}>
                    {rev.comment}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noReviewsText, { color: colors.textMuted }]}>
              {isAmharic
                ? 'ምንም አስተያየት አልተሰጠም። የመጀመሪያው አስተያየት ሰጪ ይሁኑ!'
                : 'No reviews yet. Be the first to share your experience!'}
            </Text>
          )}

          {/* Landlord / Broker Profile Box */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            {isAmharic ? 'የንብረት ወኪል / አስተናጋጅ' : 'Listing Representative'}
          </Text>
          <View style={[styles.agentBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={[styles.agentAvatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.agentName, { color: colors.text }]}>
                {house.agentName ||
                  (typeof house.agent_id === 'object' && house.agent_id?.name) ||
                  (typeof house.owner_id === 'object' && house.owner_id?.name) ||
                  (isAmharic ? 'የተመዘገበ ወኪል / ባለቤት' : 'Certified Host / Agent')}
              </Text>
              <Text style={[styles.agentRole, { color: colors.textMuted }]}>
                {house.agentId?.agencyName || 'HRMS Certified Real Estate Partner'}
              </Text>
            </View>

            <View style={styles.agentActionRow}>
              <TouchableOpacity
                style={[styles.agentCallBtn, { backgroundColor: '#10B981' }]}
                onPress={handleCall}
              >
                <Ionicons name="call" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.agentChatBtn, { backgroundColor: colors.primary }]}
                onPress={handleChat}
              >
                <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Similar Houses Section */}
          {similarHouses.length > 0 && (
            <>
              <Text style={[styles.sectionHeading, { color: colors.text, marginTop: spacing.xl }]}>
                {isAmharic ? 'ተመሳሳይ ቤቶች' : 'Similar Properties'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.lg }}>
                <View style={{ flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
                  {similarHouses.map((simHouse) => {
                    const simImg = simHouse.images?.[0] ? getImageUri(simHouse.images[0], 0) : FALLBACK_IMAGE;
                    return (
                      <TouchableOpacity
                        key={simHouse._id}
                        onPress={() => navigation.push('PropertyDetail', { house: simHouse })}
                        style={[styles.similarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <Image source={{ uri: simImg }} style={styles.similarImg} />
                        <View style={{ padding: 10 }}>
                          <Text style={[styles.similarTitle, { color: colors.text }]} numberOfLines={1}>
                            {simHouse.title}
                          </Text>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#06B6D4', marginTop: 2 }}>
                            ETB {formatPrice(simHouse.price || 0)}
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                            {simHouse.location?.city || 'Addis Ababa'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      {/* ── Fixed Bottom CTA Bar with Safe Area Handling ── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionToolBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          onPress={() => setIsAppointmentOpen(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.text} />
          <Text style={[styles.actionToolText, { color: colors.text }]}>
            {isAmharic ? 'ጉብኝት' : 'Tour'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionToolBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          onPress={handleChat}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
          <Text style={[styles.actionToolText, { color: colors.text }]}>
            {isAmharic ? 'መልዕክት' : 'Inquiry'}
          </Text>
        </TouchableOpacity>

        {isForSale ? (
          <TouchableOpacity
            style={[styles.primaryCtaBtn, { backgroundColor: '#10B981' }]}
            onPress={() => setIsOfferOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pricetag" size={18} color="#FFFFFF" />
            <Text style={styles.primaryCtaText}>
              {isAmharic ? 'የግዢ ጥያቄ አቅርብ' : 'Make Purchase Offer'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryCtaBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsRentalAppOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={18} color="#FFFFFF" />
            <Text style={styles.primaryCtaText}>
              {isAmharic ? 'ለኪራይ አመልክት' : 'Apply for Lease'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Modals ── */}
      <AppointmentModal
        visible={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        house={house}
      />

      <PurchaseOfferModal
        visible={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        house={house}
      />

      <RentalApplicationModal
        visible={isRentalAppOpen}
        onClose={() => setIsRentalAppOpen(false)}
        houseId={house._id}
        houseTitle={house.title}
      />

      <CalculatorModal
        visible={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        house={house}
      />

      <PropertyCompareModal
        visible={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        properties={[house]}
      />

      <ReportListingModal
        visible={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        house={house}
      />

      <WriteReviewModal
        visible={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        houseId={house._id}
        onSuccess={fetchReviews}
      />

      <PaymentModal
        visible={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        houseId={house._id}
        houseTitle={house.title}
        amount={mainPrice}
        paymentType={isForSale ? 'DOWN_PAYMENT' : 'RENT'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mediaContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  mediaTabsStrip: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mediaTabsContent: {
    paddingHorizontal: spacing.lg,
    gap: 6,
    paddingVertical: 4,
  },
  mediaTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  mediaTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  floatingHeader: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  floatingIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndicatorPill: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  imageIndicatorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  roomLabelBadge: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  videoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  openVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginTop: 12,
  },
  body: {
    padding: spacing.lg,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xs,
  },
  transactionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  transactionBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    ...typography.h2,
    marginTop: 6,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  pricePeriod: {
    fontSize: 12,
    marginLeft: 4,
  },
  depositCol: {
    alignItems: 'flex-end',
  },
  depositLabel: {
    fontSize: 10,
  },
  depositVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  negotiablePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  negotiablePillText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  specsGrid: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  specColumn: {
    alignItems: 'center',
    gap: 2,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  specLabel: {
    fontSize: 10,
  },
  specDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#94A3B833',
    alignSelf: 'center',
  },
  sectionHeading: {
    ...typography.h4,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    ...typography.body1,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  kvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kvCell: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  kvKey: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  kvVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  landmarkName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10,
  },
  distanceBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distanceText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '700',
  },
  statsBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    justifyContent: 'space-around',
    marginVertical: spacing.md,
  },
  statCol: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
  },
  utilityActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  utilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  utilityBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  writeReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  reviewCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  reviewUserName: {
    fontSize: 12,
    fontWeight: '700',
  },
  reviewTitleText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  reviewCommentText: {
    fontSize: 12,
    lineHeight: 18,
  },
  noReviewsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  agentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: {
    fontSize: 14,
    fontWeight: '700',
  },
  agentRole: {
    fontSize: 11,
  },
  agentActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  agentCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarCard: {
    width: 170,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  similarImg: {
    width: '100%',
    height: 100,
  },
  similarTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  actionToolBtn: {
    width: 48,
    height: 46,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  actionToolText: {
    fontSize: 9,
    fontWeight: '700',
  },
  primaryCtaBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
