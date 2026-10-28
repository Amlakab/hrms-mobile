import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';

export const ContactScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Property Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Required Fields',
        isAmharic ? 'እባክዎ ሙሉ ስም፣ ስልክ ቁጥር እና መልእክትዎን ያስገቡ' : 'Please provide your name, phone, and message.'
      );
      return;
    }

    try {
      setLoading(true);
      await api.post('/feedback', {
        type: 'CONTACT_INQUIRY',
        senderName: name.trim(),
        senderPhone: phone.trim(),
        senderEmail: email.trim() || undefined,
        title: subject.trim(),
        message: message.trim(),
      });

      Alert.alert(
        isAmharic ? 'መልእክትዎ ተልኳል' : 'Message Sent',
        isAmharic
          ? 'ስለ መልዕክትዎ እናመሰግናለን። የደንበኞች አገልግሎት ቡድናችን በቅርቡ ያነጋግርዎታል።'
          : 'Thank you for reaching out. Our support team will get in touch with you shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || 'Could not send message'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'ያግኙን' : 'Contact Us'}
        subtitle={isAmharic ? 'የደንበኞች አገልግሎት እና የቢሮ አድራሻ' : 'Customer support & headquarters'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Contact Info Cards */}
        <View style={styles.infoRow}>
          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={() => Linking.openURL('tel:0911223344')}
          >
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: colors.textMuted }]}>0911223344</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={() => Linking.openURL('mailto:info@hrms-realestate.et')}
          >
            <Ionicons name="mail" size={20} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.textMuted }]}>info@hrms.et</Text>
          </TouchableOpacity>
        </View>

        {/* Office Location Banner */}
        <View style={[styles.locBanner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="location" size={22} color="#EF4444" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.locTitle, { color: colors.text }]}>
              {isAmharic ? 'ዋና መስሪያ ቤት' : 'Main Headquarters'}
            </Text>
            <Text style={[styles.locDesc, { color: colors.textMuted }]}>
              Bole Road, Atlas Area, Addis Ababa, Ethiopia
            </Text>
          </View>
        </View>

        {/* Contact Form */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isAmharic ? 'የመልዕክት መላኪያ ቅጽ' : 'Send an Inquiry'}
        </Text>

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {isAmharic ? 'ሙሉ ስም' : 'Your Name'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="Abebe Kebede"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="0911223344"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {isAmharic ? 'ርዕስ' : 'Subject'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="e.g. Property Listing or Viewing"
          placeholderTextColor={colors.textMuted}
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {isAmharic ? 'መልዕክት' : 'Message'}
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          multiline
          numberOfLines={4}
          placeholder={isAmharic ? 'የሚፈልጉትን መረጃ እዚህ ይፃፉ...' : 'Write your questions or inquiries...'}
          placeholderTextColor={colors.textMuted}
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isAmharic ? 'መልዕክት ላክ' : 'Send Inquiry'}
            </Text>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 50,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 11,
  },
  locBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  locTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  locDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  textArea: {
    minHeight: 90,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
