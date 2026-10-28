import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import { CURRENT_API_BASE_URL, updateApiBaseUrl } from '../../config/api';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, isAmharic, toggleLanguage } = useLanguage();
  const { user, logout, isAdmin, isOwner, isAgent, isManager } = useAuth();

  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(CURRENT_API_BASE_URL);

  const handleSaveServerUrl = async () => {
    try {
      await updateApiBaseUrl(serverUrlInput);
      setIsServerModalOpen(false);
      Alert.alert(
        isAmharic ? 'ተቀይሯል' : 'Updated',
        isAmharic ? 'የሰርቨር አድራሻ ተቀይሯል።' : 'Backend server URL has been updated.'
      );
    } catch {
      Alert.alert('Error', 'Failed to update server URL');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      isAmharic ? 'ከመለያ መውጣት' : 'Sign Out',
      isAmharic ? 'እርግጠኛ ነዎት ከመለያዎ መውጣት ይፈልጋሉ?' : 'Are you sure you want to sign out?',
      [
        { text: isAmharic ? 'ሰርዝ' : 'Cancel', style: 'cancel' },
        {
          text: isAmharic ? 'ውጣ' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የግል መለያ' : 'Profile & Settings'}
        subtitle={isAmharic ? 'የተጠቃሚ መረጃ እና ምርጫዎች' : 'Account governance and preferences'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={32} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || (isAmharic ? 'ተጠቃሚ' : 'HRMS User')}
            </Text>
            <Text style={[styles.userContact, { color: colors.textMuted }]}>
              {user?.phone || 'No phone registered'}
            </Text>
            {user?.email ? (
              <Text style={[styles.userContact, { color: colors.textMuted }]}>{user.email}</Text>
            ) : null}

            <View style={{ marginTop: 6 }}>
              <Badge
                label={(user?.role || 'customer').toUpperCase()}
                variant={isAdmin ? 'error' : isOwner || isAgent ? 'primary' : 'success'}
                size="sm"
              />
            </View>
          </View>
        </View>

        {/* Admin / Host Panel Shortcuts (Role-based) */}
        {(isAdmin || isManager) && (
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isAmharic ? 'የአስተዳደር ክፍል' : 'Administration & Governance'}
            </Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('AdminDashboard')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የአስተዳዳሪ ዳሽቦርድ' : 'Admin Metrics Dashboard'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('ApproveHouses')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'ቤቶችን የማጽደቅ ክፍል' : 'Listing Approval Queue'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('AdminUsers')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="people-outline" size={20} color="#8B5CF6" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የተጠቃሚዎች አስተዳደር' : 'User Governance & Roles'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('AdminTransactions')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="cash-outline" size={20} color="#06B6D4" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የክፍያ እና ዝውውር መዝገብ' : 'Escrow Ledger & Approvals'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('LoanTracker')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="wallet-outline" size={20} color="#F59E0B" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የብድር እና ዕዳ መዝገብ' : 'Property Loan Tracker'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('AdminWorkflows')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="git-network-outline" size={20} color="#38BDF8" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የስራ ሂደቶች አስተዳደር' : 'Workflow Governance (Bids & Leases)'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('TransactionReports')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="bar-chart-outline" size={20} color="#10B981" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የግብይት ሪፖርቶች እና ኦዲት' : 'Financial & Transaction Reports'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Accountants')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="business-outline" size={20} color="#F59E0B" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የባንክ እና የሂሳብ አካውንቶች' : 'Accountant & Bank Profiles'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('QRCode')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="qr-code-outline" size={20} color="#EC4899" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የQR ኮድ እና ማጋሪያ ማዕከል' : 'Platform & Property QR Hub'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('FeedbackManager')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="mail-unread-outline" size={20} color="#EF4444" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'አስተያየቶች እና ቅሬታዎች' : 'Customer Inquiries & Feedback'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Owner / Agent Shortcuts */}
        {(isOwner || isAgent) && (
          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isAmharic ? 'የባለቤት እና የደላላ ክፍል' : 'Host & Agent Controls'}
            </Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('MyListings')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="business-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'የእኔ ንብረቶች አስተዳደር' : 'Manage My Listings'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('CreateHouse')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="add-circle-outline" size={20} color="#8B5CF6" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isAmharic ? 'አዲስ ቤት መዝግብ' : 'Add New Property'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Platform Shortcuts & Company Info */}
        <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isAmharic ? 'ተጨማሪ አገልግሎቶች' : 'Discovery & Company'}
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('CustomerPortal')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'የተሟላ የደንበኛ ፖርታል' : 'Customer Tenancy Portal'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('CustomerPayments')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="receipt-outline" size={20} color="#10B981" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'የክፍያ ታሪክ እና ደረሰኞች' : 'Payment History & Receipts'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('MapSearch')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="map-outline" size={20} color="#06B6D4" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'በካርታ ይፈልጉ' : 'Interactive Map Search'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Resources')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="library-outline" size={20} color="#8B5CF6" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'የደህንነት ሰነዶች እና ቪዲዮዎች' : 'Knowledge & Video Academy'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="settings-outline" size={20} color="#F59E0B" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'የመለያ ቅንብሮች እና ደህንነት' : 'Security & Account Settings'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Services')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cube-outline" size={20} color="#8B5CF6" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'የምንሰጣቸው አገልግሎቶች' : 'Our Services'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={20} color="#10B981" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'ስለ HRMS' : 'About Platform'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Contact')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="call-outline" size={20} color="#F59E0B" />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'ያግኙን' : 'Contact Support'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isAmharic ? 'ምርጫዎች' : 'Preferences'}
          </Text>

          {/* Theme switch */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={isDark ? '#38BDF8' : '#F59E0B'}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isDark ? (isAmharic ? 'ጨለማ ገጽታ' : 'Dark Mode') : isAmharic ? 'ብርሃን ገጽታ' : 'Light Mode'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Language toggle */}
          <TouchableOpacity style={styles.settingItem} onPress={toggleLanguage}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'ቋንቋ (Language)' : 'Language'}
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.primary }]}>
              {language === 'am' ? 'አማርኛ' : 'English'}
            </Text>
          </TouchableOpacity>

          {/* Backend Server URL Config */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setIsServerModalOpen(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="server-outline" size={20} color={colors.textMuted} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isAmharic ? 'የሰርቨር አድራሻ (API Host)' : 'Backend API Host'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.error }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            {isAmharic ? 'ከመለያ ውጣ' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Server URL Config Modal */}
      <Modal
        visible={isServerModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsServerModalOpen(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.modalBg }]}>
            <Text style={[styles.modalCardTitle, { color: colors.text }]}>
              {isAmharic ? 'የጀርባ ሰርቨር አድራሻ ይቀይሩ' : 'Backend Server URL'}
            </Text>
            <Text style={[styles.modalCardDesc, { color: colors.textMuted }]}>
              {isAmharic
                ? 'በእውነተኛ ስልክ ሲፈትሹ የኮምፒዩተርዎን Wi-Fi IP (ምሳሌ፡ http://192.168.1.10:3001/api) ያስገቡ።'
                : 'For physical phone testing on Expo Go, set your computer LAN IP (e.g. http://192.168.1.100:3001/api).'}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={serverUrlInput}
              onChangeText={setServerUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: colors.border }]}
                onPress={() => setIsServerModalOpen(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnSave, { backgroundColor: colors.primary }]}
                onPress={handleSaveServerUrl}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...typography.h3,
  },
  userContact: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionBox: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  modalCardTitle: {
    ...typography.h3,
    marginBottom: 6,
  },
  modalCardDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  modalInput: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtnCancel: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnSave: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
