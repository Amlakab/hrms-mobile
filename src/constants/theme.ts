export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  border: string;
  divider: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  danger: string;
  info: string;
  tabBarBg: string;
  tabBarBorder: string;
  inputBg: string;
  inputBorder: string;
  modalBg: string;
  overlay: string;
}

export const darkColors: ThemeColors = {
  background: '#070D18',
  surface: '#0F1A2E',
  surfaceSecondary: '#16233B',
  card: '#112240',
  cardBorder: '#1E3A5F',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#60A5FA',
  secondary: '#0EA5E9',
  accent: '#38BDF8',
  border: '#1E293B',
  divider: '#1E293B',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  danger: '#EF4444',
  info: '#38BDF8',
  tabBarBg: '#0A1322',
  tabBarBorder: '#1E293B',
  inputBg: '#0F1E36',
  inputBorder: '#1E3A5F',
  modalBg: '#0F1A2E',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  secondary: '#0284C7',
  accent: '#0EA5E9',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.1)',
  danger: '#EF4444',
  info: '#0284C7',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  modalBg: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.6)',
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  h4: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body1: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  body2: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 15 },
  button: { fontSize: 15, fontWeight: '600' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 9999,
  full: 9999,
};
