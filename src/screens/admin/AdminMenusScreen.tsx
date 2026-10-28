import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { extractArray } from '../../utils/apiData';
import { MenuDoc, Role, ALL_ROLES, MenuType } from '../../types';

interface MenuFormData {
  name: string;
  href: string;
  icon: string;
  type: MenuType;
  allowedRoles: Role[];
  order: number;
  isActive: boolean;
}

const AVAILABLE_ICONS = [
  { name: 'Home', icon: 'home-outline' },
  { name: 'Dashboard', icon: 'stats-chart-outline' },
  { name: 'Users', icon: 'people-outline' },
  { name: 'Agents', icon: 'briefcase-outline' },
  { name: 'House', icon: 'business-outline' },
  { name: 'Approve', icon: 'checkmark-circle-outline' },
  { name: 'Workflows', icon: 'git-network-outline' },
  { name: 'Orders', icon: 'document-text-outline' },
  { name: 'Transactions', icon: 'swap-horizontal-outline' },
  { name: 'Reports', icon: 'bar-chart-outline' },
  { name: 'Calculator', icon: 'calculator-outline' },
  { name: 'Feedback', icon: 'chatbubbles-outline' },
  { name: 'QRCode', icon: 'qr-code-outline' },
  { name: 'Accountants', icon: 'wallet-outline' },
  { name: 'Wallet', icon: 'wallet-outline' },
  { name: 'Messages', icon: 'chatbubble-ellipses-outline' },
  { name: 'Settings', icon: 'settings-outline' },
  { name: 'Security', icon: 'shield-checkmark-outline' },
  { name: 'Shield', icon: 'shield-checkmark-outline' },
  { name: 'Layers', icon: 'layers-outline' },
];

