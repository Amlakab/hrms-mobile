import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../config/api';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  visible,
  onClose,
  onSelectNotification,
}) => {
  const { colors, isDark } = useTheme();
  const { isAmharic } = useLanguage();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data?.notifications || []);
        setUnreadCount(res.data.data?.unreadCount || 0);
      }
    } catch (err) {
      // Ignored if unauthenticated or offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/workflows/notifications/read-all', {});
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT':
        return { name: 'calendar-outline', color: '#06b6d4' };
      case 'OFFER_UPDATE':
        return { name: 'pricetag-outline', color: '#10b981' };
      case 'LEASE_UPDATE':
      case 'RENT_DUE':
        return { name: 'document-text-outline', color: '#f59e0b' };
      case 'MAINTENANCE_UPDATE':
        return { name: 'construct-outline', color: '#ec4899' };
      default:
        return { name: 'notifications-outline', color: colors.primary };
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? '#0D1527' : '#FFFFFF', borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>
                {isAmharic ? 'ማሳወቂያዎች' : 'Notifications'}
              </Text>
              {unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
                  <Text style={[styles.markReadText, { color: colors.primary }]}>
                    {isAmharic ? 'ሁሉንም አንብብ' : 'Mark all read'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          {loading && !refreshing ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />
              }
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {isAmharic ? 'ምንም ማሳወቂያዎች የሉም' : 'No notifications yet'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const iconInfo = getIcon(item.type);
                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (onSelectNotification) onSelectNotification(item);
                      onClose();
                    }}
                    style={[
                      styles.notifItem,
                      {
                        backgroundColor: item.isRead
                          ? isDark
                            ? '#111D32'
                            : '#F8FAFC'
                          : isDark
                          ? '#1A2942'
                          : '#EFF6FF',
                        borderColor: item.isRead ? colors.border : colors.primary,
                      },
                    ]}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: isDark ? '#0A1220' : '#FFFFFF' }]}>
                      <Ionicons name={iconInfo.name as any} size={20} color={iconInfo.color} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTopRow}>
                        <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        {!item.isRead && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
                      </View>
                      <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.message}
                      </Text>
                      <Text style={[styles.notifDate, { color: colors.textMuted }]}>
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    height: '75%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  notifItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifDate: {
    fontSize: 11,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
