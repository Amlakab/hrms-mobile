import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../config/api';
import { spacing } from '../../constants/theme';
import { House, PropertyType } from '../../types';

export const EditHouseScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const { house, houseId } = route.params || {};
  const targetId = house?._id || houseId;

  const [loading, setLoading] = useState(!house);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState(house?.title || '');
  const [description, setDescription] = useState(house?.description || '');
  const [propertyType, setPropertyType] = useState<PropertyType>(
    house?.propertyType || PropertyType.APARTMENT
  );
  const [transactionType, setTransactionType] = useState<'RENT' | 'SALE'>(
    house?.price ? (house.securityDeposit ? 'RENT' : 'SALE') : 'RENT'
  );
  const [price, setPrice] = useState(house?.price ? String(house.price) : '');
  const [securityDeposit, setSecurityDeposit] = useState(
    house?.securityDeposit ? String(house.securityDeposit) : ''
  );
  const [bedrooms, setBedrooms] = useState(
    house?.details?.bedrooms ? String(house.details.bedrooms) : '2'
  );
  const [bathrooms, setBathrooms] = useState(
    house?.details?.bathrooms ? String(house.details.bathrooms) : '2'
  );
  const [area, setArea] = useState(
    house?.details?.area ? String(house.details.area) : '120'
  );
  const [address, setAddress] = useState(house?.location?.address || '');
  const [city, setCity] = useState(house?.location?.city || 'Addis Ababa');
  const [virtualTourUrl, setVirtualTourUrl] = useState(house?.virtualTourUrl || '');
  const [furnished, setFurnished] = useState(house?.details?.furnished || false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    house?.details?.amenities || ['wifi', 'security', 'parking']
  );

  useEffect(() => {
    if (!house && targetId) {
      (async () => {
        try {
          setLoading(true);
          const res = await api.get(`/houses/${targetId}`);
          const h: House = res.data?.data || res.data;
          if (h) {
            setTitle(h.title);
            setDescription(h.description);
            setPropertyType(h.propertyType);
            setPrice(String(h.price));
            if (h.securityDeposit) setSecurityDeposit(String(h.securityDeposit));
            if (h.details?.bedrooms) setBedrooms(String(h.details.bedrooms));
            if (h.details?.bathrooms) setBathrooms(String(h.details.bathrooms));
            if (h.details?.area) setArea(String(h.details.area));
            if (h.location?.address) setAddress(h.location.address);
            if (h.location?.city) setCity(h.location.city);
            if (h.virtualTourUrl) setVirtualTourUrl(h.virtualTourUrl);
            if (h.details?.furnished) setFurnished(h.details.furnished);
            if (h.details?.amenities) setSelectedAmenities(h.details.amenities);
          }
        } catch (err: any) {
          Alert.alert('Error', 'Failed to load property details.');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [house, targetId]);

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: 'wifi-outline' },
    { id: 'security', label: '24/7 Security', icon: 'shield-checkmark-outline' },
    { id: 'parking', label: 'Parking', icon: 'car-outline' },
    { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
    { id: 'pool', label: 'Pool', icon: 'water-outline' },
    { id: 'elevator', label: 'Elevator', icon: 'business-outline' },
    { id: 'balcony', label: 'Balcony', icon: 'home-outline' },
    { id: 'generator', label: 'Backup Generator', icon: 'flash-outline' },
  ];

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !price.trim() || !address.trim()) {
      Alert.alert('Required', 'Please fill in title, price, and address.');
      return;
    }

    try {
      setSaving(true);
      const parsedPrice = Number(price) || 0;
      const parsedSecurityDeposit = securityDeposit ? Number(securityDeposit) : 0;
      const payload = {
        title: title.trim(),
        description: description.trim(),
        propertyType,
        price: parsedPrice,
        pricing: {
          price: parsedPrice,
          securityDeposit: parsedSecurityDeposit,
          maintenanceFee: Number((house as any)?.pricing?.maintenanceFee) || 0,
          taxAmount: Number((house as any)?.pricing?.taxAmount) || 0,
          quantity: 1,
        },
        location: {
          address: address.trim(),
          city: city.trim(),
          state: (house as any)?.location?.state || 'Addis Ababa',
          country: 'Ethiopia',
          zipCode: (house as any)?.location?.zipCode || '1000',
          coordinates: (house as any)?.location?.coordinates || { lat: 9.03, lng: 38.74 },
        },
        details: {
          bedrooms: Number(bedrooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          area: Number(area) || 0,
          parkingSpaces: Number((house as any)?.details?.parkingSpaces) || 1,
          floors: Number((house as any)?.details?.floors) || 1,
          yearBuilt: Number((house as any)?.details?.yearBuilt) || new Date().getFullYear(),
          furnished,
          furnishingStatus: furnished ? 'furnished' : 'unfurnished',
          amenities: selectedAmenities,
          features: (house as any)?.details?.features || [],
        },
        virtualTour: {
          enabled: !!virtualTourUrl.trim(),
          url: virtualTourUrl.trim(),
          embedCode: '',
        },
        virtualTourUrl: virtualTourUrl.trim() || undefined,
      };

      await api.put(`/houses/${targetId}`, payload);
      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Property Updated',
        isAmharic
          ? 'የንብረቱ መረጃ በተሳካ ሁኔታ ተሻሽሏል።'
          : 'Property details updated successfully.'
      );
      navigation.goBack();
    } catch (err: any) {
      console.error('Update error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update property.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'ንብረት አሻሽል' : 'Edit Property Listing'}
        subtitle={isAmharic ? 'ዋጋ፣ መግለጫ እና ባህሪያትን ይቀይሩ' : 'Update Pricing, Specs & Amenities'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isAmharic ? 'የንብረቱ ርዕስ *' : 'Property Title *'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Modern 3-Bedroom Villa in Bole"
          placeholderTextColor={colors.textMuted}
        />

        {/* Description */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isAmharic ? 'ዝርዝር መግለጫ' : 'Description'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Detailed description of features, views, security..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
        />

        {/* Property Type Grid */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isAmharic ? 'የንብረት አይነት' : 'Property Type'}
        </Text>
        <View style={styles.chipRow}>
          {[
            PropertyType.APARTMENT,
            PropertyType.VILLA,
            PropertyType.CONDO,
            PropertyType.HOUSE,
            PropertyType.LAND,
          ].map((type) => {
            const isSelected = propertyType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setPropertyType(type)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: isSelected ? colors.primary : isDark ? '#162035' : '#E2E8F0',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.typeChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pricing Row */}
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {isAmharic ? 'ዋጋ (ETB) *' : 'Price (ETB) *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="45000"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {isAmharic ? 'የዋስትና ገንዘብ (ETB)' : 'Security Deposit'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
              value={securityDeposit}
              onChangeText={setSecurityDeposit}
              keyboardType="numeric"
              placeholder="45000"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Specs Row */}
        <View style={styles.threeCol}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Beds</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
              value={bedrooms}
              onChangeText={setBedrooms}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Baths</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
              value={bathrooms}
              onChangeText={setBathrooms}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Area (m²)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
              value={area}
              onChangeText={setArea}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Location */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isAmharic ? 'አድራሻ *' : 'Location Address *'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
          value={address}
          onChangeText={setAddress}
          placeholder="Bole Atlas, Near Edna Mall"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isAmharic ? 'ከተማ' : 'City'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
          value={city}
          onChangeText={setCity}
          placeholder="Addis Ababa"
          placeholderTextColor={colors.textMuted}
        />

        {/* Virtual 3D Tour URL */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isAmharic ? 'የ3D ወይም Matterport ምናባዊ ጉብኝት ሊንክ' : '3D Matterport Virtual Tour Link'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F8FAFC', color: colors.text, borderColor: colors.border }]}
          value={virtualTourUrl}
          onChangeText={setVirtualTourUrl}
          placeholder="https://my.matterport.com/show/?m=..."
          placeholderTextColor={colors.textMuted}
        />

        {/* Furnished Toggle */}
        <View style={[styles.switchRow, { borderColor: colors.border }]}>
          <View>
            <Text style={[styles.switchTitle, { color: colors.text }]}>
              {isAmharic ? 'የተሟላ የቤት እቃ አለው (Furnished)' : 'Fully Furnished'}
            </Text>
            <Text style={[styles.switchSub, { color: colors.textMuted }]}>
              Includes appliances, sofa sets, beds, and dining
            </Text>
          </View>
          <Switch
            value={furnished}
            onValueChange={setFurnished}
            trackColor={{ false: '#767577', true: colors.primary }}
          />
        </View>

        {/* Amenities Checklist */}
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 10 }]}>
          {isAmharic ? 'አገልግሎቶች እና ማሟያዎች' : 'Amenities & Facilities'}
        </Text>
        <View style={styles.amenitiesWrap}>
          {amenitiesList.map((item) => {
            const hasIt = selectedAmenities.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleAmenity(item.id)}
                style={[
                  styles.amenityChip,
                  {
                    backgroundColor: hasIt ? colors.primary : isDark ? '#111D32' : '#F8FAFC',
                    borderColor: hasIt ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={hasIt ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.amenityText,
                    { color: hasIt ? '#FFFFFF' : colors.text, fontWeight: hasIt ? '700' : '500' },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>
                {isAmharic ? 'ለውጦችን መዝግብ' : 'Save Property Changes'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
    gap: 8,
    paddingBottom: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  threeCol: {
    flexDirection: 'row',
    gap: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    marginVertical: 10,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 12,
    marginTop: 2,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  amenityText: {
    fontSize: 12,
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