export const AdminMenusScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic, t } = useLanguage();

  const [menus, setMenus] = useState<MenuDoc[]>([]);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'mobile' | 'web'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuDoc | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [href, setHref] = useState('');
  const [icon, setIcon] = useState('Home');
  const [menuType, setMenuType] = useState<MenuType>('mobile');
  const [allowedRoles, setAllowedRoles] = useState<Role[]>([]);
  const [order, setOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu?all=true');
      const data = extractArray<MenuDoc>(res, 'menus');
      setMenus(data.sort((a, b) => a.order - b.order));
    } catch (err: any) {
      console.warn('Error fetching menus:', err.message);
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ምናሌዎችን መጫን አልተቻለም' : 'Failed to load menus')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAmharic]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenus();
  };

  const openAdd = () => {
    setName('');
    setHref('');
    setIcon('Home');
    setMenuType('mobile');
    setAllowedRoles(['admin']);
    setOrder(String(menus.length + 1));
    setIsActive(true);
    setIsAddOpen(true);
  };

  const openEdit = (menu: MenuDoc) => {
    setSelectedMenu(menu);
    setName(menu.name);
    setHref(menu.href);
    setIcon(menu.icon || 'Home');
    setMenuType(menu.type || 'web');
    setAllowedRoles(menu.allowedRoles || []);
    setOrder(String(menu.order ?? 0));
    setIsActive(menu.isActive !== false);
    setIsEditOpen(true);
  };

  const toggleRoleSelection = (role: Role) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || !href.trim()) {
      Alert.alert(isAmharic ? 'ማስጠንቀቂያ' : 'Validation', isAmharic ? 'እባክዎ ስም እና ሊንክ ያስገቡ' : 'Please provide name and route URL');
      return;
    }
    if (allowedRoles.length === 0) {
      Alert.alert(isAmharic ? 'ማስጠንቀቂያ' : 'Validation', isAmharic ? 'እባክዎ ቢያንስ አንድ የሚፈቀድ ሚና ይምረጡ' : 'Please select at least one allowed role');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/menu', {
        name: name.trim(),
        href: href.trim(),
        icon,
        type: menuType,
        allowedRoles,
        order: Number(order) || 0,
        isActive,
      });

      Alert.alert(isAmharic ? 'ተሳክቷል' : 'Success', isAmharic ? 'ምናሌው በተሳካ ሁኔታ ተፈጥሯል' : 'Menu created successfully');
      setIsAddOpen(false);
      fetchMenus();
    } catch (err: any) {
      Alert.alert(isAmharic ? 'ስህተት' : 'Error', err.response?.data?.message || 'Failed to create menu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMenu) return;
    if (!name.trim() || !href.trim()) {
      Alert.alert(isAmharic ? 'ማስጠንቀቂያ' : 'Validation', isAmharic ? 'እባክዎ ስም እና ሊንክ ያስገቡ' : 'Please provide name and route URL');
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/menu/${selectedMenu._id}`, {
        name: name.trim(),
        href: href.trim(),
        icon,
        type: menuType,
        allowedRoles,
        order: Number(order) || 0,
        isActive,
      });

      Alert.alert(isAmharic ? 'ተሳክቷል' : 'Success', isAmharic ? 'ምናሌው በተሳካ ሁኔታ ተስተካክሏል' : 'Menu updated successfully');
      setIsEditOpen(false);
      setSelectedMenu(null);
      fetchMenus();
    } catch (err: any) {
      Alert.alert(isAmharic ? 'ስህተት' : 'Error', err.response?.data?.message || 'Failed to update menu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (menu: MenuDoc) => {
    const nextActive = !menu.isActive;
    try {
      await api.put(`/menu/${menu._id}`, { isActive: nextActive });
      setMenus((prev) =>
        prev.map((m) => (m._id === menu._id ? { ...m, isActive: nextActive } : m))
      );
    } catch (err: any) {
      Alert.alert(isAmharic ? 'ስህተት' : 'Error', err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = (menu: MenuDoc) => {
    Alert.alert(
      isAmharic ? 'ምናሌን ሰርዝ' : 'Delete Menu',
      isAmharic
        ? `እርግጠኛ ነዎት "${menu.name}" የተባለውን ምናሌ ማጥፋት ይፈልጋሉ?`
        : `Are you sure you want to delete menu "${menu.name}"? This removes it from all users.`,
      [
        { text: isAmharic ? 'ይቅር' : 'Cancel', style: 'cancel' },
        {
          text: isAmharic ? 'አዎ ሰርዝ' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/menu/${menu._id}`);
              setMenus((prev) => prev.filter((m) => m._id !== menu._id));
            } catch (err: any) {
              Alert.alert(isAmharic ? 'ስህተት' : 'Error', err.response?.data?.message || 'Failed to delete menu');
            }
          },
        },
      ]
    );
  };

  const filteredMenus = menus.filter((m) => {
    if (platformFilter === 'mobile' && m.type !== 'mobile') return false;
    if (platformFilter === 'web' && m.type === 'mobile') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.href.toLowerCase().includes(q) ||
      (m.allowedRoles || []).some((r) => r.toLowerCase().includes(q))
    );
  });

  const resolveIconName = (nameOrIcon: string): any => {
    const found = AVAILABLE_ICONS.find(
      (i) => i.name.toLowerCase() === (nameOrIcon || '').toLowerCase()
    );
    if (found) return found.icon;
    return 'grid-outline';
  };

  const renderFormContent = (isEdit: boolean) => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {isAmharic ? 'የምናሌ ስም *' : 'Menu Name *'}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
        placeholder={isAmharic ? 'ለምሳሌ፡ ዳሽቦርድ' : 'e.g. Dashboard'}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {isAmharic ? 'የመንገድ ሊንክ (Route URL) *' : 'Route Path (URL) *'}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
        placeholder="/admin/dashboard"
        placeholderTextColor={colors.textMuted}
        value={href}
        onChangeText={setHref}
        autoCapitalize="none"
      />

      {/* Platform Target Selector */}
      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {isAmharic ? 'የመድረክ አይነት (Platform Target) *' : 'Platform Target *'}
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <TouchableOpacity
          onPress={() => setMenuType('mobile')}
          style={[
            styles.platformToggleBtn,
            {
              backgroundColor: menuType === 'mobile' ? '#10B981' : colors.surfaceSecondary,
              borderColor: menuType === 'mobile' ? '#10B981' : colors.border,
            },
          ]}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={16}
            color={menuType === 'mobile' ? '#FFFFFF' : colors.text}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: menuType === 'mobile' ? '#FFFFFF' : colors.text,
            }}
          >
            {isAmharic ? 'የሞባይል መተግበሪያ' : 'Mobile App'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMenuType('web')}
          style={[
            styles.platformToggleBtn,
            {
              backgroundColor: menuType === 'web' ? '#3B82F6' : colors.surfaceSecondary,
              borderColor: menuType === 'web' ? '#3B82F6' : colors.border,
            },
          ]}
        >
          <Ionicons
            name="desktop-outline"
            size={16}
            color={menuType === 'web' ? '#FFFFFF' : colors.text}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: menuType === 'web' ? '#FFFFFF' : colors.text,
            }}
          >
            {isAmharic ? 'ድረ-ገጽ (Web)' : 'Web / Desktop'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {isAmharic ? 'ቅደም ተከተል (Order)' : 'Display Order'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="1"
            placeholderTextColor={colors.textMuted}
            value={order}
            onChangeText={setOrder}
            keyboardType="numeric"
          />
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {isAmharic ? 'ሁኔታ (Active)' : 'Active Status'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 46 }}>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
            <Text style={{ fontSize: 13, fontWeight: '600', color: isActive ? '#10B981' : colors.textMuted }}>
              {isActive ? (isAmharic ? 'ንቁ' : 'Active') : (isAmharic ? 'ቦዝኗል' : 'Inactive')}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.fieldLabel, { color: colors.text, marginTop: spacing.sm }]}>
        {isAmharic ? 'አዶ ምረጥ (Select Icon)' : 'Select Icon'}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, paddingVertical: 4 }}>
          {AVAILABLE_ICONS.map((item) => {
            const isSelected = icon === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.iconSelectItem,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setIcon(item.name)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={isSelected ? '#FFFFFF' : colors.text}
                />
                <Text style={{ fontSize: 11, fontWeight: '600', color: isSelected ? '#FFFFFF' : colors.text }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {isAmharic ? 'የሚፈቀድላቸው ሚናዎች (Allowed Roles) *' : 'Allowed Roles *'}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
        {ALL_ROLES.map((r) => {
          const isSelected = allowedRoles.includes(r);
          return (
            <TouchableOpacity
              key={r}
              onPress={() => toggleRoleSelection(r)}
              style={[
                styles.roleSelectChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={16}
                color={isSelected ? '#FFFFFF' : colors.textMuted}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: isSelected ? '#FFFFFF' : colors.text,
                  textTransform: 'capitalize',
                }}
              >
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => {
            if (isEdit) setIsEditOpen(false);
            else setIsAddOpen(false);
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>
            {isAmharic ? 'ይቅር' : 'Cancel'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: colors.primary }]}
          onPress={isEdit ? handleUpdate : handleCreate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
              {isEdit ? (isAmharic ? 'ለውጦችን መዝግብ' : 'Save Changes') : (isAmharic ? 'ፍጠር' : 'Create Menu')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የምናሌ አስተዳደር' : 'Menu Management'}
        subtitle={isAmharic ? 'የጎን አሞሌ እና የተጠቃሚ ፈቃዶችን ያስተዳድሩ' : 'Configure dynamic navigation and permissions'}
        showBack={true}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={openAdd}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>
              {isAmharic ? 'አዲስ ምናሌ' : 'Add'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Platform Filter Tabs */}
      <View style={styles.platformFilterBar}>
        {(
          [
            { id: 'all', label: isAmharic ? 'ሁሉም' : 'All', count: menus.length, icon: 'apps-outline' },
            { id: 'mobile', label: isAmharic ? 'ሞባይል' : 'Mobile', count: menus.filter((m) => m.type === 'mobile').length, icon: 'phone-portrait-outline' },
            { id: 'web', label: isAmharic ? 'ድረ-ገጽ (Web)' : 'Web', count: menus.filter((m) => m.type !== 'mobile').length, icon: 'desktop-outline' },
          ] as const
        ).map((tab) => {
          const isSelected = platformFilter === tab.id;
          const activeBg = tab.id === 'mobile' ? '#10B981' : tab.id === 'web' ? '#3B82F6' : colors.primary;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setPlatformFilter(tab.id)}
              style={[
                styles.platformFilterChip,
                {
                  backgroundColor: isSelected ? activeBg : colors.surfaceSecondary,
                  borderColor: isSelected ? activeBg : colors.border,
                },
              ]}
            >
              <Ionicons
                name={tab.icon as any}
                size={13}
                color={isSelected ? '#FFFFFF' : colors.textMuted}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: isSelected ? '#FFFFFF' : colors.text,
                }}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.filterCountBadge,
                  { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : colors.surface },
                ]}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: isSelected ? '#FFFFFF' : colors.textMuted,
                  }}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarWrap}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={isAmharic ? 'በስም ወይም ሊንክ ፈልግ...' : 'Search menus by name, path, or role...'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Menu List */}
      {loading && !refreshing ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredMenus}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="layers-outline"
              title={isAmharic ? 'ምንም ምናሌ አልተገኘም' : 'No Menus Found'}
              description={
                isAmharic
                  ? 'አዲስ ምናሌ ለማከል ከላይ ያለውን "አዲስ ምናሌ" ቁልፍ ይጫኑ።'
                  : 'Tap the Add button above to create your first navigation menu.'
              }
            />
          }
          renderItem={({ item }) => {
            const iconName = resolveIconName(item.icon);
            return (
              <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Top Info Row */}
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: colors.surfaceSecondary }]}>
                    <Ionicons name={iconName} size={20} color={colors.primary} />
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={[styles.menuTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={[styles.orderBadge, { backgroundColor: colors.surfaceSecondary }]}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted }}>
                          #{item.order}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.platformChip,
                          {
                            backgroundColor:
                              item.type === 'mobile'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : 'rgba(59, 130, 246, 0.12)',
                            borderColor:
                              item.type === 'mobile'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : 'rgba(59, 130, 246, 0.3)',
                          },
                        ]}
                      >
                        <Ionicons
                          name={item.type === 'mobile' ? 'phone-portrait-outline' : 'desktop-outline'}
                          size={10}
                          color={item.type === 'mobile' ? '#10B981' : '#3B82F6'}
                        />
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: '800',
                            color: item.type === 'mobile' ? '#10B981' : '#3B82F6',
                          }}
                        >
                          {item.type === 'mobile' ? 'MOBILE' : 'WEB'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.menuPath, { color: colors.primary }]} numberOfLines={1}>
                      {item.href}
                    </Text>
                  </View>

                  <Badge
                    label={item.isActive ? (isAmharic ? 'ንቁ' : 'Active') : (isAmharic ? 'ቦዝኗል' : 'Inactive')}
                    variant={item.isActive ? 'success' : 'neutral'}
                  />
                </View>

                {/* Allowed Roles Chips */}
                <View style={styles.rolesRow}>
                  {(item.allowedRoles || []).map((role) => (
                    <View
                      key={role}
                      style={[
                        styles.roleChip,
                        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.roleChipText, { color: colors.textMuted }]}>
                        {role}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Actions Bottom Row */}
                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEdit(item)}
                  >
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                      {isAmharic ? 'አስተካክል' : 'Edit'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleToggleActive(item)}
                  >
                    <Ionicons
                      name={item.isActive ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color={colors.textMuted}
                    />
                    <Text style={[styles.actionBtnText, { color: colors.textMuted }]}>
                      {item.isActive ? (isAmharic ? 'አቦዝን' : 'Deactivate') : (isAmharic ? 'አንቃ' : 'Activate')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { marginLeft: 'auto' }]}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>
                      {isAmharic ? 'ሰርዝ' : 'Delete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Add Menu Modal */}
      <Modal visible={isAddOpen} animationType="slide" transparent onRequestClose={() => setIsAddOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isAmharic ? 'አዲስ ምናሌ ጨምር' : 'Add Menu Item'}
              </Text>
              <TouchableOpacity onPress={() => setIsAddOpen(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            {renderFormContent(false)}
          </View>
        </View>
      </Modal>

      {/* Edit Menu Modal */}
      <Modal visible={isEditOpen} animationType="slide" transparent onRequestClose={() => setIsEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isAmharic ? 'ምናሌን አስተካክል' : 'Edit Menu Item'}
              </Text>
              <TouchableOpacity onPress={() => setIsEditOpen(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            {renderFormContent(true)}
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
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.md,
  },
  menuCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  orderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  menuPath: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  fieldLabel: {
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
    marginBottom: spacing.sm,
  },
  iconSelectItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minWidth: 70,
    gap: 4,
  },
  roleSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformFilterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  platformFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterCountBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  platformToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
});
