import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { Conversation } from '../../types';

export const ChatListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/messages/conversations');
      let data: Conversation[] = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      setConversations(data);
    } catch (err: any) {
      console.warn('Error fetching conversations', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('nav.messages', 'Messages & Inquiries')}
        subtitle={isAmharic ? 'ከባለቤቶች እና ከደላሎች ጋር የቀጥታ ውይይት' : 'Real-time chats with landlords and agents'}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchConversations();
              }}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const participant = item.participant || { name: 'Support', phone: '' };
            return (
              <TouchableOpacity
                style={[
                  styles.chatItem,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('ChatDetail', {
                    recipient: participant,
                  })
                }
              >
                <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.topRow}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                      {participant.name || participant.phone || 'User'}
                    </Text>
                    {item.lastMessage?.createdAt && (
                      <Text style={[styles.time, { color: colors.textMuted }]}>
                        {new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={[styles.lastMsg, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.lastMessage?.text || (isAmharic ? 'ውይይት ጀምር...' : 'Start conversation...')}
                    </Text>

                    {item.unreadCount > 0 && (
                      <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title={isAmharic ? 'ምንም መልዕክቶች የሉም' : 'No Conversations Yet'}
              description={
                isAmharic
                  ? 'ከቤት ባለቤቶች ወይም ደላሎች ጋር መልዕክት ለመለዋወጥ ከቤቱ ዝርዝር ገጽ "መልእክት ላክ" የሚለውን ይጫኑ።'
                  : 'Start a conversation with an agent or landlord directly from any property detail page.'
              }
              actionLabel={isAmharic ? 'ቤቶችን ያስሱ' : 'Browse Properties'}
              onAction={() => navigation.navigate('Home')}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  time: {
    fontSize: 11,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: {
    fontSize: 13,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
