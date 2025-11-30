import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { languages } from '../i18n/config';
import { useUserPreferences } from '../contexts/UserPreferencesContext';

interface LanguageSelectorProps {
  variant?: 'standard' | 'outlined' | 'filled';
  fullWidth?: boolean;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'outlined',
  fullWidth = false,
  showLabel = true,
}) => {
  const { i18n, t } = useTranslation();
  const { preferences, updatePreferences } = useUserPreferences();

  // Normalize language code (e.g., 'en-US' -> 'en')
  const currentLanguage = preferences.language || i18n.language.split('-')[0];

  const handleLanguageChange = async (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value;
    try {
      // Update preferences in context and backend
      await updatePreferences({ language: newLanguage });
      // i18n.changeLanguage is called automatically in UserPreferencesContext
    } catch (error) {
      console.error('Failed to update language preference:', error);
    }
  };

  return (
    <FormControl variant={variant} fullWidth={fullWidth}>
      {showLabel && (
        <InputLabel id="language-selector-label">
          {t('profile.language')}
        </InputLabel>
      )}
      <Select
        labelId="language-selector-label"
        id="language-selector"
        value={currentLanguage}
        onChange={handleLanguageChange}
        label={showLabel ? t('profile.language') : undefined}
      >
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <MenuItem key={code} value={code}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1">{flag}</Typography>
              <Typography variant="body2">{name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;

