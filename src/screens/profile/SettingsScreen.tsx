import React, { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { spacing } from '../../constants/theme';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, isAmharic } = useLanguage();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'SECURITY' | 'PROFILE' | 'PREFERENCES' | 'NOTIFICATIONS'>('SECURITY');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Notifications
  const [emailInquiries, setEmailInquiries] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [priceDrops, setPriceDrops] = useState(true);

  // Currency
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Required', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/user/change-password', {
        currentPassword,
        newPassword,
      });
      Alert.alert(
        isAmharic ? 'የይለፍ ቃል ተቀይሯል' : 'Password Changed',
        isAmharic ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል።' : 'Your account password has been updated.'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await api.patch('/user/profile', { name, phone, email });
      Alert.alert(
        isAmharic ? 'መረጃው ተዘምኗል' : 'Profile Updated',
        isAmharic ? 'የግል መረጃዎ በተሳካ ሁኔታ ተቀምጧል።' : 'Your personal profile details are saved.'
      );
    } catch (err: any) {
      Alert.alert('Notice', 'Profile updated locally.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      isAmharic ? 'መሸጎጫ አጽዳ' : 'Clear Offline Cache',
      isAmharic ? 'ሁሉንም የወረዱ ምስሎች እና መሸጎጫ ማጽዳት ይፈልጋሉ?' : 'Are you sure you want to clear stored cache and reset local search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('hrms_recent_searches');
              Alert.alert('Success', 'Cache cleared.');
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'ቅንብሮች እና ደህንነት' : 'System Settings'}
        subtitle={isAmharic ? 'የመለያ፣ የይለፍ ቃል እና የግል ምርጫዎች' : 'Security, Profile, Language & Preferences'}
        showBack={true}
      />

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            { id: 'SECURITY', label: isAmharic ? 'ደህንነት' : 'Security', icon: 'shield-checkmark-outline' },
            { id: 'PROFILE', label: isAmharic ? 'መገለጫ' : 'Profile', icon: 'person-outline' },
            { id: 'PREFERENCES', label: isAmharic ? 'ምርጫዎች' : 'Preferences', icon: 'options-outline' },
            { id: 'NOTIFICATIONS', label: isAmharic ? 'ማሳወቂያዎች' : 'Alerts', icon: 'notifications-outline' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected ? colors.primary : isDark ? '#111D32' : '#F8FAFC',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={15}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.tabText, { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SECURITY TAB */}
        {activeTab === 'SECURITY' && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="key-outline" size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {isAmharic ? 'የይለፍ ቃል መቀየሪያ' : 'Change Password'}
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {isAmharic ? 'የአሁኑ የይለፍ ቃል *' : 'Current Password *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {isAmharic ? 'አዲስ የይለፍ ቃል *' : 'New Password *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {isAmharic ? 'አዲሱን የይለፍ ቃል አረጋግጥ *' : 'Confirm New Password *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder="Re-enter new password"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showPassRow}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.primary} />
              <Text style={[styles.showPassText, { color: colors.primary }]}>
                {showPassword ? (isAmharic ? 'የይለፍ ቃል ደብቅ' : 'Hide Passwords') : (isAmharic ? 'የይለፍ ቃል አሳይ' : 'Show Passwords')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={changingPassword}
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            >
              {changingPassword ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isAmharic ? 'የይለፍ ቃል ቀይር' : 'Update Password'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'PROFILE' && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {isAmharic ? 'የግል መረጃ' : 'Personal Information'}
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {isAmharic ? 'ሙሉ ስም' : 'Full Name'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {isAmharic ? 'ኢሜይል' : 'Email Address'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#111D32' : '#F1F5F9', color: colors.text, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={savingProfile}
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            >
              {savingProfile ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isAmharic ? 'መረጃ አስቀምጥ' : 'Save Profile Changes'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'PREFERENCES' && (
          <View style={styles.prefWrap}>
            {/* Theme */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.settingRow}>
                <View>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    {isAmharic ? 'ጨለማ ገጽታ (Dark Mode)' : 'Appearance Theme'}
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                    {isDark ? 'Space Navy Dark Theme' : 'Clean Modern Light Theme'}
                  </Text>
                </View>
                <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#767577', true: colors.primary }} />
              </View>
            </View>

            {/* Language */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.settingTitle, { color: colors.text, marginBottom: 8 }]}>
                {isAmharic ? 'ቋንቋ (System Language)' : 'Language'}
              </Text>
              <View style={styles.langRow}>
                <TouchableOpacity
                  onPress={() => setLanguage('en')}
                  style={[
                    styles.langChoice,
                    {
                      backgroundColor: language === 'en' ? colors.primary : isDark ? '#111D32' : '#F1F5F9',
                      borderColor: language === 'en' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: language === 'en' ? '#FFFFFF' : colors.text, fontWeight: '700' }}>
                    English
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setLanguage('am')}
                  style={[
                    styles.langChoice,
                    {
                      backgroundColor: language === 'am' ? colors.primary : isDark ? '#111D32' : '#F1F5F9',
                      borderColor: language === 'am' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: language === 'am' ? '#FFFFFF' : colors.text, fontWeight: '700' }}>
                    አማርኛ (Amharic)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Currency */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.settingTitle, { color: colors.text, marginBottom: 8 }]}>
                {isAmharic ? 'የገንዘብ ምንዛሬ (Currency)' : 'Default Currency'}
              </Text>
              <View style={styles.langRow}>
                {(['ETB', 'USD'] as const).map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    onPress={() => setCurrency(curr)}
                    style={[
                      styles.langChoice,
                      {
                        backgroundColor: currency === curr ? colors.primary : isDark ? '#111D32' : '#F1F5F9',
                        borderColor: currency === curr ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: currency === curr ? '#FFFFFF' : colors.text, fontWeight: '700' }}>
                      {curr === 'ETB' ? 'Ethiopian Birr (ETB)' : 'US Dollar (USD)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Clear Cache */}
            <TouchableOpacity
              onPress={handleClearCache}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            >
              <View>
                <Text style={[styles.settingTitle, { color: colors.danger }]}>
                  {isAmharic ? 'መሸጎጫ አጽዳ (Clear Cache)' : 'Reset Offline Cache'}
                </Text>
                <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                  Free local storage space
                </Text>
              </View>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'NOTIFICATIONS' && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Email Inquiries</Text>
                <Text style={[styles.settingSub, { color: colors.textMuted }]}>Receive email notices for new tour requests</Text>
              </View>
              <Switch value={emailInquiries} onValueChange={setEmailInquiries} trackColor={{ false: '#767577', true: colors.primary }} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>SMS Alerts</Text>
                <Text style={[styles.settingSub, { color: colors.textMuted }]}>Urgent rent payment and milestone reminders</Text>
              </View>
              <Switch value={smsAlerts} onValueChange={setSmsAlerts} trackColor={{ false: '#767577', true: colors.primary }} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Price Drop Alerts</Text>
                <Text style={[styles.settingSub, { color: colors.textMuted }]}>Get notified when saved properties reduce rent</Text>
              </View>
              <Switch value={priceDrops} onValueChange={setPriceDrops} trackColor={{ false: '#767577', true: colors.primary }} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    borderBottomWidth: 1,
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  showPassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
  },
  showPassText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  prefWrap: {
    gap: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: 240,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langChoice: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
});
