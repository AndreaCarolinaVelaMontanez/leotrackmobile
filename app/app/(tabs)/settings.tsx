import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { ToggleSwitch } from '../../src/components/ToggleSwitch';
import { Button } from '../../src/components/Button';
import * as authApi from '../../src/api/auth';
import * as settingsApi from '../../src/api/settings';
import i18n from '../../src/i18n';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const settingsStore = useSettingsStore();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const isDark = settingsStore.theme === 'DARK';
  const isSpanish = settingsStore.language === 'ES';

  const handleThemeToggle = async () => {
    const newTheme = isDark ? 'LIGHT' : 'DARK';
    settingsStore.setTheme(newTheme);
    try {
      await settingsApi.updateSettings({ theme: newTheme });
    } catch {
      // Revert on failure
      settingsStore.setTheme(isDark ? 'DARK' : 'LIGHT');
    }
  };

  const handleLanguageToggle = async () => {
    const newLang = isSpanish ? 'EN' : 'ES';
    settingsStore.setLanguage(newLang);
    i18n.changeLanguage(newLang.toLowerCase());
    try {
      await settingsApi.updateSettings({ language: newLang });
    } catch {
      const revert = isSpanish ? 'ES' : 'EN';
      settingsStore.setLanguage(revert);
      i18n.changeLanguage(revert.toLowerCase());
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: t('settings.shareMessage') });
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('settings.title')}
        </Text>
      </View>

      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t('settings.preferences')}
        </Text>

        {/* Language Toggle */}
        <View style={[styles.card, { borderColor: theme.borderColor }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                {t('settings.language')}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {t('settings.languageDesc')}
              </Text>
            </View>
            <ToggleSwitch value={isSpanish} onToggle={handleLanguageToggle} />
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.card, { borderColor: theme.borderColor }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                {isDark ? t('settings.lightMode') : t('settings.darkMode')}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {isDark ? t('settings.lightModeDesc') : t('settings.darkModeDesc')}
              </Text>
            </View>
            <ToggleSwitch value={isDark} onToggle={handleThemeToggle} />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t('settings.other')}
        </Text>

        {/* Share App */}
        <TouchableOpacity
          style={[styles.card, { borderColor: theme.borderColor }]}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                {t('settings.shareApp')}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {t('settings.shareDesc')}
              </Text>
            </View>
            <Ionicons name="share-outline" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

        {/* Logout */}
        <Button
          title={t('settings.logout')}
          onPress={handleLogout}
          variant="secondary"
          textStyle={{ color: theme.error }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
});
