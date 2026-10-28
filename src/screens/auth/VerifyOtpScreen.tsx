import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

export const VerifyOtpScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();
  const { loginWithOtp } = useAuth();

  const phone = route.params?.phone || '0911002233';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!otp.trim() || otp.length < 4) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Required',
        isAmharic ? 'እባክዎ ትክክለኛውን የማረጋገጫ ኮድ ያስገቡ' : 'Please enter the 6-digit verification code.'
      );
      return;
    }

    try {
      setLoading(true);
      await loginWithOtp(phone, otp);
      Alert.alert(
        isAmharic ? 'እንኳን ደህና መጡ' : 'Welcome!',
        isAmharic ? 'ማረጋገጫው ተሳክቷል።' : 'OTP verified successfully.'
      );
      navigation.navigate('Main');
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Verification Failed',
        err.message || (isAmharic ? 'የማረጋገጫ ኮዱ ትክክል አይደለም' : 'Invalid OTP code.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await api.post('/auth/send-otp', { phone });
      setCountdown(60);
      Alert.alert(
        isAmharic ? 'ተልኳል' : 'Code Sent',
        isAmharic ? 'አዲስ የማረጋገጫ ኮድ ወደ ስልክዎ ተልኳል' : `A fresh OTP code was sent to ${phone}.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የስልክ ማረጋገጫ' : 'OTP Phone Verification'}
        subtitle={isAmharic ? 'የማረጋገጫ ኮድ ያስገቡ' : 'Two-Factor Authentication'}
        showBack={true}
      />

      <View style={styles.content}>
        <View style={[styles.shieldIconWrap, { backgroundColor: isDark ? '#111D32' : '#EFF6FF' }]}>
          <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {isAmharic ? 'የማረጋገጫ ኮድ አስገባ' : 'Enter 6-Digit Code'}
        </Text>

        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {isAmharic
            ? `ባለ 6-አሃዝ የማረጋገጫ ኮድ ወደ ስልክ ቁጥር ${phone} ተልኳል።`
            : `We sent a 6-digit one-time password to ${phone}.`}
        </Text>

        {/* OTP Input */}
        <TextInput
          style={[
            styles.otpInput,
            { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border },
          ]}
          value={otp}
          onChangeText={setOtp}
          placeholder="123456"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={6}
          autoFocus
        />

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading}
          style={[styles.verifyBtn, { backgroundColor: colors.primary }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyBtnText}>
              {isAmharic ? 'አረጋግጥ እና ግባ' : 'Verify & Continue'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Countdown */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={[styles.countdownText, { color: colors.textMuted }]}>
              {isAmharic ? `በድጋሚ ለመላክ ${countdown} ሰከንድ ይጠብቁ` : `Resend code in ${countdown}s`}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendBtn}>
              {resending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.resendBtnText, { color: colors.primary }]}>
                  {isAmharic ? 'ኮዱን በድጋሚ ላክ' : 'Resend OTP Code'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  shieldIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  otpInput: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 24,
  },
  verifyBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendRow: {
    marginTop: 10,
  },
  countdownText: {
    fontSize: 13,
  },
  resendBtn: {
    padding: 6,
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
