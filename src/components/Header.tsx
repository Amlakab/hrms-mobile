import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { spacing, typography } from '../constants/theme';
import { NotificationCenterModal } from './NotificationCenterModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightElement?: React.ReactNode;
  showNotificationBell?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBackPress,
  onBack,
  rightAction,
  rightElement,
  showNotificationBell = true,
}) => {
  const navigation = useNavigation<any>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [showNotifModal, setShowNotifModal] = React.useState(false);

  const isBackVisible = showBack !== undefined ? showBack : navigation.canGoBack();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.contentRow}>
          <View style={styles.leftGroup}>
            {isBackVisible && (
              <TouchableOpacity
                onPress={handleBack}
                style={[styles.iconButton, { backgroundColor: colors.surfaceSecondary }]}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.rightGroup}>
            {rightElement || rightAction}

            {showNotificationBell && (
              <TouchableOpacity
                onPress={() => setShowNotifModal(true)}
                style={[styles.iconButton, { backgroundColor: colors.surfaceSecondary }]}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={18} color={colors.text} />
              </TouchableOpacity>
            )}

            {/* Quick Language Toggle */}
            <TouchableOpacity
              onPress={toggleLanguage}
              style={[styles.langBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.langText, { color: colors.primary }]}>
                {language === 'en' ? 'አማ' : 'EN'}
              </Text>
            </TouchableOpacity>

            {/* Quick Theme Toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.iconButton, { backgroundColor: colors.surfaceSecondary }]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={18}
                color={isDark ? '#F59E0B' : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <NotificationCenterModal
        visible={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        onSelectNotification={(item) => {
          if (item.type === 'APPOINTMENT' || item.type === 'OFFER_UPDATE' || item.type === 'LEASE_UPDATE' || item.type === 'MAINTENANCE_UPDATE') {
            navigation.navigate('Portal');
          }
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 10) + 8 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBadge: {
    paddingHorizontal: 8,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
