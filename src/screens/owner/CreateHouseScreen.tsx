import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { PropertyType, TransactionType } from '../../types';

// ─── Options matching frontend & backend ───────────────────────────────
const TRANSACTION_TYPES: Array<{ key: TransactionType; labelEn: string; labelAm: string }> = [
  { key: 'RENT', labelEn: 'For Rent (Monthly/Yearly)', labelAm: 'ለኪራይ' },
  { key: 'BUY', labelEn: 'For Sale (Purchase)', labelAm: 'ለሽያጭ' },
  { key: 'SHORT_STAY', labelEn: 'Short Stay / Vacation', labelAm: 'አጭር ቆይታ' },
];

const INTENDED_PURPOSES = [
  { key: 'LIVING', labelEn: 'Residential / Living', labelAm: 'ለመኖሪያ' },
  { key: 'FAMILY', labelEn: 'Family Home', labelAm: 'የቤተሰብ ቤት' },
  { key: 'STUDENT', labelEn: 'Student Housing', labelAm: 'የተማሪ ቤት' },
  { key: 'TEMPORARY', labelEn: 'Temporary Stay', labelAm: 'ጊዜያዊ ቆይታ' },
  { key: 'BUSINESS', labelEn: 'Business / Commercial', labelAm: 'ለንግድ' },
  { key: 'STORAGE_INDUSTRIAL', labelEn: 'Storage / Industrial', labelAm: 'መጋዘን / ኢንዱስትሪ' },
  { key: 'RESIDENTIAL_OWNERSHIP', labelEn: 'Residential Ownership', labelAm: 'የመኖሪያ ባለቤትነት' },
  { key: 'COMMERCIAL_INVESTMENT', labelEn: 'Commercial Investment', labelAm: 'የንግድ ኢንቨስትመንት' },
  { key: 'DEVELOPMENT', labelEn: 'Development', labelAm: 'ለልማት' },
  { key: 'AGRICULTURE', labelEn: 'Agriculture', labelAm: 'እርሻ' },
  { key: 'OTHER', labelEn: 'Other', labelAm: 'ሌላ' },
];

const PROPERTY_TYPES: Array<{ key: PropertyType; labelEn: string; labelAm: string }> = [
  { key: 'APARTMENT', labelEn: 'Apartment', labelAm: 'አፓርታማ' },
  { key: 'VILLA', labelEn: 'Villa', labelAm: 'ቪላ' },
  { key: 'CONDO', labelEn: 'Condo', labelAm: 'ኮንዶሚኒየም' },
  { key: 'HOUSE', labelEn: 'House', labelAm: 'የመኖሪያ ቤት' },
  { key: 'LAND', labelEn: 'Land', labelAm: 'መሬት' },
];

const AMENITIES_OPTIONS = [
  { key: 'pool', labelEn: 'Swimming Pool', labelAm: 'መዋኛ ገንዳ', icon: 'water-outline' },
  { key: 'gym', labelEn: 'Gym', labelAm: 'ጂም', icon: 'barbell-outline' },
  { key: 'garden', labelEn: 'Garden', labelAm: 'ጓሮ / አትክልት', icon: 'leaf-outline' },
  { key: 'security', labelEn: '24/7 Security', labelAm: '24/7 ጥበቃ', icon: 'shield-checkmark-outline' },
  { key: 'parking', labelEn: 'Parking', labelAm: 'የመኪና ማቆሚያ', icon: 'car-outline' },
  { key: 'wifi', labelEn: 'High-speed WiFi', labelAm: 'ፈጣን ዋይፋይ', icon: 'wifi-outline' },
  { key: 'ac', labelEn: 'Air Conditioning', labelAm: 'ኤሲ', icon: 'snow-outline' },
  { key: 'heating', labelEn: 'Heating', labelAm: 'ማሞቂያ', icon: 'flame-outline' },
  { key: 'elevator', labelEn: 'Elevator', labelAm: 'ሊፍት', icon: 'business-outline' },
  { key: 'balcony', labelEn: 'Balcony', labelAm: 'በረንዳ', icon: 'home-outline' },
  { key: 'terrace', labelEn: 'Terrace', labelAm: 'ቴራስ', icon: 'sunny-outline' },
  { key: 'smart-home', labelEn: 'Smart Home', labelAm: 'ስማርት ሆም', icon: 'hardware-chip-outline' },
];

