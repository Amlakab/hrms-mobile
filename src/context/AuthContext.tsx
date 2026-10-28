import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../config/api';
import { disconnectSocket, initSocket } from '../config/socket';
import { User, Role } from '../types';

interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: Role;
  background?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  loginWithOtp: (phone: string, otp: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<User | null>;
  isAdmin: boolean;
  isOwner: boolean;
  isAgent: boolean;
  isManager: boolean;
  isAccountant: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const savedUserStr = await AsyncStorage.getItem(USER_STORAGE_KEY);

      if (savedToken && savedUserStr) {
        setToken(savedToken);
        const parsedUser = JSON.parse(savedUserStr);
        setUser(parsedUser);
        initSocket().catch(() => {});

        // Quietly refresh profile in background to keep permissions and role synchronized with database
        api.get('/auth/profile')
          .then((res) => {
            if (res.data?.data) {
              setUser(res.data.data);
              AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.data));
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to restore session from AsyncStorage', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data && response.data.data) {
        const userData: User = response.data.data;
        setUser(userData);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.warn('Failed to fetch user profile:', error);
      return null;
    }
  };

  const login = async (phone: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login', { phone, password });
      const { token: authToken, user: userData } = response.data.data;

      if (!authToken || !userData) {
        throw new Error('Invalid response from server');
      }

      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      initSocket().catch(() => {});

      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const loginWithOtp = async (phone: string, otp: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login-otp', { phone, otp });
      const { token: authToken, user: userData } = response.data.data;

      if (!authToken || !userData) {
        throw new Error('Invalid response from server');
      }

      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      initSocket().catch(() => {});

      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    try {
      const payload: any = {
        name: data.name,
        phone: data.phone,
        password: data.password,
        role: data.role || 'customer',
      };
      if (data.email) payload.email = data.email;
      if (data.background) {
        payload.background = data.background;
        payload.agent_id = data.background;
      }

      const response = await api.post('/auth/register', payload);
      const { token: authToken, user: userData } = response.data.data;

      if (!authToken || !userData) {
        throw new Error('Invalid response from server');
      }

      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      initSocket().catch(() => {});

      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      disconnectSocket();
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setToken(null);
      setUser(null);
    } catch (e) {
      console.warn('Error during logout', e);
    }
  };

  const role = user?.role || 'user';
  const isAdmin = role === 'admin';
  const isOwner = role === 'owner';
  const isAgent = role === 'agent';
  const isManager = role === 'manager';
  const isAccountant = role === 'accountant';
  const isCustomer = role === 'customer' || role === 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithOtp,
        register,
        logout,
        fetchUserProfile,
        isAdmin,
        isOwner,
        isAgent,
        isManager,
        isAccountant,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
