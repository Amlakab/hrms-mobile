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
import { User, Role } from '../../types';

export const AdminUsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic, t } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Change Role Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>('customer');
  const [updating, setUpdating] = useState(false);

  // Add User Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createRole, setCreateRole] = useState<Role>('customer');
  const [creating, setCreating] = useState(false);

  // Permissions Modal state
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [allMenus, setAllMenus] = useState<any[]>([]);
  const [permissionsChecked, setPermissionsChecked] = useState<Record<string, boolean>>({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permPlatformFilter, setPermPlatformFilter] = useState<'all' | 'mobile' | 'web'>('all');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/user');
      const data = extractArray<User>(res, 'users');
      setUsers(data);
    } catch (err: any) {
      console.warn('Error fetching users', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleToggleBlock = async (u: User) => {
    const nextStatus = !u.isActive;
    try {
      await api.patch(`/user/${u._id}/status`, { isActive: nextStatus });
      setUsers((prev) =>
        prev.map((item) => (item._id === u._id ? { ...item, isActive: nextStatus } : item))
      );
      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Status Updated',
        nextStatus
          ? (isAmharic ? 'ተጠቃሚው ነፃ ወጥቷል (Active)' : 'User account unblocked')
          : (isAmharic ? 'ተጠቃሚው ታግዷል (Blocked)' : 'User account blocked')
      );
    } catch {
      setUsers((prev) =>
        prev.map((item) => (item._id === u._id ? { ...item, isActive: nextStatus } : item))
      );
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      setUpdating(true);
      try {
        await api.put(`/user/${editingUser._id}`, {
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          background: (editingUser as any).background,
          role: newRole,
        });
      } catch (putErr) {
        await api.patch(`/user/${editingUser._id}/role`, { role: newRole });
      }
      setUsers((prev) =>
        prev.map((item) => (item._id === editingUser._id ? { ...item, role: newRole } : item))
      );
      Alert.alert(
        isAmharic ? 'ተቀይሯል' : 'Role Updated',
        isAmharic ? 'የተጠቃሚው ሚና በተሳካ ሁኔታ ተቀይሯል።' : 'User role has been updated.'
      );
      setEditingUser(null);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = (u: User) => {
    Alert.alert(
      isAmharic ? 'ተጠቃሚውን ሰርዝ' : 'Delete User',
      isAmharic
        ? `እርግጠኛ ነዎት "${u.name || u.phone}"ን ከሲስተሙ ላይ መሰረዝ ይፈልጋሉ?`
        : `Are you sure you want to permanently delete user "${u.name || u.phone}"?`,
      [
        { text: isAmharic ? 'ይቅር' : 'Cancel', style: 'cancel' },
        {
          text: isAmharic ? 'አዎ ሰርዝ' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/user/${u._id}`);
              setUsers((prev) => prev.filter((item) => item._id !== u._id));
              Alert.alert(
                isAmharic ? 'ተሰርዟል' : 'Deleted',
                isAmharic ? 'ተጠቃሚው በተሳካ ሁኔታ ተሰርዟል።' : 'User account has been deleted.'
              );
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleCreateUser = async () => {
    if (!newPhone.trim() && !newEmail.trim()) {
      Alert.alert(isAmharic ? 'ስህተት' : 'Error', isAmharic ? 'እባክዎ ስልክ ቁጥር ወይም ኢሜይል ያስገቡ' : 'Please provide a phone number or email');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert(isAmharic ? 'ስህተት' : 'Error', isAmharic ? 'እባክዎ የይለፍ ቃል ያስገቡ' : 'Please provide a password');
      return;
    }

    try {
      setCreating(true);
      await api.post('/user/register', {
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
        password: newPassword,
        role: createRole,
      });

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        isAmharic ? 'አዲሱ ተጠቃሚ በተሳካ ሁኔታ ተፈጥሯል።' : 'User account created successfully.'
      );
      setIsAddUserOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setCreateRole('customer');
      fetchUsers();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenPermissions = async (targetUser: User) => {
    setPermissionsUser(targetUser);
    setPermissionsLoading(true);
    setPermissionsChecked({});
    setPermPlatformFilter('all');
    try {
      const res = await api.get('/menu');
      const menus: any[] = extractArray<any>(res, 'menus');
      setAllMenus(menus);

      const candidateMenus = menus.filter(
        (m) => m.allowedRoles && m.allowedRoles.includes(targetUser.role)
      );

      const userPermissionIds = new Set(
        ((targetUser.permissions as any[]) || []).map((p: any) =>
          typeof p === 'object' ? p._id : p
        )
      );

      const initial: Record<string, boolean> = {};
      for (const m of candidateMenus) {
        initial[m._id] = userPermissionIds.has(m._id);
      }
      setPermissionsChecked(initial);
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ምናሌዎችን መጫን አልተቻለም' : 'Failed to load menus')
      );
      setPermissionsUser(null);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const togglePermission = (menuId: string) => {
    setPermissionsChecked((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleSelectAllPermissions = () => {
    const candidateMenus = allMenus.filter(
      (m) => m.allowedRoles && m.allowedRoles.includes(permissionsUser?.role)
    );
    const targetMenus = candidateMenus.filter((m) => {
      if (permPlatformFilter === 'mobile') return m.type === 'mobile';
      if (permPlatformFilter === 'web') return m.type !== 'mobile';
      return true;
    });

    setPermissionsChecked((prev) => {
      const updated = { ...prev };
      targetMenus.forEach((m) => {
        updated[m._id] = true;
      });
      return updated;
    });
  };

  const handleClearAllPermissions = () => {
    const candidateMenus = allMenus.filter(
      (m) => m.allowedRoles && m.allowedRoles.includes(permissionsUser?.role)
    );
    const targetMenus = candidateMenus.filter((m) => {
      if (permPlatformFilter === 'mobile') return m.type === 'mobile';
      if (permPlatformFilter === 'web') return m.type !== 'mobile';
      return true;
    });

    setPermissionsChecked((prev) => {
      const updated = { ...prev };
      targetMenus.forEach((m) => {
        updated[m._id] = false;
      });
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    if (!permissionsUser) return;
    try {
      setSavingPermissions(true);
      const selectedIds = Object.entries(permissionsChecked)
        .filter(([, checked]) => checked)
        .map(([id]) => id);

      await api.put(`/user/${permissionsUser._id}/permissions`, {
        permissions: selectedIds,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === permissionsUser._id
            ? { ...u, permissions: selectedIds as any }
            : u
        )
      );

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        isAmharic
          ? 'የተጠቃሚው ፈቃዶች በተሳካ ሁኔታ ተሻሽለዋል'
          : 'User permissions updated successfully'
      );
      setPermissionsUser(null);
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ፈቃዶችን ማሻሻል አልተቻለም' : 'Failed to update permissions')
      );
    } finally {
      setSavingPermissions(false);
    }
  };

  const rolesList: Array<{ key: Role | 'ALL'; label: string }> = [
    { key: 'ALL', label: isAmharic ? 'ሁሉም' : 'All' },
    { key: 'customer', label: isAmharic ? 'ተከራይ' : 'Customer' },
    { key: 'owner', label: isAmharic ? 'ባለቤት' : 'Owner' },
    { key: 'agent', label: isAmharic ? 'ደላላ' : 'Agent' },
    { key: 'manager', label: isAmharic ? 'ስራ አስኪያጅ' : 'Manager' },
    { key: 'accountant', label: isAmharic ? 'የሂሳብ ሹም' : 'Accountant' },
    { key: 'admin', label: isAmharic ? 'አስተዳዳሪ' : 'Admin' },
  ];

  const filteredUsers = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }

    if (selectedRole !== 'ALL' && u.role !== selectedRole) {
      return false;
    }

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የተጠቃሚዎች አስተዳደር' : 'User Governance'}
        subtitle={isAmharic ? 'ተጠቃሚዎችን መቆጣጠር፣ ማገድ፣ ማስተካከል እና አዲስ መጨመር' : 'Manage roles, permissions & access control'}
        showBack={true}
        rightAction={
          <TouchableOpacity
            onPress={() => setIsAddUserOpen(true)}
            style={[styles.addUserBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={16} color="#FFFFFF" />
            <Text style={styles.addUserBtnText}>{isAmharic ? 'አዲስ' : 'Add'}</Text>
          </TouchableOpacity>
        }
      />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={isAmharic ? 'በስም ወይም በስልክ ቁጥር ይፈልጉ...' : 'Search users by name, phone or email...'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Roles Filter Horizontal Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rolesRow}>
          {rolesList.map((r) => {
            const isSelected = selectedRole === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                onPress={() => setSelectedRole(r.key)}
                style={[
                  styles.rolePill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rolePillText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Users Count Summary */}
      <View style={styles.summaryBar}>
        <Text style={[styles.summaryText, { color: colors.textMuted }]}>
          {isAmharic ? `የተገኙ ተጠቃሚዎች: ${filteredUsers.length}` : `Displaying ${filteredUsers.length} users`}
        </Text>
      </View>

      {/* Users List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {isAmharic ? 'ተጠቃሚዎች በመጫን ላይ ናቸው...' : 'Loading user records...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarWrap}>
                  <View style={[styles.avatarCircle, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                      {(item.name || item.phone || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                      {item.name || (isAmharic ? 'ያልተገለጸ ስም' : 'Unnamed Account')}
                    </Text>
                    <Text style={[styles.userContact, { color: colors.textMuted }]}>
                      {item.phone || item.email || (isAmharic ? 'ምንም ስልክ የለም' : 'No phone')}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <Badge
                  label={item.isActive ? (isAmharic ? 'ነፃ (Active)' : 'Active') : (isAmharic ? 'የታገደ (Blocked)' : 'Blocked')}
                  variant={item.isActive ? 'success' : 'error'}
                />
              </View>

              {/* Roles & Metas */}
              <View style={styles.cardMetaRow}>
                <View style={[styles.metaPill, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="shield-outline" size={13} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {t(`role.${item.role}`, item.role.toUpperCase())}
                  </Text>
                </View>

                {item.createdAt && (
                  <Text style={[styles.dateText, { color: colors.textMuted }]}>
                    {isAmharic ? 'የተመዘገበበት: ' : 'Joined: '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                {/* Toggle Block/Active */}
                <TouchableOpacity
                  onPress={() => handleToggleBlock(item)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: item.isActive
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'rgba(16, 185, 129, 0.12)',
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.isActive ? 'ban-outline' : 'checkmark-circle-outline'}
                    size={16}
                    color={item.isActive ? '#EF4444' : '#10B981'}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: item.isActive ? '#EF4444' : '#10B981' },
                    ]}
                  >
                    {item.isActive ? (isAmharic ? 'እገድ' : 'Block') : (isAmharic ? 'ፍቀድ' : 'Unblock')}
                  </Text>
                </TouchableOpacity>

                {/* Change Role Button */}
                <TouchableOpacity
                  onPress={() => {
                    setEditingUser(item);
                    setNewRole(item.role);
                  }}
                  style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="swap-vertical-outline" size={16} color={colors.text} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>
                    {isAmharic ? 'ሚና ቀይር' : 'Change Role'}
                  </Text>
                </TouchableOpacity>

                {/* Permissions Button */}
                <TouchableOpacity
                  onPress={() => handleOpenPermissions(item)}
                  style={[styles.actionBtn, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="key-outline" size={15} color="#3B82F6" />
                  <Text style={[styles.actionBtnText, { color: '#3B82F6' }]}>
                    {isAmharic ? 'ፈቃዶች' : 'Permissions'}
                  </Text>
                </TouchableOpacity>

                {/* Delete User Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteUser(item)}
                  style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={isAmharic ? 'ምንም አይነት ተጠቃሚ አልተገኘም' : 'No users found'}
              description={isAmharic ? 'ከተመረጠው ማጣሪያ ጋር የሚስማማ ተጠቃሚ የለም' : 'No accounts matching your query'}
            />
          }
        />
      )}

      {/* Edit Role Modal */}
      <Modal visible={!!editingUser} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isAmharic ? 'የተጠቃሚውን ሚና ይምረጡ' : 'Select User Role'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              {editingUser?.name || editingUser?.phone}
            </Text>

            <View style={styles.roleOptionsList}>
              {(['customer', 'owner', 'agent', 'manager', 'accountant', 'admin'] as Role[]).map((r) => {
                const isSelected = newRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setNewRole(r)}
                    style={[
                      styles.roleOptionItem,
                      {
                        backgroundColor: isSelected ? colors.primaryLight : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {t(`role.${r}`, r.toUpperCase())}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setEditingUser(null)}
                style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.textMuted }]}>
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateRole}
                disabled={updating}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>
                    {isAmharic ? 'አረጋግጥ' : 'Update Role'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add User Modal */}
      <Modal visible={isAddUserOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.addModalScroll}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {isAmharic ? 'አዲስ ተጠቃሚ መዝግብ' : 'Add New User'}
                </Text>
                <TouchableOpacity onPress={() => setIsAddUserOpen(false)}>
                  <Ionicons name="close" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {isAmharic ? 'ሙሉ ስም' : 'Full Name'}
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder={isAmharic ? 'ስም ያስገቡ...' : 'Enter full name...'}
                  placeholderTextColor={colors.textMuted}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder={isAmharic ? 'ምሳሌ: 0911234567' : 'e.g. 0911234567'}
                  placeholderTextColor={colors.textMuted}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {isAmharic ? 'ኢሜይል (አማራጭ)' : 'Email (Optional)'}
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder={isAmharic ? 'ኢሜይል ያስገቡ...' : 'user@example.com'}
                  placeholderTextColor={colors.textMuted}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {isAmharic ? 'የይለፍ ቃል' : 'Password'}
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder={isAmharic ? 'ቢያንስ 6 ቁምፊ...' : 'Min 6 characters...'}
                  placeholderTextColor={colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {isAmharic ? 'የተጠቃሚው ሚና' : 'User Role'}
                </Text>
                <View style={styles.rolePillGroup}>
                  {(['customer', 'owner', 'agent', 'manager', 'accountant', 'admin'] as Role[]).map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setCreateRole(r)}
                      style={[
                        styles.createRolePill,
                        {
                          backgroundColor: createRole === r ? colors.primary : colors.surfaceSecondary,
                          borderColor: createRole === r ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.createRoleText,
                          { color: createRole === r ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {t(`role.${r}`, r)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  onPress={() => setIsAddUserOpen(false)}
                  style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <Text style={[styles.modalBtnText, { color: colors.textMuted }]}>
                    {isAmharic ? 'ሰርዝ' : 'Cancel'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateUser}
                  disabled={creating}
                  style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                >
                  {creating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalSaveBtnText}>
                      {isAmharic ? 'ፍጠር' : 'Create User'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Permissions Management Modal */}
      <Modal
        visible={!!permissionsUser}
        transparent
        animationType="slide"
        onRequestClose={() => setPermissionsUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                maxHeight: '85%',
                width: '92%',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {isAmharic ? 'የተጠቃሚ ፈቃዶች' : 'User Permissions'}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>
                  {permissionsUser?.name || permissionsUser?.phone} ({permissionsUser?.role})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPermissionsUser(null)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Platform Filter Tabs */}
            {(() => {
              const roleCandidateMenus = allMenus.filter(
                (m) => m.allowedRoles && m.allowedRoles.includes(permissionsUser?.role)
              );
              const mobilePermCount = roleCandidateMenus.filter((m) => m.type === 'mobile').length;
              const webPermCount = roleCandidateMenus.filter((m) => m.type !== 'mobile').length;
              const visiblePermMenus = roleCandidateMenus.filter((m) => {
                if (permPlatformFilter === 'mobile') return m.type === 'mobile';
                if (permPlatformFilter === 'web') return m.type !== 'mobile';
                return true;
              });

              return (
                <>
                  <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
                    {(
                      [
                        { id: 'all', label: isAmharic ? 'ሁሉም' : 'All', count: roleCandidateMenus.length },
                        { id: 'mobile', label: isAmharic ? 'ሞባይል' : 'Mobile', count: mobilePermCount },
                        { id: 'web', label: isAmharic ? 'ድረ-ገጽ (Web)' : 'Web', count: webPermCount },
                      ] as const
                    ).map((tab) => {
                      const isSelected = permPlatformFilter === tab.id;
                      const activeColor = tab.id === 'mobile' ? '#10B981' : tab.id === 'web' ? '#3B82F6' : colors.primary;
                      return (
                        <TouchableOpacity
                          key={tab.id}
                          onPress={() => setPermPlatformFilter(tab.id)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            paddingVertical: 6,
                            borderRadius: borderRadius.md,
                            backgroundColor: isSelected ? activeColor : colors.surfaceSecondary,
                            borderWidth: 1,
                            borderColor: isSelected ? activeColor : colors.border,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: isSelected ? '#FFFFFF' : colors.text,
                            }}
                          >
                            {tab.label}
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: 5,
                              paddingVertical: 1,
                              borderRadius: 10,
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : colors.surface,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 9,
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

                  {/* Quick Select All / Clear All buttons */}
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs }}>
                    <TouchableOpacity
                      onPress={handleSelectAllPermissions}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.surfaceSecondary,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                        {isAmharic ? 'ሁሉንም ምረጥ' : 'Select All'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleClearAllPermissions}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.surfaceSecondary,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted }}>
                        {isAmharic ? 'ሁሉንም አፅዳ' : 'Clear All'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {permissionsLoading ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
                        {isAmharic ? 'ምናሌዎች በመጫን ላይ ናቸው...' : 'Loading permissions...'}
                      </Text>
                    </View>
                  ) : (
                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380, marginVertical: spacing.sm }}>
                      {visiblePermMenus.map((m) => {
                        const isChecked = !!permissionsChecked[m._id];
                        const isMobile = m.type === 'mobile';
                        return (
                          <TouchableOpacity
                            key={m._id}
                            onPress={() => togglePermission(m._id)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: 10,
                              paddingHorizontal: 10,
                              borderRadius: borderRadius.md,
                              backgroundColor: isChecked ? `${colors.primary}12` : 'transparent',
                              marginBottom: 4,
                              borderWidth: 1,
                              borderColor: isChecked ? colors.primary : colors.border,
                            }}
                          >
                            <Ionicons
                              name={isChecked ? 'checkbox' : 'square-outline'}
                              size={20}
                              color={isChecked ? colors.primary : colors.textMuted}
                              style={{ marginRight: 10 }}
                            />
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }} numberOfLines={1}>
                                  {m.name}
                                </Text>
                                <View
                                  style={{
                                    paddingHorizontal: 5,
                                    paddingVertical: 1,
                                    borderRadius: borderRadius.sm,
                                    backgroundColor: isMobile ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                    borderWidth: 1,
                                    borderColor: isMobile ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 9,
                                      fontWeight: '800',
                                      color: isMobile ? '#10B981' : '#3B82F6',
                                    }}
                                  >
                                    {isMobile ? 'Mobile' : 'Web'}
                                  </Text>
                                </View>
                              </View>
                              <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }} numberOfLines={1}>
                                {m.href}
                              </Text>
                            </View>
                            <Ionicons
                              name={isMobile ? 'phone-portrait-outline' : 'desktop-outline'}
                              size={15}
                              color={colors.textMuted}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </>
              );
            })()}

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <TouchableOpacity
                onPress={() => setPermissionsUser(null)}
                style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.textMuted }]}>
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSavePermissions}
                disabled={savingPermissions}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                {savingPermissions ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>
                    {isAmharic ? 'ፈቃዶችን መዝግብ' : 'Save Permissions'}
                  </Text>
                )}
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
  addUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  addUserBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  rolePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.md,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    fontSize: 12,
    marginTop: spacing.sm,
  },
  userCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userContact: {
    fontSize: 12,
    marginTop: 2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  addModalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    fontSize: 13,
  },
  rolePillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  createRolePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  createRoleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roleOptionsList: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  roleOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
  },
  modalBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    minWidth: 100,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
