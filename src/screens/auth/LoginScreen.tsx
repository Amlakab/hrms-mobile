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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, loginWithOtp } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, isAmharic, toggleLanguage } = useLanguage();

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert(
        isAmharic ? 'ማስታወሻ' : 'Notice',
        isAmharic ? 'እባክዎ ስልክ ቁጥር ያስገቡ' : 'Please enter your phone number'
      );
      return;
    }

    try {
      setLoading(true);
      if (isOtpMode) {
        if (!otp.trim()) {
          Alert.alert(
            isAmharic ? 'ማስታወሻ' : 'Notice',
            isAmharic ? 'እባክዎ የOTP ኮድ ያስገቡ' : 'Please enter the OTP code'
          );
          return;
        }
        await loginWithOtp(phone.trim(), otp.trim());
      } else {
        if (!password.trim()) {
          Alert.alert(
            isAmharic ? 'ማስታወሻ' : 'Notice',
            isAmharic ? 'እባክዎ የይለፍ ቃል ያስገቡ' : 'Please enter your password'
          );
          return;
        }
        await login(phone.trim(), password.trim());
      }
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'የመግቢያ ስህተት' : 'Login Failed',
        err.message || 'Invalid credentials'
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
        {/* Top Controls: Lang & Theme */}
        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={[styles.smallPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          >
            <Text style={[styles.pillText, { color: colors.primary }]}>
              {isAmharic ? 'English' : 'አማርኛ'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconPill, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={isDark ? '#F59E0B' : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Branding Logo & Header */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoIconCircle, { backgroundColor: '#FFFFFF', overflow: 'hidden' }]}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 68, height: 68 }}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>
            HRMS REAL ESTATE
          </Text>
          <Text style={[styles.brandTagline, { color: colors.textMuted }]}>
            {isAmharic
              ? 'የተረጋገጡ የቤት ኪራይ እና ሽያጭ መድረክ'
              : 'Enterprise Real Estate & Rental System'}
          </Text>
        </View>

        {/* Auth Mode Toggle Pill */}
        <View style={[styles.modeToggle, { backgroundColor: colors.surfaceSecondary }]}>
          <TouchableOpacity
            style={[
              styles.modeTab,
              !isOtpMode && { backgroundColor: colors.card, shadowColor: '#000', elevation: 2 },
            ]}
            onPress={() => setIsOtpMode(false)}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: !isOtpMode ? colors.primary : colors.textMuted },
              ]}
            >
              {isAmharic ? 'የይለፍ ቃል' : 'Password Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              isOtpMode && { backgroundColor: colors.card, shadowColor: '#000', elevation: 2 },
            ]}
            onPress={() => setIsOtpMode(true)}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: isOtpMode ? colors.primary : colors.textMuted },
              ]}
            >
              {isAmharic ? 'በOTP ግባ' : 'OTP Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.formContainer}>
          {/* Phone Field */}
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
              placeholder={isAmharic ? 'ለምሳሌ፡ 0911223344' : 'e.g. 0911223344'}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
            />
          </View>

          {!isOtpMode ? (
            <>
              {/* Password Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {isAmharic ? 'የይለፍ ቃል' : 'Password'}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder={isAmharic ? 'የይለፍ ቃልዎን ያስገቡ' : 'Enter your password'}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* OTP Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {isAmharic ? 'የማረጋገጫ ኮድ (OTP)' : 'Verification Code (OTP)'}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={18}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="6-digit OTP code"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isAmharic ? 'ወደ መለያ ግባ' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerNotice, { color: colors.textMuted }]}>
              {isAmharic ? 'መለያ የለዎትም? ' : "Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>
                {isAmharic ? 'አዲስ መለያ ይክፈቱ' : 'Sign Up'}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  smallPill: {
    paddingHorizontal: 12,
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
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  logoIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  modeTab: {
    flex: 1,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
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
  eyeBtn: {
    padding: spacing.xs,
  },
  submitButton: {
    height: 50,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  registerNotice: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
