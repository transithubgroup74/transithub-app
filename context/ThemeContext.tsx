import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../constants/theme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof darkColors;
  toggleTheme: () => void;
  setSystemDefault: () => void;
  isDark: boolean;
  isSystemDefault: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: darkColors,
  toggleTheme: () => {},
  setSystemDefault: () => {},
  isDark: true,
  isSystemDefault: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'light' ? 'light' : 'dark');
  const [userOverride, setUserOverride] = useState<ThemeMode | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setUserOverride(saved);
        setMode(saved);
      } else {
        setUserOverride(null);
        setMode(systemScheme === 'light' ? 'light' : 'dark');
      }
    });
  }, []);

  // Follow system changes only when no user override is set
  useEffect(() => {
    if (userOverride === null) {
      setMode(systemScheme === 'light' ? 'light' : 'dark');
    }
  }, [systemScheme]);

  const toggleTheme = async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    setUserOverride(next);
    await AsyncStorage.setItem('themeMode', next);
  };

  const setSystemDefault = async () => {
    setUserOverride(null);
    setMode(systemScheme === 'light' ? 'light' : 'dark');
    await AsyncStorage.removeItem('themeMode');
  };

  const colors = mode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setSystemDefault, isDark: mode === 'dark', isSystemDefault: userOverride === null }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
