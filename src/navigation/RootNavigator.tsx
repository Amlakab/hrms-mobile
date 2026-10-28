import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Core Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';

// Main Nav Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { ExploreScreen } from '../screens/customer/ExploreScreen';
import { MapScreen } from '../screens/customer/MapScreen';
import { PortalScreen } from '../screens/portal/PortalScreen';
import { AboutScreen } from '../screens/info/AboutScreen';
import { ContactScreen } from '../screens/info/ContactScreen';

// Detail & Feature Screens
import { PropertyDetailScreen } from '../screens/customer/PropertyDetailScreen';
import { OrdersScreen } from '../screens/customer/OrdersScreen';
import { FavoritesScreen } from '../screens/customer/FavoritesScreen';
import { CustomerPortalScreen } from '../screens/customer/CustomerPortalScreen';
import { CustomerPaymentsScreen } from '../screens/customer/CustomerPaymentsScreen';
import { ChatListScreen } from '../screens/messages/ChatListScreen';
import { ChatDetailScreen } from '../screens/messages/ChatDetailScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';

// Owner / Agent Screens
import { MyListingsScreen } from '../screens/owner/MyListingsScreen';
import { CreateHouseScreen } from '../screens/owner/CreateHouseScreen';
import { EditHouseScreen } from '../screens/owner/EditHouseScreen';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { AdminAgentsScreen } from '../screens/admin/AdminAgentsScreen';
import { AdminMenusScreen } from '../screens/admin/AdminMenusScreen';
import { AdminHousesScreen } from '../screens/admin/AdminHousesScreen';
import { ApproveHousesScreen } from '../screens/admin/ApproveHousesScreen';
import { AdminTransactionsScreen } from '../screens/admin/AdminTransactionsScreen';
import { ApproveTransactionsScreen } from '../screens/admin/ApproveTransactionsScreen';
import { AdminWorkflowsScreen } from '../screens/admin/AdminWorkflowsScreen';
import { TransactionReportsScreen } from '../screens/admin/TransactionReportsScreen';
import { FeedbackScreen } from '../screens/admin/FeedbackScreen';
import { QRCodeScreen } from '../screens/admin/QRCodeScreen';
import { AccountantsScreen } from '../screens/admin/AccountantsScreen';
import { LoanTrackerScreen } from '../screens/admin/LoanTrackerScreen';
import { CalculatorScreen } from '../screens/admin/CalculatorScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { ServicesScreen } from '../screens/info/ServicesScreen';
import { ResourcesScreen } from '../screens/info/ResourcesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();
  const insets = useSafeAreaInsets();

  const tabHeight = 56 + Math.max(insets.bottom, 8);
  const paddingBottom = Math.max(insets.bottom, 6);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabHeight,
          paddingBottom: paddingBottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      {/* 1. Home (Landing Page) */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('nav.home', isAmharic ? 'ዋና ገጽ' : 'Home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* 2. Explore (Public Houses) */}
      <Tab.Screen
        name="ExploreTab"
        component={ExploreScreen}
        options={{
          tabBarLabel: t('nav.explore', isAmharic ? 'አስስ' : 'Explore'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* 3. Map Search */}
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          tabBarLabel: t('nav.map_search', isAmharic ? 'ካርታ' : 'Map'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* 4. Portal (Admin / Owner / Customer Sidebar Hub) */}
      <Tab.Screen
        name="PortalTab"
        component={PortalScreen}
        options={{
          tabBarLabel: t('nav.my_portal', isAmharic ? 'ፖርታል' : 'Portal'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* 5. About */}
      <Tab.Screen
        name="AboutTab"
        component={AboutScreen}
        options={{
          tabBarLabel: t('nav.about', isAmharic ? 'ስለ እኛ' : 'About'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* 6. Contact */}
      <Tab.Screen
        name="ContactTab"
        component={ContactScreen}
        options={{
          tabBarLabel: t('nav.contact', isAmharic ? 'ያግኙን' : 'Contact'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'call' : 'call-outline'} size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Unauthenticated Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          </>
        ) : (
          // Authenticated App Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />

            {/* Direct Tab Targets & Shortcuts */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Explore" component={ExploreScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Portal" component={PortalScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />

            {/* Details & Customer Features */}
            <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
            <Stack.Screen name="CustomerPortal" component={CustomerPortalScreen} />
            <Stack.Screen name="CustomerPayments" component={CustomerPaymentsScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />

            {/* Admin Management Modules */}
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
            <Stack.Screen name="AdminAgents" component={AdminAgentsScreen} />
            <Stack.Screen name="AdminMenus" component={AdminMenusScreen} />
            <Stack.Screen name="AdminHouses" component={AdminHousesScreen} />
            <Stack.Screen name="ApproveHouses" component={ApproveHousesScreen} />
            <Stack.Screen name="AdminWorkflows" component={AdminWorkflowsScreen} />
            <Stack.Screen name="AdminTransactions" component={AdminTransactionsScreen} />
            <Stack.Screen name="ApproveTransactions" component={ApproveTransactionsScreen} />
            <Stack.Screen name="TransactionReports" component={TransactionReportsScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="FeedbackManager" component={FeedbackScreen} />
            <Stack.Screen name="QRCode" component={QRCodeScreen} />
            <Stack.Screen name="Accountants" component={AccountantsScreen} />
            <Stack.Screen name="LoanTracker" component={LoanTrackerScreen} />
            <Stack.Screen name="Calculator" component={CalculatorScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />

            {/* Host & Agent Modules */}
            <Stack.Screen name="MyListings" component={MyListingsScreen} />
            <Stack.Screen name="CreateHouse" component={CreateHouseScreen} />
            <Stack.Screen name="EditHouse" component={EditHouseScreen} />

            {/* Info Pages */}
            <Stack.Screen name="Services" component={ServicesScreen} />
            <Stack.Screen name="Resources" component={ResourcesScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
