import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, DateFormatType } from '../utils/formatters';
import httpClient from '../services/httpClient';

interface UserPreferences {
  currency: CurrencyCode;
  dateFormat: DateFormatType;
  language: string;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  isLoading: boolean;
}

const defaultPreferences: UserPreferences = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from user profile on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await httpClient.backend.get('/profile');

      if (response) {
        const userPrefs: UserPreferences = {
          currency: (response.preferredCurrency || 'USD') as CurrencyCode,
          dateFormat: (response.dateFormat || 'MM/DD/YYYY') as DateFormatType,
          language: response.preferredLanguage || 'en',
        };

        setPreferences(userPrefs);

        // Also update i18n language if different
        const i18n = (await import('../i18n/config')).default;
        if (i18n.language !== userPrefs.language) {
          i18n.changeLanguage(userPrefs.language);
        }
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      // Use default preferences on error
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      // Optimistically update local state
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      // Update backend
      await httpClient.backend.put('/profile', {
        preferredCurrency: updatedPreferences.currency,
        dateFormat: updatedPreferences.dateFormat,
        preferredLanguage: updatedPreferences.language,
      });

      // Update i18n language if changed
      if (newPreferences.language) {
        const i18n = (await import('../i18n/config')).default;
        i18n.changeLanguage(newPreferences.language);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      // Revert on error
      loadPreferences();
      throw error;
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences, isLoading }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

