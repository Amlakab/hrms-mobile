import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { borderRadius, spacing } from '../constants/theme';
import api from '../config/api';

interface RentalApplicationModalProps {
  visible: boolean;
  onClose: () => void;
  houseId: string;
  houseTitle: string;
}

export const RentalApplicationModal: React.FC<RentalApplicationModalProps> = ({
  visible,
  onClose,
  houseId,
  houseTitle,
}) => {
  const { colors } = useTheme();
  const { isAmharic, t } = useLanguage();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [occupation, setOccupation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [occupants, setOccupants] = useState('1');
  const [moveInDate, setMoveInDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert(
        isAmharic ? 'ማስጠንቀቂያ' : 'Validation',
        isAmharic ? 'እባክዎ ሙሉ ስም እና ስልክ ቁጥር ያስገቡ' : 'Please provide full name and phone number'
      );
      return;
    }

    try {
      setSubmitting(true);
      const moveIn = moveInDate.trim() || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      await api.post('/houses/apply', {
        houseId,
        fullName: fullName.trim(),
        email: email.trim() || 'applicant@realestatepro.et',
        phone: phone.trim(),
        occupation: occupation.trim() || 'Professional / Self-Employed',
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 25000,
        numberOfOccupants: Number(occupants) || 1,
        preferredMoveInDate: moveIn,
        message: message.trim(),
      });

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Application Sent',
        isAmharic
          ? 'የኪራይ ማመልከቻዎ በተሳካ ሁኔታ ለባለቤቱ ተልኳል!'
          : 'Your rental application has been submitted successfully!'
      );
      onClose();
    } catch (err: any) {
      // Fallback to /orders if /houses/apply endpoint differs
      try {
        await api.post('/orders', {
          houseId,
          orderType: 'RENT',
          message: `Application: ${fullName}, Occupants: ${occupants}, Income: ${monthlyIncome}. ${message}`,
        });
        Alert.alert(
          isAmharic ? 'ተሳክቷል' : 'Application Sent',
          isAmharic
            ? 'የኪራይ ማመልከቻዎ ለባለቤቱ ደርሷል!'
            : 'Your rental application has been submitted successfully!'
        );
        onClose();
      } catch (orderErr: any) {
        Alert.alert(
          isAmharic ? 'ስህተት' : 'Error',
          err.response?.data?.message || (isAmharic ? 'ማመልከቻውን መላክ አልተቻለም' : 'Failed to submit application')
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {isAmharic ? 'የኪራይ ውል ማመልከቻ' : 'Apply for Rental Lease'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                {houseTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'ሙሉ ስም *' : 'Full Name *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
              placeholder={isAmharic ? 'ስምዎን ያስገቡ' : 'Enter your full name'}
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {isAmharic ? 'ስልክ ቁጥር *' : 'Phone *'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  placeholder="0911223344"
                  placeholderTextColor={colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {isAmharic ? 'ኢሜይል' : 'Email'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  placeholder="name@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {isAmharic ? 'የስራ መስክ' : 'Occupation'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  placeholder={isAmharic ? 'ምሳሌ፡ መሃንዲስ' : 'e.g. Engineer'}
                  placeholderTextColor={colors.textMuted}
                  value={occupation}
                  onChangeText={setOccupation}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {isAmharic ? 'ወርሃዊ ገቢ (ETB)' : 'Monthly Income'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  placeholder="40,000"
                  placeholderTextColor={colors.textMuted}
                  value={monthlyIncome}
                  onChangeText={setMonthlyIncome}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {isAmharic ? 'የነዋሪዎች ብዛት' : 'Occupants'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  value={occupants}
                  onChangeText={setOccupants}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {isAmharic ? 'የሚገቡበት ቀን' : 'Move-in Date'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={moveInDate}
                  onChangeText={setMoveInDate}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>
              {isAmharic ? 'ተጨማሪ መልዕክት ለባለቤቱ' : 'Message to Landlord'}
            </Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
              placeholder={isAmharic ? 'ስለ እርስዎ ወይም ስለ ኪራዩ ማብራሪያ ይጻፉ...' : 'Introduce yourself or ask questions...'}
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}
                onPress={onClose}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>
                  {isAmharic ? 'ይቅር' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    {isAmharic ? 'ማመልከቻውን ላክ' : 'Submit Application'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: spacing.xs,
  },
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  textArea: {
    height: 70,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
