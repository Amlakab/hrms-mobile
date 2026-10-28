
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing } from '../../constants/theme';
import { Role, MenuDoc } from '../../types';
import api from '../../config/api';
import { extractArray } from '../../utils/apiData';

interface DynamicMenuItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

export const PortalScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user, logout } = useAuth();

  const [menus, setMenus] = useState<DynamicMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Use primitive dependencies instead of the entire user object.
  // This prevents unnecessary menu reloads when the auth context
  // creates a new user object with unchanged identity and permissions.
  const userRole: Role = (user?.role as Role) || 'customer';

  const permissionKey = (user?.permissions || [])
    .map((p: any) =>
      String(typeof p === 'object' ? p?._id ?? p?.id ?? '' : p ?? '')
    )
    .filter(Boolean)
    .join('|');

  const mapHrefToRoute = useCallback(
    (href: string, name: string, role: Role): string => {
      const trimmedHref = (href || '').trim();
      const KNOWN_STACK_ROUTES = new Set([
        'AdminDashboard', 'AdminUsers', 'AdminAgents', 'AdminMenus', 'AdminHouses',
        'ApproveHouses', 'AdminWorkflows', 'AdminTransactions', 'ApproveTransactions',
        'TransactionReports', 'Feedback', 'FeedbackManager', 'QRCode', 'Accountants',
        'LoanTracker', 'Calculator', 'Security', 'MyListings', 'CreateHouse', 'EditHouse',
        'Orders', 'CustomerPortal', 'CustomerPayments', 'Favorites', 'ChatList', 'ChatDetail',
        'Wallet', 'Profile', 'Settings', 'Explore', 'Map', 'Home'
      ]);

      if (KNOWN_STACK_ROUTES.has(trimmedHref)) {
        return trimmedHref;
      }

      const h = (href || '').toLowerCase().trim();
      const n = (name || '').toLowerCase().trim();

      // Specific approvals and transactions
      if (
        h.includes('/admin/transactions/approve') ||
        n.includes('approve transaction')
      )
        return 'ApproveTransactions';

      // Agents
      if (h.includes('/admin/agents') || n.includes('agent'))
        return 'AdminAgents';

      // Calculator
      if (h.includes('/admin/calculator') || n.includes('calculator'))
        return 'Calculator';

      // Security
      if (h.includes('/admin/security') || n === 'security')
        return 'Security';

      // Customer payments (MUST come before generic /admin/payments)
      if (
        h.includes('/admin/customer/payments') ||
        h.includes('customerpayments') ||
        n.includes('my payment') ||
        n.includes('customer payment') ||
        (n.includes('payment') && ['customer', 'user'].includes(role))
      )
        return 'CustomerPayments';

      // Accounts / Accountants (generic payments)
      if (
        h.includes('/admin/accountants') ||
        h.includes('/admin/payments') ||
        n.includes('accountant') ||
        n.includes('accounts')
      )
        return 'Accountants';

      // Menus
      if (h.includes('/admin/menus') || n.includes('menu'))
        return 'AdminMenus';

      // Dashboard
      if (
        h.includes('/admin/dashboard') ||
        (h === '/' && role === 'admin') ||
        n.includes('dashboard')
      )
        return 'AdminDashboard';

      // Users
      if (h.includes('/admin/users') || n === 'users' || n.includes('user'))
        return 'AdminUsers';

      // Approve house
      if (
        h.includes('/admin/manager/houses') ||
        h.includes('/admin/approve-houses') ||
        n.includes('approve house')
      )
        return 'ApproveHouses';

      // Houses / All properties
      if (
        h.includes('/admin/houses') ||
        n.includes('all properties') ||
        (n === 'house' && ['admin', 'owner', 'agent'].includes(role))
      )
        return 'AdminHouses';

      // Workflows
      if (
        h.includes('/admin/workflows') ||
        h.includes('/admin/manager/workflows') ||
        n.includes('workflow')
      )
        return 'AdminWorkflows';

      // Completed Transactions
      if (h.includes('/admin/transactions') || n.includes('transaction'))
        return 'AdminTransactions';

      // Reports
      if (h.includes('/admin/reports') || n.includes('report'))
        return 'TransactionReports';

      // Feedback
      if (h.includes('/admin/feedback') || n.includes('feedback'))
        return 'Feedback';

      // QR Code
      if (h.includes('/admin/qrcode') || n.includes('qr'))
        return 'QRCode';

      // Loan tracker
      if (h.includes('/admin/loan') || n.includes('loan'))
        return 'LoanTracker';

      // Orders
      if (
        h.includes('/admin/customer/orders') ||
        h.includes('/customer/orders') ||
        h.includes('/admin/manager/orders') ||
        n.includes('order')
      )
        return 'Orders';

      // Customer Portal
      if (
        h.includes('/admin/customer') ||
        n.includes('customer portal') ||
        n.includes('application')
      )
        return 'CustomerPortal';

      // Messages
      if (
        h.includes('/admin/manager/messages') ||
        h.includes('/messages') ||
        n.includes('message')
      )
        return 'ChatList';

      // Wallet
      if (
        h.includes('/admin/wallet') ||
        h.includes('/wallet') ||
        n.includes('wallet')
      )
        return 'Wallet';

      // Settings
      if (
        h.includes('/admin/settings') ||
        h.includes('/settings') ||
        n.includes('setting')
      )
        return 'Settings';

      // Public Houses / Explore
      if (
        h.includes('/public/houses') ||
        n.includes('explore') ||
        (n === 'houses' && ['customer', 'user'].includes(role))
      )
        return 'Explore';

      if (h.includes('/public/map') || n.includes('map'))
        return 'Map';

      if (
        h.includes('/owner/houses/create') ||
        n.includes('add property') ||
        n.includes('create house')
      )
        return 'CreateHouse';

      if (
        h.includes('/owner/houses') ||
        n.includes('my listing') ||
        n.includes('my properties')
      )
        return 'MyListings';

      if (
        h.includes('/favorites') ||
        n.includes('favorite') ||
        n.includes('saved')
      )
        return 'Favorites';

      return 'Settings';
    },
    []
  );

  const resolveMenuVisuals = useCallback(
    (
      iconName: string,
      name: string
    ): { icon: string; color: string; desc: string } => {
      const i = (iconName || '').toLowerCase();
      const n = (name || '').toLowerCase();

      if (n.includes('agent'))
        return {
          icon: 'briefcase-outline',
          color: '#10B981',
          desc: isAmharic
            ? 'የተመሰከረላቸው የሪል እስቴት ወኪሎች እና ደላሎች'
            : 'Certified agents, broker network & licenses',
        };

      if (n.includes('calculator'))
        return {
          icon: 'calculator-outline',
          color: '#8B5CF6',
          desc: isAmharic
            ? 'የወርሃዊ ብድር እና የወለድ ተመን ማስያ'
            : 'Calculate mortgage payments & interest rates',
        };

      if (n.includes('security'))
        return {
          icon: 'shield-checkmark-outline',
          color: '#EF4444',
          desc: isAmharic
            ? 'የይለፍ ቃል መቀየር እና የመለያ ደህንነት'
            : 'Password security, 2FA & active sessions',
        };

      if (n.includes('approve transaction'))
        return {
          icon: 'checkmark-done-circle-outline',
          color: '#10B981',
          desc: isAmharic
            ? 'የቀረቡ ክፍያዎችን ይገምግሙ እና ያጽድቁ'
            : 'Review & authorize pending escrow deposits',
        };

      if (
        i.includes('stats') ||
        i.includes('dashboard') ||
        n.includes('dashboard')
      )
        return {
          icon: 'stats-chart-outline',
          color: '#3B82F6',
          desc: isAmharic
            ? 'የስርዓት አጠቃላይ እይታ እና ሪፖርት'
            : 'Real-time metrics, growth charts & summary',
        };

      if (i.includes('people') || i.includes('user') || n.includes('user'))
        return {
          icon: 'people-outline',
          color: '#8B5CF6',
          desc: isAmharic
            ? 'የተጠቃሚዎች አካውንት እና ፍቃዶች'
            : 'Manage user accounts, roles & permissions',
        };

      if (i.includes('layer') || n.includes('menu'))
        return {
          icon: 'layers-outline',
          color: '#0EA5E9',
          desc: isAmharic
            ? 'የስርዓት ምናሌዎችን እና ፍቃዶችን ይቆጣጠሩ'
            : 'Configure sidebar & role menu permissions',
        };

      if (i.includes('check') || n.includes('approve'))
        return {
          icon: 'checkmark-circle-outline',
          color: '#F59E0B',
          desc: isAmharic
            ? 'አዲስ የቀረቡ ቤቶችን ይገምግሙ'
            : 'Review property submissions for approval',
        };

      if (
        i.includes('git') ||
        i.includes('workflow') ||
        n.includes('workflow')
      )
        return {
          icon: 'git-network-outline',
          color: '#06B6D4',
          desc: isAmharic
            ? 'የኪራይ ማመልከቻዎች እና ውሎች'
            : 'Rental applications, leases & requests',
        };

      if (
        i.includes('swap') ||
        i.includes('transaction') ||
        n.includes('transaction')
      )
        return {
          icon: 'swap-horizontal-outline',
          color: '#10B981',
          desc: isAmharic
            ? 'የገንዘብ ዝውውሮች እና ማረጋገጫዎች'
            : 'Inspect deposits, payouts & bank transfers',
        };

      if (i.includes('bar') || i.includes('report') || n.includes('report'))
        return {
          icon: 'bar-chart-outline',
          color: '#6366F1',
          desc: isAmharic
            ? 'የፋይናንስ ኦዲት እና ገቢ ሪፖርቶች'
            : 'Audit sheets and revenue analytics',
        };

      if (
        i.includes('chat') ||
        i.includes('message') ||
        n.includes('message') ||
        n.includes('feedback')
      )
        return {
          icon: 'chatbubbles-outline',
          color: '#EC4899',
          desc: isAmharic
            ? 'ቀጥታ መልዕክቶች እና አስተያየቶች'
            : 'Direct messages & customer reviews',
        };

      if (i.includes('qr') || n.includes('qr'))
        return {
          icon: 'qr-code-outline',
          color: '#14B8A6',
          desc: isAmharic
            ? 'ፈጣን የንብረት QR ኮድ ማመንጫ'
            : 'Property link & check-in QR codes',
        };

      if (
        i.includes('calc') ||
        n.includes('accountant') ||
        n.includes('loan')
      )
        return {
          icon: 'calculator-outline',
          color: '#F97316',
          desc: isAmharic
            ? 'የብድር እና የሂሳብ ማስያ'
            : 'Loan calculations & ledger reconciliation',
        };

      if (i.includes('wallet') || n.includes('wallet'))
        return {
          icon: 'wallet-outline',
          color: '#10B981',
          desc: isAmharic
            ? 'የገንዘብ ቦርሳ እና ቀሪ ሒሳብ'
            : 'Wallet balance, deposits & withdrawals',
        };

      if (
        i.includes('receipt') ||
        i.includes('doc') ||
        n.includes('payment') ||
        n.includes('order')
      )
        return {
          icon: 'receipt-outline',
          color: '#3B82F6',
          desc: isAmharic
            ? 'የክፍያ ደረሰኞች እና ትዕዛዞች'
            : 'Payment receipts, invoices & orders',
        };

      if (
        i.includes('heart') ||
        n.includes('saved') ||
        n.includes('favorite')
      )
        return {
          icon: 'heart-outline',
          color: '#EF4444',
          desc: isAmharic
            ? 'የተወደዱ እና የተቀመጡ ቤቶች'
            : 'Access your saved properties',
        };

      if (
        i.includes('settings') ||
        i.includes('shield') ||
        n.includes('setting')
      )
        return {
          icon: 'settings-outline',
          color: '#64748B',
          desc: isAmharic
            ? 'የመለያ እና የቋንቋ ምርጫዎች'
            : 'Profile, language, theme & password',
        };

      return {
        icon: 'business-outline',
        color: '#10B981',
        desc: isAmharic
          ? 'የንብረት ዝርዝሮች እና አስተዳደር'
          : 'View, edit and manage properties',
      };
    },
    [isAmharic]
  );

  const translateMenuName = (name: string): string => {
    if (!isAmharic) return name;

    const lower = name.toLowerCase();

    if (lower.includes('dashboard') || lower === 'home')
      return 'ዳሽቦርድ';
    if (lower.includes('user')) return 'ተጠቃሚዎች';
    if (lower.includes('house') || lower.includes('propert'))
      return 'ቤቶች';
    if (lower.includes('approve')) return 'ቤቶችን አጽድቅ';
    if (lower.includes('transaction')) return 'የገንዘብ ዝውውሮች';
    if (lower.includes('order')) return 'ትዕዛዞች';
    if (lower.includes('message')) return 'መልዕክቶች';
    if (lower.includes('workflow')) return 'የስራ ሂደቶች';
    if (lower.includes('report')) return 'ሪፖርቶች';
    if (lower.includes('wallet')) return 'የገንዘብ ቦርሳ';
    if (lower.includes('menu')) return 'የምናሌ አስተዳደር';
    if (lower.includes('qrcode') || lower.includes('qr'))
      return 'የQR ኮድ';
    if (lower.includes('feedback')) return 'አስተያየቶች';
    if (lower.includes('loan')) return 'ብድር';
    if (lower.includes('accountant') || lower.includes('account'))
      return 'የሂሳብ ሹሞች';
    if (lower.includes('setting')) return 'ቅንብሮች';
    if (lower.includes('payment')) return 'ክፍያዎች';
    if (lower.includes('customer')) return 'የደንበኛ ክፍል';

    return name;
  };

  // Load menus using stable role/permission values.
  // No profile fetch here: that could update auth state and retrigger
  // this effect repeatedly.
  const loadDatabaseMenus = useCallback(
    async (showLoader = false) => {
      if (showLoader) {
        setLoading(true);
      }

      setLoadError(false);

      try {
        const res = await api.get('/menu?type=mobile');
        const allDbMenus: MenuDoc[] = extractArray<MenuDoc>(
          res,
          'menus'
        );

        const permissionIds = new Set(
          permissionKey ? permissionKey.split('|') : []
        );

        // Ensure only mobile menus are displayed in mobile portal
        const mobileOnlyMenus = allDbMenus.filter(
          (m) => m.type === 'mobile' || !m.type
        );

        let visible: MenuDoc[];

        if (userRole === 'admin') {
          visible = mobileOnlyMenus
            .filter(
              (m) =>
                m.isActive !== false &&
                (m.allowedRoles || []).includes('admin')
            )
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        } else {
          visible = mobileOnlyMenus
            .filter(
              (m) =>
                m.isActive !== false &&
                (m.allowedRoles || []).includes(userRole) &&
                (
                  permissionIds.size === 0 ||
                  permissionIds.has(String(m._id))
                )
            )
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }

        const mapped: DynamicMenuItem[] = visible.map((m) => {
          const visuals = resolveMenuVisuals(m.icon, m.name);

          return {
            id: String(m._id),
            name: m.name,
            href: m.href,
            icon: visuals.icon,
            route: mapHrefToRoute(m.href, m.name, userRole),
            color: visuals.color,
            description: visuals.desc,
          };
        });

        setMenus(mapped);
      } catch (err: any) {
        console.warn(
          'Failed to load portal menus:',
          err?.response?.data || err?.message || err
        );

        setLoadError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      userRole,
      permissionKey,
      mapHrefToRoute,
      resolveMenuVisuals,
    ]
  );

  // Run only when the role, permission IDs, language-dependent
  // descriptions, or other actual menu-loading dependencies change.
  useEffect(() => {
    void loadDatabaseMenus(true);
  }, [loadDatabaseMenus]);

  const onRefresh = useCallback(() => {
    if (refreshing) return;

    setRefreshing(true);
    void loadDatabaseMenus(false);
  }, [refreshing, loadDatabaseMenus]);

  const getPortalTitle = () => {
    switch (userRole) {
      case 'admin':
        return isAmharic ? 'የአስተዳዳሪ ክፍል' : 'Admin Panel';
      case 'owner':
        return isAmharic ? 'የባለቤት ክፍል' : 'Owner Panel';
      case 'manager':
        return isAmharic ? 'የስራ አስኪያጅ ክፍል' : 'Manager Panel';
      case 'accountant':
        return isAmharic ? 'የሂሳብ ክፍል' : 'Accountant Panel';
      case 'agent':
        return isAmharic ? 'የወኪል ክፍል' : 'Agent Panel';
      default:
        return isAmharic ? 'የደንበኛ ክፍል' : 'Customer Portal';
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          text: '#EF4444',
        };
      case 'owner':
        return {
          bg: 'rgba(139, 92, 246, 0.15)',
          text: '#8B5CF6',
        };
      case 'manager':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          text: '#3B82F6',
        };
      case 'accountant':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          text: '#F59E0B',
        };
      case 'agent':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          text: '#10B981',
        };
      default:
        return {
          bg: 'rgba(14, 165, 233, 0.15)',
          text: '#0EA5E9',
        };
    }
  };

  const handleLogout = () => {
    Alert.alert(
      isAmharic ? 'ውጣ' : 'Sign Out',
      isAmharic
        ? 'እርግጠኛ ነዎት ከመለያዎ መውጣት ይፈልጋሉ?'
        : 'Are you sure you want to sign out?',
      [
        {
          text: isAmharic ? 'ይቅር' : 'Cancel',
          style: 'cancel',
        },
        {
          text: isAmharic ? 'አዎ ውጣ' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.warn('Logout failed:', err);
            }
          },
        },
      ]
    );
  };

  const roleBadgeStyle = getRoleBadgeColor();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Header
        title={getPortalTitle()}
        subtitle={
          isAmharic
            ? 'በፈቃድዎ መሰረት የተፈቀዱ አገልግሎቶች'
            : 'Database-synced role portal & modules'
        }
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* User profile */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {(user?.name || user?.email || 'U')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={[styles.userName, { color: colors.text }]}
              numberOfLines={1}
            >
              {user?.name ||
                (isAmharic ? 'ተጠቃሚ' : 'User')}
            </Text>

            <Text
              style={[
                styles.userContact,
                { color: colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {user?.phone || user?.email || ''}
            </Text>

            <View
              style={[
                styles.roleBadge,
                { backgroundColor: roleBadgeStyle.bg },
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  { color: roleBadgeStyle.text },
                ]}
              >
                {t(`role.${userRole}`, userRole.toUpperCase())}
              </Text>
            </View>
          </View>
        </View>

        {/* Section title and refresh button */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textMuted },
            ]}
          >
            {isAmharic
              ? 'የተፈቀዱ አገልግሎቶች'
              : 'ALLOWED MODULES'}
          </Text>

          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            style={styles.refreshButton}
          >
            <Ionicons
              name="reload-outline"
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Initial loading only */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text
              style={[
                styles.loadingText,
                { color: colors.textMuted },
              ]}
            >
              {isAmharic
                ? 'ምናሌዎች ከመረጃ ቋቱ በመጫን ላይ...'
                : 'Fetching dynamic portal from database...'}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {menus.length > 0 ? (
              menus.map((item, index) => {
                const isLast = index === menus.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      navigation.navigate(item.route);
                    }}
                    style={[
                      styles.menuItem,
                      !isLast && [
                        styles.menuItemBorder,
                        { borderBottomColor: colors.border },
                      ],
                    ]}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        {
                          backgroundColor: `${item.color}20`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>

                    <View style={styles.menuTextWrap}>
                      <Text
                        style={[
                          styles.menuName,
                          { color: colors.text },
                        ]}
                      >
                        {translateMenuName(item.name)}
                      </Text>

                      <Text
                        style={[
                          styles.menuDesc,
                          { color: colors.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name={
                    loadError
                      ? 'cloud-offline-outline'
                      : 'lock-closed-outline'
                  }
                  size={32}
                  color={colors.textMuted}
                />

                <Text
                  style={[
                    styles.emptyTitle,
                    { color: colors.text },
                  ]}
                >
                  {loadError
                    ? isAmharic
                      ? 'ምናሌዎችን መጫን አልተቻለም'
                      : 'Could Not Load Menus'
                    : isAmharic
                      ? 'ምንም የተፈቀደ አገልግሎት የለም'
                      : 'No Permitted Modules'}
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    { color: colors.textMuted },
                  ]}
                >
                  {loadError
                    ? isAmharic
                      ? 'የኢንተርኔት ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።'
                      : 'Check your connection and try refreshing.'
                    : isAmharic
                      ? 'እባክዎ ፈቃድ እንዲሰጥዎት አስተዳዳሪውን ያነጋግሩ'
                      : 'Please contact your administrator to grant menu access.'}
                </Text>

                {loadError && (
                  <TouchableOpacity
                    onPress={onRefresh}
                    disabled={refreshing}
                    style={[
                      styles.retryButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.retryButtonText}>
                      {isAmharic ? 'እንደገና ሞክር' : 'Try Again'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#EF4444"
          />
          <Text style={styles.logoutText}>
            {t('action.logout', 'Sign Out')}
          </Text>
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
    paddingBottom: spacing.xxxl * 2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userContact: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  refreshButton: {
    padding: 6,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  menuContainer: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuName: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    marginTop: spacing.xl,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
