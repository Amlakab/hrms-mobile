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
import { User } from '../../types';

export const AdminAgentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Add Agent Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [background, setBackground] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Agent Modal
  const [editingAgent, setEditingAgent] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  // Permissions Modal state
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [allMenus, setAllMenus] = useState<any[]>([]);
  const [permissionsChecked, setPermissionsChecked] = useState<Record<string, boolean>>({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permPlatformFilter, setPermPlatformFilter] = useState<'all' | 'mobile' | 'web'>('all');

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/user?role=agent&limit=100');
      const data = extractArray<User>(res, 'users');
      setAgents(data);
    } catch (err: any) {
      console.warn('Error fetching agents', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAgents();
  };

  const handleToggleStatus = async (agent: User) => {
    const nextStatus = !agent.isActive;
    try {
      await api.patch(`/user/${agent._id}/status`, { isActive: nextStatus });
      setAgents((prev) =>
        prev.map((u) => (u._id === agent._id ? { ...u, isActive: nextStatus } : u))
      );
      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        isAmharic
          ? `የወኪል ሁኔታ ወደ ${nextStatus ? 'ንቁ' : 'የታገደ'} ተቀይሯል`
          : `Agent status updated to ${nextStatus ? 'Active' : 'Blocked'}`
      );
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ሁኔታ መቀየር አልተቻለም' : 'Failed to update status')
      );
    }
  };

  const handleCreateAgent = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert(
        isAmharic ? 'ማስጠንቀቂያ' : 'Validation',
        isAmharic ? 'እባክዎ ስም፣ ስልክ እና የይለፍ ቃል ያስገቡ' : 'Please provide name, phone and password'
      );
      return;
    }

    try {
      setCreating(true);
      await api.post('/user/register', {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        password,
        role: 'agent',
        background: background.trim() || undefined,
      });

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        isAmharic ? 'አዲስ ወኪል በተሳካ ሁኔታ ተመዝግቧል' : 'New certified agent registered successfully'
      );
      setIsAddOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setBackground('');
      fetchAgents();
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ወኪል መፍጠር አልተቻለም' : 'Failed to register agent')
      );
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;
    try {
      setUpdating(true);
      await api.put(`/user/${editingAgent._id}`, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim() || undefined,
      });

      setAgents((prev) =>
        prev.map((a) =>
          a._id === editingAgent._id
            ? { ...a, name: editName.trim(), phone: editPhone.trim(), email: editEmail.trim() }
            : a
        )
      );
      setEditingAgent(null);
      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        isAmharic ? 'የወኪል መረጃ ተሻሽሏል' : 'Agent details updated successfully'
      );
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || (isAmharic ? 'ማሻሻል አልተቻለም' : 'Failed to update agent')
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAgent = (agent: User) => {
    Alert.alert(
      isAmharic ? 'ወኪልን ሰርዝ' : 'Delete Agent',
      isAmharic
        ? `እርግጠኛ ነዎት ወኪል "${agent.name}" ማጥፋት ይፈልጋሉ?`
        : `Are you sure you want to delete agent "${agent.name}"?`,
      [
        { text: isAmharic ? 'ይቅር' : 'Cancel', style: 'cancel' },
        {
          text: isAmharic ? 'አዎ ሰርዝ' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/user/${agent._id}`);
              setAgents((prev) => prev.filter((u) => u._id !== agent._id));
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete agent');
            }
          },
        },
      ]
    );
  };

  // Permissions logic
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
        (m) => m.allowedRoles && m.allowedRoles.includes('agent')
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
        err.response?.data?.message || 'Failed to load permissions'
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
      (m) => m.allowedRoles && m.allowedRoles.includes('agent')
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
      (m) => m.allowedRoles && m.allowedRoles.includes('agent')
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

      setAgents((prev) =>
        prev.map((u) =>
          u._id === permissionsUser._id ? { ...u, permissions: selectedIds as any } : u
        )
      );

      Alert.alert(
        isAmharic ? 'ተሳክቷል' : 'Success',
        isAmharic ? 'የወኪል ፈቃዶች በተሳካ ሁኔታ ተመዝግበዋል' : 'Agent permissions updated successfully'
      );
      setPermissionsUser(null);
    } catch (err: any) {
      Alert.alert(
        isAmharic ? 'ስህተት' : 'Error',
        err.response?.data?.message || 'Failed to update permissions'
      );
    } finally {
      setSavingPermissions(false);
    }
  };

  // Filtered agents
  const filteredAgents = agents.filter((u) => {
    if (statusFilter === 'ACTIVE' && !u.isActive) return false;
    if (statusFilter === 'BLOCKED' && u.isActive) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.background || '').toLowerCase().includes(q)
    );
  });

  const activeCount = agents.filter((a) => a.isActive).length;
  const blockedCount = agents.filter((a) => !a.isActive).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isAmharic ? 'የደላሎች / ወኪሎች አስተዳደር' : 'Agent Management'}
        subtitle={isAmharic ? 'የሪል እስቴት ወኪሎችን መቆጣጠር እና ፍቃዶችን መስጠት' : 'Manage certified brokers, commissions & permissions'}
        showBack={true}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainTabs');
        }}
        rightElement={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsAddOpen(true)}
          >
            <Ionicons name="person-add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>
              {isAmharic ? 'አዲስ ወኪል' : 'Add Agent'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* KPI Stats Ribbon */}
      <View style={styles.statsRibbon}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{agents.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {isAmharic ? 'ጠቅላላ ወኪሎች' : 'Total Agents'}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{activeCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {isAmharic ? 'ንቁ ወኪሎች' : 'Active'}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{blockedCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {isAmharic ? 'የታገዱ' : 'Blocked'}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        {(
          [
            { id: 'ALL', label: isAmharic ? 'ሁሉም' : 'All', count: agents.length },
            { id: 'ACTIVE', label: isAmharic ? 'ንቁ' : 'Active', count: activeCount },
            { id: 'BLOCKED', label: isAmharic ? 'የታገዱ' : 'Blocked', count: blockedCount },
          ] as const
        ).map((tab) => {
          const isSelected = statusFilter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setStatusFilter(tab.id)}
              style={[
                styles.statusTabBtn,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: isSelected ? '#FFFFFF' : colors.text,
                }}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarWrap}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={isAmharic ? 'በስም፣ በስልክ ወይም በኢሜይል ፈልግ...' : 'Search agents by name, phone or email...'}
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

      {/* Agents List */}
      {loading && !refreshing ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredAgents}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={isAmharic ? 'ምንም ወኪል አልተገኘም' : 'No Agents Found'}
              description={
                isAmharic
                  ? 'አዲስ ወኪል ለመመዝገብ ከላይ ያለውን "አዲስ ወኪል" ቁልፍ ይጫኑ።'
                  : 'Tap the Add Agent button above to register certified real estate agents.'
              }
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.agentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Top Row */}
              <View style={styles.cardHeader}>
                <View style={[styles.avatarBox, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="briefcase" size={20} color="#10B981" />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={[styles.agentName, { color: colors.text }]} numberOfLines={1}>
                      {item.name || 'Unnamed Agent'}
                    </Text>
                    <View style={styles.agentTag}>
                      <Text style={styles.agentTagText}>AGENT</Text>
                    </View>
                  </View>

                  <Text style={[styles.agentContact, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.phone} {item.email ? `• ${item.email}` : ''}
                  </Text>
                </View>

                <Badge
                  label={item.isActive ? (isAmharic ? 'ንቁ' : 'Active') : (isAmharic ? 'የታገደ' : 'Blocked')}
                  variant={item.isActive ? 'success' : 'error'}
                />
              </View>

              {item.background ? (
                <View style={[styles.backgroundBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="ribbon-outline" size={13} color={colors.primary} />
                  <Text style={[styles.backgroundText, { color: colors.textMuted }]} numberOfLines={2}>
                    {item.background}
                  </Text>
                </View>
              ) : null}

              {/* Actions Bottom Bar */}
              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                {/* Permissions Button */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: `${colors.primary}15` }]}
                  onPress={() => handleOpenPermissions(item)}
                >
                  <Ionicons name="key-outline" size={14} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                    {isAmharic ? 'ፈቃዶች' : 'Permissions'}
                  </Text>
                </TouchableOpacity>

                {/* Edit Button */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => {
                    setEditingAgent(item);
                    setEditName(item.name || '');
                    setEditPhone(item.phone || '');
                    setEditEmail(item.email || '');
                  }}
                >
                  <Ionicons name="create-outline" size={14} color={colors.text} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>
                    {isAmharic ? 'አስተካክል' : 'Edit'}
                  </Text>
                </TouchableOpacity>

                {/* Status Toggle Button */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: item.isActive ? '#EF444415' : '#10B98115' }]}
                  onPress={() => handleToggleStatus(item)}
                >
                  <Ionicons
                    name={item.isActive ? 'lock-closed-outline' : 'lock-open-outline'}
                    size={14}
                    color={item.isActive ? '#EF4444' : '#10B981'}
                  />
                  <Text style={[styles.actionBtnText, { color: item.isActive ? '#EF4444' : '#10B981' }]}>
                    {item.isActive ? (isAmharic ? 'እገድ' : 'Block') : (isAmharic ? 'አንቃ' : 'Unblock')}
                  </Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  style={[styles.iconActionBtn, { marginLeft: 'auto' }]}
                  onPress={() => handleDeleteAgent(item)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Agent Modal */}
      <Modal visible={isAddOpen} transparent animationType="slide" onRequestClose={() => setIsAddOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isAmharic ? 'አዲስ ወኪል መመዝገቢያ' : 'Register Certified Agent'}
              </Text>
              <TouchableOpacity onPress={() => setIsAddOpen(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {isAmharic ? 'ሙሉ ስም *' : 'Full Name *'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder={isAmharic ? 'ለምሳሌ፡ ሰለሞን ተሾመ' : 'e.g. Solomon Teshome'}
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {isAmharic ? 'ስልክ ቁጥር *' : 'Phone Number *'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="0911223344"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {isAmharic ? 'ኢሜይል (አስፈላጊ ከሆነ)' : 'Email (Optional)'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="agent@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {isAmharic ? 'የይለፍ ቃል *' : 'Password *'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {isAmharic ? 'የስራ ልምድ / ልዩ ሙያ' : 'Specialization & Background'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border, height: 60 }]}
                placeholder={isAmharic ? 'ለምሳሌ፡ የቪላ እና አፓርታማ ሽያጭ ባለሙያ' : 'e.g. Bole & CMC luxury villa specialist'}
                placeholderTextColor={colors.textMuted}
                multiline
                value={background}
                onChangeText={setBackground}
              />
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <TouchableOpacity
                onPress={() => setIsAddOpen(false)}
                style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>
                  {isAmharic ? 'ይቅር' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateAgent}
                disabled={creating}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>
                    {isAmharic ? 'መዝግብ' : 'Register'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Agent Modal */}
      <Modal visible={!!editingAgent} transparent animationType="fade" onRequestClose={() => setEditingAgent(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isAmharic ? 'የወኪል መረጃ ማስተካከያ' : 'Edit Agent Information'}
              </Text>
              <TouchableOpacity onPress={() => setEditingAgent(null)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {isAmharic ? 'ሙሉ ስም' : 'Full Name'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />

            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {isAmharic ? 'ኢሜይል' : 'Email'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
              value={editEmail}
              onChangeText={setEditEmail}
              autoCapitalize="none"
            />

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <TouchableOpacity
                onPress={() => setEditingAgent(null)}
                style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>
                  {isAmharic ? 'ይቅር' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateAgent}
                disabled={updating}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>
                    {isAmharic ? 'ለውጥ መዝግብ' : 'Save Changes'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Permissions Modal */}
      <Modal visible={!!permissionsUser} transparent animationType="slide" onRequestClose={() => setPermissionsUser(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border, maxHeight: '85%', width: '92%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {isAmharic ? 'የወኪል ፈቃዶች' : 'Agent Permissions'}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>
                  {permissionsUser?.name} ({permissionsUser?.phone})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPermissionsUser(null)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Platform Filter Tabs */}
            {(() => {
              const roleCandidateMenus = allMenus.filter(
                (m) => m.allowedRoles && m.allowedRoles.includes('agent')
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
                          <Text style={{ fontSize: 11, fontWeight: '700', color: isSelected ? '#FFFFFF' : colors.text }}>
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
                            <Text style={{ fontSize: 9, fontWeight: '800', color: isSelected ? '#FFFFFF' : colors.textMuted }}>
                              {tab.count}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Select All / Clear All */}
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
                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360, marginVertical: spacing.sm }}>
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
                <Text style={{ color: colors.text, fontWeight: '700' }}>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  statsRibbon: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  statusTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  searchBarWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.md,
  },
  agentCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  agentTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  agentTagText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  agentContact: {
    fontSize: 12,
    marginTop: 2,
  },
  backgroundBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: 6,
    marginBottom: 6,
  },
  backgroundText: {
    fontSize: 11,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconActionBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: spacing.xs,
  },
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