const FEATURES_OPTIONS = [
  'Central AC',
  'Hardwood Floors',
  'Granite Countertops',
  'Stainless Steel Appliances',
  'Walk-in Closet',
  'Fireplace',
  'Private Yard',
  'Covered Patio',
  'Laundry Room',
  'Storage Space',
];

export const CreateHouseScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('RENT');
  const [intendedPurpose, setIntendedPurpose] = useState('LIVING');
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [tags, setTags] = useState('Bole, Modern, Luxury');
  const [isVerified, setIsVerified] = useState(false);

  // Step 2: Location & Details
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [state, setState] = useState('Addis Ababa');
  const [zipCode, setZipCode] = useState('1000');
  const [lat, setLat] = useState('9.0300');
  const [lng, setLng] = useState('38.7400');

  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [area, setArea] = useState('140');
  const [floors, setFloors] = useState('1');
  const [yearBuilt, setYearBuilt] = useState(new Date().getFullYear().toString());
  const [parkingSpaces, setParkingSpaces] = useState('1');
  const [furnished, setFurnished] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['security', 'wifi', 'parking']);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['Central AC', 'Covered Patio']);

  // Step 3: Pricing & Media
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [maintenanceFee, setMaintenanceFee] = useState('0');
  const [taxAmount, setTaxAmount] = useState('0');

  // If BUY
  const [ownershipDocType, setOwnershipDocType] = useState('Freehold Title Deed');
  const [downPaymentMin, setDownPaymentMin] = useState('20');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [escrowSupported, setEscrowSupported] = useState(true);

  // If RENT / SHORT_STAY
  const [rentalFrequency, setRentalFrequency] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [advancePayments, setAdvancePayments] = useState('1');
  const [securityDeposit, setSecurityDeposit] = useState('0');
  const [minLeaseDuration, setMinLeaseDuration] = useState('6');

  // Rich Media
  const [panoramic360Url, setPanoramic360Url] = useState('');
  const [panoramic360Caption, setPanoramic360Caption] = useState('360° Virtual Tour View');
  const [videoUrl, setVideoUrl] = useState('');
  const [floorPlanUrl, setFloorPlanUrl] = useState('');
  const [virtualTourUrl, setVirtualTourUrl] = useState('');

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!title.trim()) {
        Alert.alert(isAmharic ? 'ማስታወሻ' : 'Required', isAmharic ? 'እባክዎ የቤቱን ርዕስ ያስገቡ' : 'Please provide a property title.');
        return false;
      }
      if (!description.trim()) {
        Alert.alert(isAmharic ? 'ማስታወሻ' : 'Required', isAmharic ? 'እባክዎ ስለ ቤቱ ዝርዝር ማብራሪያ ያስገቡ' : 'Please provide a property description.');
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!address.trim()) {
        Alert.alert(isAmharic ? 'ማስታወሻ' : 'Required', isAmharic ? 'እባክዎ የቤቱን አድራሻ ያስገቡ' : 'Please enter street address.');
        return false;
      }
      if (!city.trim()) {
        Alert.alert(isAmharic ? 'ማስታወሻ' : 'Required', isAmharic ? 'እባክዎ ከተማ ያስገቡ' : 'Please enter city.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        Alert.alert(isAmharic ? 'ማስታወሻ' : 'Required', isAmharic ? 'እባክዎ ትክክለኛ ዋጋ ያስገቡ' : 'Please enter a valid price greater than 0.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setLoading(true);

      const parsedPrice = parseFloat(price) || 0;
      const parsedQuantity = Math.max(1, parseInt(quantity, 10) || 1);

      // Payload matching frontend CreateHousePage.tsx 1:1
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        propertyType,
        transactionType,
        intendedPurpose,
        isVerified,
        tags,
        quantity: parsedQuantity,
        location: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: 'Ethiopia',
          zipCode: zipCode.trim() || '1000',
          coordinates: {
            lat: parseFloat(lat) || 9.03,
            lng: parseFloat(lng) || 38.74,
          },
        },
        details: {
          bedrooms: parseInt(bedrooms, 10) || 0,
          bathrooms: parseInt(bathrooms, 10) || 0,
          area: parseFloat(area) || 0,
          lotSize: 0,
          yearBuilt: parseInt(yearBuilt, 10) || new Date().getFullYear(),
          floors: parseInt(floors, 10) || 1,
          parkingSpaces: parseInt(parkingSpaces, 10) || 0,
          furnished,
          furnishingStatus: furnished ? 'furnished' : 'unfurnished',
          amenities: selectedAmenities,
          features: selectedFeatures,
        },
        pricing: {
          price: parsedPrice,
          maintenanceFee: parseFloat(maintenanceFee) || 0,
          taxAmount: parseFloat(taxAmount) || 0,
          securityDeposit: transactionType === 'BUY' ? 0 : parseFloat(securityDeposit) || 0,
          quantity: parsedQuantity,
        },
        virtualTour: {
          enabled: !!virtualTourUrl.trim(),
          url: virtualTourUrl.trim(),
          embedCode: '',
        },
      };

      if (videoUrl.trim()) {
        payload.videoUrl = videoUrl.trim();
      }

      if (panoramic360Url.trim()) {
        payload.panoramic360 = {
          enabled: true,
          imageUrl: panoramic360Url.trim(),
          caption: panoramic360Caption.trim() || '360° Virtual Tour View',
        };
      }

      if (floorPlanUrl.trim()) {
        payload.floorPlan = {
          url: floorPlanUrl.trim(),
          rooms: [
            { name: 'Living Room', dimensions: '6.0m x 4.5m', areaSqM: 27 },
            { name: 'Master Bedroom', dimensions: '4.5m x 4.0m', areaSqM: 18 },
          ],
        };
      }

      if (transactionType === 'RENT' || transactionType === 'SHORT_STAY') {
        payload.rentalPricing = {
          frequency: rentalFrequency,
          securityDeposit: parseFloat(securityDeposit) || 0,
          advancePayments: parseInt(advancePayments, 10) || 1,
          minLeaseDuration: parseInt(minLeaseDuration, 10) || 1,
        };
      }

      if (transactionType === 'BUY') {
        payload.saleTerms = {
          askingPrice: parsedPrice,
          ownershipDocType: ownershipDocType.trim() || 'Freehold Title Deed',
          isNegotiable,
          escrowSupported,
          downPaymentMin: parseFloat(downPaymentMin) || 20,
        };
      }

      await api.post('/houses', payload);

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Property Listing Created',
        isAmharic
          ? 'አዲሱ ቤትዎ በተሳካ ሁኔታ ተመዝግቧል። ከአስተዳዳሪው ማረጋገጫ በኋላ ለሕዝብ ክፍት ይሆናል።'
          : 'Your property listing has been submitted successfully with full rich details!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || 'Failed to create property listing'
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: isAmharic ? 'መሰረታዊ መረጃ' : 'Basic Info', icon: 'information-circle-outline' as const },
    { title: isAmharic ? 'አድራሻ እና ዝርዝር' : 'Location & Details', icon: 'location-outline' as const },
    { title: isAmharic ? 'ዋጋ እና ሚዲያ' : 'Pricing & Media', icon: 'pricetag-outline' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'አዲስ ቤት መዝግብ' : 'Add Property Listing'}
        subtitle={isAmharic ? 'ሙሉ የንብረት ዝርዝር መረጃዎችን ያስገቡ' : 'Comprehensive Real Estate Listing Form'}
        showBack={true}
      />

      {/* Stepper Header */}
      <View style={[styles.stepperContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          const isDone = activeStep > idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.stepTab,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
              ]}
              onPress={() => {
                if (idx < activeStep) setActiveStep(idx as any);
                else if (validateStep(activeStep)) setActiveStep(idx as any);
              }}
            >
              <View
                style={[
                  styles.stepBadge,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : isDone
                      ? '#10B981'
                      : colors.surfaceSecondary,
                  },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepBadgeText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
                    {idx + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  { color: isActive ? colors.primary : colors.textSecondary },
                  isActive && { fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {step.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ─── STEP 0: BASIC INFORMATION ─── */}
        {activeStep === 0 && (
          <View style={styles.sectionCard}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {isAmharic ? 'የቤቱ ርዕስ *' : 'Property Title *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={isAmharic ? 'ለምሳሌ፡ ቦሌ የሚገኝ ዘመናዊ ቪላ' : 'e.g. Modern Luxury Villa in Bole'}
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'ዝርዝር ማብራሪያ *' : 'Description *'}
            </Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              multiline
              numberOfLines={4}
              placeholder={isAmharic ? 'የቤቱን ቁልፍ ገጽታዎች፣ ሁኔታ እና ዝርዝር መረጃ ይግለጹ...' : 'Include key features, condition, and prime selling points...'}
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            {/* Transaction Type */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'የግብይት አይነት (Transaction Type)' : 'Transaction Type'}
            </Text>
            <View style={styles.chipsRow}>
              {TRANSACTION_TYPES.map((t) => {
                const isSelected = transactionType === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setTransactionType(t.key)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                      {isAmharic ? t.labelAm : t.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Intended Purpose */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'የታለመበት ዓላማ (Intended Purpose)' : 'Intended Purpose'}
            </Text>
            <View style={styles.chipsRow}>
              {INTENDED_PURPOSES.slice(0, 6).map((p) => {
                const isSelected = intendedPurpose === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setIntendedPurpose(p.key)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                      {isAmharic ? p.labelAm : p.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Property Category */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'የንብረት ምድብ (Property Category)' : 'Property Category'}
            </Text>
            <View style={styles.chipsRow}>
              {PROPERTY_TYPES.map((pt) => {
                const isSelected = propertyType === pt.key;
                return (
                  <TouchableOpacity
                    key={pt.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setPropertyType(pt.key)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                      {isAmharic ? pt.labelAm : pt.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search Tags */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'የፍለጋ መለያዎች (Tags - በነጠላ ሰረዝ የተለዩ)' : 'Tags (Comma-separated)'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="e.g. Bole, Luxury, Furnished, NewBuild"
              placeholderTextColor={colors.textMuted}
              value={tags}
              onChangeText={setTags}
            />

            {/* Verified Switch */}
            <View style={[styles.switchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                  <Text style={[styles.switchTitle, { color: colors.text }]}>
                    {isAmharic ? 'የተረጋገጠ ንብረት (Verified Listing)' : 'Verified Property Listing'}
                  </Text>
                </View>
                <Text style={[styles.switchSubtitle, { color: colors.textSecondary }]}>
                  {isAmharic
                    ? 'ሙሉ የባለቤትነት ማረጋገጫ ያለውና የተፈተሸ መሆኑን ያመልክቱ'
                    : 'Listing with officially verified title deed'}
                </Text>
              </View>
              <Switch
                value={isVerified}
                onValueChange={setIsVerified}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}

        {/* ─── STEP 1: LOCATION & DETAILS ─── */}
        {activeStep === 1 && (
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>
              <Ionicons name="navigate-outline" size={18} /> {isAmharic ? 'የአድራሻ መረጃ' : 'Location & Address'}
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {isAmharic ? 'የመንገድ አድራሻ *' : 'Street Address *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={isAmharic ? 'ለምሳሌ፡ ቦሌ መንገድ፣ አትላስ አካባቢ' : 'e.g. 123 Bole Road, Atlas Area'}
              placeholderTextColor={colors.textMuted}
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'ከተማ *' : 'City *'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'ክፍለ ከተማ / ክልል' : 'Subcity / State'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            {/* Coordinates */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'የካርታ መጋጠሚያዎች (GPS Coordinates)' : 'GPS Coordinates (Lat / Lng)'}
            </Text>
            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder="Latitude (e.g. 9.0300)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={lat}
                  onChangeText={setLat}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder="Longitude (e.g. 38.7400)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={lng}
                  onChangeText={setLng}
                />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Specifications */}
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>
              <Ionicons name="grid-outline" size={18} /> {isAmharic ? 'የቤቱ ዝርዝር ሁኔታ' : 'Property Specifications'}
            </Text>

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'መኝታ ቤቶች' : 'Bedrooms'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'መታጠቢያ ቤቶች' : 'Bathrooms'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                />
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'ስፋት (ካ.ሜ)' : 'Area (sq m)'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={area}
                  onChangeText={setArea}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'ፎቆች / ወለል' : 'Floors'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={floors}
                  onChangeText={setFloors}
                />
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'የተገነባበት ዓመት' : 'Year Built'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={yearBuilt}
                  onChangeText={setYearBuilt}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'የመኪና ማቆሚያ' : 'Parking Spaces'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={parkingSpaces}
                  onChangeText={setParkingSpaces}
                />
              </View>
            </View>

            {/* Furnished */}
            <View style={[styles.switchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: colors.text }]}>
                  {isAmharic ? 'ዕቃዎች የተሟሉለት (Fully Furnished)' : 'Fully Furnished'}
                </Text>
              </View>
              <Switch
                value={furnished}
                onValueChange={setFurnished}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Amenities */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'አገልግሎቶችና መገልገያዎች (Amenities)' : 'Amenities'}
            </Text>
            <View style={styles.chipsRow}>
              {AMENITIES_OPTIONS.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.key);
                return (
                  <TouchableOpacity
                    key={amenity.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleAmenity(amenity.key)}
                  >
                    <Ionicons
                      name={amenity.icon as any}
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                      {isAmharic ? amenity.labelAm : amenity.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Features */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'ተጨማሪ ባህሪያት (Features)' : 'Features'}
            </Text>
            <View style={styles.chipsRow}>
              {FEATURES_OPTIONS.map((f) => {
                const isSelected = selectedFeatures.includes(f);
                return (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleFeature(f)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── STEP 2: PRICING & MEDIA ─── */}
        {activeStep === 2 && (
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>
              <Ionicons name="card-outline" size={18} /> {isAmharic ? 'የዋጋ እና የክፍያ ውሎች' : 'Pricing & Terms'}
            </Text>

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {transactionType === 'BUY'
                    ? isAmharic ? 'የሽያጭ ዋጋ (ETB) *' : 'Listing Price (ETB) *'
                    : isAmharic ? 'የኪራይ ዋጋ (ETB) *' : 'Rent Amount (ETB) *'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder="e.g. 50000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={{ flex: 0.8 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'ያሉ ክፍሎች ብዛት' : 'Units Qty'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>

            {/* If BUY: Sale terms */}
            {transactionType === 'BUY' && (
              <View style={[styles.subCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <Text style={[styles.subCardTitle, { color: '#F59E0B' }]}>
                  <Ionicons name="document-text-outline" size={16} /> {isAmharic ? 'የግዢ ውሎች እና ሰነዶች' : 'Purchase Terms & Title Deeds'}
                </Text>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'የባለቤትነት ሰነድ አይነት' : 'Ownership Document Type'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={ownershipDocType}
                  onChangeText={setOwnershipDocType}
                  placeholder="e.g. Freehold Title Deed, 99-Yr Lease"
                />

                <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.sm }]}>
                  {isAmharic ? 'ዝቅተኛ ቅድመ ክፍያ (%)' : 'Min Down Payment (%)'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  keyboardType="numeric"
                  value={downPaymentMin}
                  onChangeText={setDownPaymentMin}
                />

                <View style={styles.switchRowInner}>
                  <Text style={[styles.switchTextSmall, { color: colors.text }]}>
                    {isAmharic ? 'ዋጋ ይደራደራል (Price Negotiable)' : 'Price Negotiable'}
                  </Text>
                  <Switch
                    value={isNegotiable}
                    onValueChange={setIsNegotiable}
                    trackColor={{ false: '#CBD5E1', true: colors.primary }}
                  />
                </View>

                <View style={styles.switchRowInner}>
                  <Text style={[styles.switchTextSmall, { color: colors.text }]}>
                    {isAmharic ? 'በኤስክሮው አካውንት የሚደገፍ' : 'Escrow Protected Account'}
                  </Text>
                  <Switch
                    value={escrowSupported}
                    onValueChange={setEscrowSupported}
                    trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                  />
                </View>
              </View>
            )}

            {/* If RENT / SHORT_STAY */}
            {transactionType !== 'BUY' && (
              <View style={[styles.subCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <Text style={[styles.subCardTitle, { color: colors.primary }]}>
                  <Ionicons name="calendar-outline" size={16} /> {isAmharic ? 'የኪራይ ውል እና ክፍያ' : 'Rental Lease Terms'}
                </Text>

                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'የክፍያ ድግግሞሽ' : 'Billing Frequency'}
                </Text>
                <View style={styles.chipsRow}>
                  {[
                    { key: 'monthly', labelEn: 'Monthly', labelAm: 'በየወሩ' },
                    { key: 'weekly', labelEn: 'Weekly', labelAm: 'በየሳምንቱ' },
                    { key: 'daily', labelEn: 'Daily', labelAm: 'በየቀኑ' },
                  ].map((f) => {
                    const isSelected = rentalFrequency === f.key;
                    return (
                      <TouchableOpacity
                        key={f.key}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setRentalFrequency(f.key as any)}
                      >
                        <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                          {isAmharic ? f.labelAm : f.labelEn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                      {isAmharic ? 'የቅድሚያ ኪራይ (ወራት)' : 'Advance Rent (Mo.)'}
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                      keyboardType="numeric"
                      value={advancePayments}
                      onChangeText={setAdvancePayments}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                      {isAmharic ? 'ዋስትና ተቀማጭ (ETB)' : 'Security Deposit'}
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                      keyboardType="numeric"
                      value={securityDeposit}
                      onChangeText={setSecurityDeposit}
                    />
                  </View>
                </View>

                <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.xs }]}>
                  {isAmharic ? 'ዝቅተኛ የኪራይ ጊዜ (ወራት)' : 'Min Lease Duration (Months)'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  keyboardType="numeric"
                  value={minLeaseDuration}
                  onChangeText={setMinLeaseDuration}
                />
              </View>
            )}

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'የጥገና ክፍያ (Maintenance Fee)' : 'Maintenance Fee'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={maintenanceFee}
                  onChangeText={setMaintenanceFee}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {isAmharic ? 'ግብር / ታክስ (Tax Amount)' : 'Tax Amount'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={taxAmount}
                  onChangeText={setTaxAmount}
                />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Rich Media */}
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>
              <Ionicons name="film-outline" size={18} /> {isAmharic ? '360° ቨርቹዋል ቱር እና ቪዲዮ' : 'Rich Media & Virtual Tour'}
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {isAmharic ? '360° ፓኖራሚክ ፎቶ URL' : '360° Panoramic Image URL'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              value={panoramic360Url}
              onChangeText={setPanoramic360Url}
            />

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.xs }]}>
              {isAmharic ? '360° መግለጫ (Caption)' : '360 Tour Caption'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={panoramic360Caption}
              onChangeText={setPanoramic360Caption}
            />

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'የቪዲዮ ሊንክ (YouTube / Walkthrough Video URL)' : 'Walkthrough Video URL'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="https://www.youtube.com/watch?v=..."
              placeholderTextColor={colors.textMuted}
              value={videoUrl}
              onChangeText={setVideoUrl}
            />

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? 'የወለል ፕላን ፎቶ URL (Floor Plan)' : 'Floor Plan Image URL'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              value={floorPlanUrl}
              onChangeText={setFloorPlanUrl}
            />

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.md }]}>
              {isAmharic ? '3D / Matterport ቨርቹዋል ቱር URL' : '3D / Matterport Virtual Tour URL'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="https://my.matterport.com/show/?m=..."
              placeholderTextColor={colors.textMuted}
              value={virtualTourUrl}
              onChangeText={setVirtualTourUrl}
            />
          </View>
        )}

        {/* Stepper Navigation Buttons */}
        <View style={styles.navButtonsRow}>
          {activeStep > 0 && (
            <TouchableOpacity
              style={[styles.backStepBtn, { borderColor: colors.border }]}
              onPress={() => setActiveStep((prev) => (prev - 1) as any)}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
              <Text style={[styles.backStepText, { color: colors.text }]}>
                {isAmharic ? 'ተመለስ' : 'Back'}
              </Text>
            </TouchableOpacity>
          )}

          {activeStep < 2 ? (
            <TouchableOpacity
              style={[styles.nextStepBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => {
                if (validateStep(activeStep)) {
                  setActiveStep((prev) => (prev + 1) as any);
                }
              }}
            >
              <Text style={styles.nextStepText}>{isAmharic ? 'ቀጣይ' : 'Next'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextStepBtn, { backgroundColor: '#10B981', flex: 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.nextStepText}>
                    {isAmharic ? 'ንብረቱን መዝግብ' : 'Publish Property Listing'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
  },
  stepTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  sectionCard: {
    gap: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  subCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  switchRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  switchTextSmall: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  backStepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  nextStepText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
