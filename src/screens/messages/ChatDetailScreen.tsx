import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, spacing, typography } from '../../constants/theme';
import api from '../../config/api';
import { getSocket } from '../../config/socket';
import { Message, User } from '../../types';

export const ChatDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { recipient, houseId, houseTitle }: { recipient: User; houseId?: string; houseTitle?: string } =
    route.params;

  const { colors } = useTheme();
  const { isAmharic } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const recipientId = recipient._id;

  useEffect(() => {
    fetchMessages();

    const socket = getSocket();
    if (socket) {
      socket.on('receive_message', (newMsg: Message) => {
        setMessages((prev) => [...prev, newMsg]);
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
      }
    };
  }, [recipientId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/${recipientId}`);
      let list: Message[] = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      }
      setMessages(list);
    } catch (err: any) {
      console.warn('Failed to load chat history', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');

    // Optimistic message
    const tempMsg: Message = {
      _id: `temp_${Date.now()}`,
      sender: user?._id || 'me',
      receiver: recipientId,
      text,
      houseId,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      setSending(true);
      const res = await api.post('/messages', {
        receiverId: recipientId,
        text,
        message: text,
        houseId: houseId || '650000000000000000000001',
        phone: user?.phone || '0900000000',
        email: user?.email || 'customer@realestatepro.et',
        name: user?.name || 'Customer',
        subject: houseTitle || 'Property Inquiry',
      });

      const socket = getSocket();
      if (socket) {
        socket.emit('send_message', {
          receiverId: recipientId,
          text,
          message: text,
          houseId,
        });
      }
    } catch (err: any) {
      console.warn('Error sending message', err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={recipient.name || recipient.phone || 'User'}
        subtitle={isAmharic ? 'የቀጥታ መልዕክት ልውውጥ' : 'Online / Live Agent'}
        showBack={true}
      />

      {/* Property Context Header Strip */}
      {houseTitle && (
        <View style={[styles.contextBanner, { backgroundColor: colors.surfaceSecondary, borderBottomColor: colors.border }]}>
          <Ionicons name="home" size={14} color={colors.primary} />
          <Text style={[styles.contextTitle, { color: colors.text }]} numberOfLines={1}>
            {houseTitle}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMe =
              item.sender === user?._id ||
              (typeof item.sender === 'object' && item.sender?._id === user?._id) ||
              item.sender === 'me';

            return (
              <View
                style={[
                  styles.messageBubble,
                  isMe
                    ? [styles.myBubble, { backgroundColor: colors.primary }]
                    : [
                        styles.otherBubble,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          borderColor: colors.border,
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isMe ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {item.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                  ]}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          }}
        />
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder={isAmharic ? 'መልእክትዎን ይፃፉ...' : 'Type a message...'}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? colors.primary : colors.surfaceSecondary },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? '#FFFFFF' : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  contextTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
  },
  myBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
