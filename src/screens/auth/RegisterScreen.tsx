import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { Role } from '../../types';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [agentId, setAgentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles: Array<{ key: Role; label: string; desc: string }> = [
    {
      key: 'customer',
      label: isAmharic ? 'ተከራይ / ገዢ' : 'Tenant / Buyer',
      desc: isAmharic ? 'ቤቶችን ለመከራየት ወይም ለመግዛት' : 'Explore, book, and lease properties',
    },
    {
      key: 'owner',
      label: isAmharic ? 'የቤት ባለቤት' : 'Property Owner',
      desc: isAmharic ? 'የራስዎን ቤቶች ለመከራየት ወይም ለመሸጥ' : 'List and manage personal properties',
    },
    {
      key: 'agent',
      label: isAmharic ? 'ደላላ / ወኪል' : 'Real Estate Agent',
      desc: isAmharic ? 'የደንበኞችን ንብረት ለማስተዳደር' : 'Broker and represent client properties',
    },
  ];

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Notice',
        isAmharic ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Please enter your full name'
      );
      return;
    }
    if (!phone.trim()) {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Notice',
        isAmharic ? 'እባክዎ ስልክ ቁጥር ያስገቡ' : 'Please enter your phone number'
      );
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Notice',
        isAmharic ? 'የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መሆን አለበት' : 'Password must be at least 6 characters'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Mismatch',
        isAmharic ? 'የይለፍ ቃሎች አይመሳሰሉም' : 'Passwords do not match'
      );
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        role,
        background: agentId.trim() || undefined,
      });

      Alert.alert(
        isAmharic ? 'እንኳን ደህና መጡ' : 'Welcome',
        isAmharic ? 'መለያዎ በተሳካ ሁኔታ ተፈጥሯል!' : 'Your account has been created successfully!'
      );
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'የምዝገባ ስህተት' : 'Registration Failed',
        err.message || 'Could not complete registration'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {isAmharic ? 'አዲስ መለያ ይክፈቱ' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {isAmharic
              ? 'የሚፈልጉትን ሚና ይምረጡና መረጃዎን ይሙሉ'
              : 'Select your platform role and fill in your profile'}
          </Text>
        </View>

        {/* Role Selector Cards */}
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {isAmharic ? 'የመለያ ሚና ይምረጡ' : 'Choose Account Role'}
        </Text>
        <View style={styles.rolesContainer}>
          {roles.map((r) => {
            const isSelected = role === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: isSelected ? colors.surfaceSecondary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                  },
                ]}
                onPress={() => setRole(r.key)}
                activeOpacity={0.8}
              >
                <View style={styles.roleCardHeader}>
                  <Text
                    style={[
                      styles.roleCardTitle,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {r.label}
                  </Text>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                </View>
                <Text style={[styles.roleCardDesc, { color: colors.textMuted }]}>{r.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {isAmharic ? 'ሙሉ ስም' : 'Full Name'}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
            ]}
          >
            <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder={isAmharic ? 'ሙሉ ስምዎን ያስገቡ' : 'Abebe Kebede'}
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Phone */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
            ]}
          >
            <Ionicons name="call-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="0911223344"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Email */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {isAmharic ? 'ኢሜይል (አስገዳጅ ያልሆነ)' : 'Email (Optional)'}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
            ]}
          >
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="example@gmail.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {isAmharic ? 'የይለፍ ቃል' : 'Password'}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {isAmharic ? 'የይለፍ ቃል አረጋግጥ' : 'Confirm Password'}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Repeat password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isAmharic ? 'መለያ ፍጠር' : 'Complete Registration'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Already have account */}
          <View style={styles.loginRow}>
            <Text style={[styles.loginNotice, { color: colors.textMuted }]}>
              {isAmharic ? 'ቀደም ሲል መለያ አለዎት? ' : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                {isAmharic ? 'ግባ' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 50,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  inputLabel: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: spacing.md,
  },
  rolesContainer: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleCardDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
  },
  submitButton: {
    height: 50,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginNotice: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
