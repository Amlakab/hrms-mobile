import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';

export const SecurityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();
  const { user } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        isAmharic ? 'ማስጠንቀቂያ' : 'Validation',
        isAmharic ? 'እባክዎ ሁሉንም የይለፍ ቃል ሳጥኖች ይሙሉ' : 'Please fill in all password fields'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        isAmharic ? 'አዲሱ የይለፍ ቃል ከተረጋገጠው ጋር አይመሳሰልም' : 'New passwords do not match'
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        isAmharic ? 'የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት' : 'Password must be at least 6 characters'
      );
      return;
    }

    try {
      setSavingPassword(true);
      await api.put('/user/change-password', {
        currentPassword,
        newPassword,
      });

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        isAmharic ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል' : 'Your password has been updated successfully'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'የይለፍ ቃል መቀየር አልተቻለም' : 'Failed to change password')
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'ደህንነት እና ጥበቃ' : 'Security & Access Control'}
        subtitle={isAmharic ? 'የይለፍ ቃል መቀየር እና የመለያ ጥበቃ ማስተካከያ' : 'Password encryption, 2FA & active sessions'}
        showBack={true}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainTabs');
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security Shield Banner */}
        <View style={[styles.shieldBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.shieldIconBox, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.shieldTitle, { color: colors.text }]}>
              {isAmharic ? 'የመለያዎ ደህንነት ደረጃ፡ ከፍተኛ' : 'Account Security Status: High'}
            </Text>
            <Text style={[styles.shieldSubtitle, { color: colors.textMuted }]}>
              {user?.phone || user?.email} • {user?.role?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Change Password Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="key-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {isAmharic ? 'የይለፍ ቃል ቀይር' : 'Change Password'}
            </Text>
          </View>

          {/* Current Password */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {isAmharic ? 'የአሁኑ የይለፍ ቃል *' : 'Current Password *'}
          </Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <TextInput
              style={[styles.inputField, { color: colors.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Ionicons
                name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {isAmharic ? 'አዲስ የይለፍ ቃል *' : 'New Password *'}
          </Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <TextInput
              style={[styles.inputField, { color: colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Ionicons
                name={showNew ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {isAmharic ? 'አዲሱን የይለፍ ቃል ያረጋግጡ *' : 'Confirm New Password *'}
          </Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <TextInput
              style={[styles.inputField, { color: colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handlePasswordChange}
            disabled={savingPassword}
          >
            {savingPassword ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>
                  {isAmharic ? 'የይለፍ ቃል አድስ' : 'Update Password'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 2FA & Biometric Security Options */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {isAmharic ? 'ባለ ሁለት ደረጃ ማረጋገጫ (2FA)' : 'Two-Factor Authentication & Biometrics'}
            </Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                {isAmharic ? 'የጣት አሻራ / የፊት መለያ (Biometrics)' : 'Biometric Fingerprint / Face ID'}
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
                {isAmharic ? 'በጣት አሻራ በፍጥነት ወደ መተግበሪያው ይግቡ' : 'Sign in rapidly using device hardware biometric keys'}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                {isAmharic ? 'የኤስኤምኤስ ኮድ ማረጋገጫ (SMS OTP)' : 'SMS OTP Verification'}
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
                {isAmharic ? 'በእያንዳንዱ መግቢያ ላይ የማረጋገጫ ኮድ በስልክ ይላካል' : 'Require one-time passcode for critical financial actions'}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Active Sessions */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {isAmharic ? 'ንቁ መሣሪያዎች' : 'Active Devices & Sessions'}
            </Text>
          </View>

          <View style={styles.deviceRow}>
            <View style={[styles.deviceIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="phone-portrait" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.deviceName, { color: colors.text }]}>
                  Android App Client
                </Text>
                <View style={[styles.currentBadge, { backgroundColor: '#10B98115' }]}>
                  <Text style={styles.currentBadgeText}>
                    {isAmharic ? 'የአሁኑ' : 'CURRENT'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.deviceMeta, { color: colors.textMuted }]}>
                Addis Ababa, Ethiopia • {new Date().toLocaleDateString()}
              </Text>
            </View>
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.lg,
  },
  shieldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  shieldIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  shieldSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: spacing.xs,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 46,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  deviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 13,
    fontWeight: '700',
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  currentBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  deviceMeta: {
    fontSize: 11,
    marginTop: 2,
  },
});
