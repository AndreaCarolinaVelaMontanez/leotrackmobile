import { View, Text, StyleSheet, TouchableOpacity, Share, ScrollView, Linking } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { ToggleSwitch } from '../../src/components/ToggleSwitch';
import { Button } from '../../src/components/Button';
import * as authApi from '../../src/api/auth';
import * as settingsApi from '../../src/api/settings';
import * as configApi from '../../src/api/config';
import i18n from '../../src/i18n';
import { OTHER_APPS } from '../../src/constants/otherApps';
import { LionIcon } from '../../src/components/LionIcon';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
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
      let message = t('settings.shareMessage');
      try {
        const { downloadUrl } = await configApi.getConfig();
        if (downloadUrl) message += `\n\n${downloadUrl}`;
      } catch {}
      await Share.share({ message });
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


      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Mi Perfil */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t('settings.profile')}
        </Text>
        <TouchableOpacity
          style={[styles.card, { borderColor: theme.borderColor }]}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {t('settings.profileDesc')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderColor: theme.borderColor }]}
          onPress={() => router.push('/my-recommendations')}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                {t('settings.myRecommendations')}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {t('settings.myRecommendationsDesc')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

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

        {/* Comunidades */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t('settings.community')}
        </Text>

        <TouchableOpacity
          style={[styles.card, { borderColor: theme.borderColor }]}
          onPress={() => router.push('/explore-recommendations')}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                {t('settings.exploreRecommendations')}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {t('explore.subtitle')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

        {/* Privacidad y Legal */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t('settings.legal')}
        </Text>

        <TouchableOpacity
          style={[styles.card, { borderColor: theme.borderColor }]}
          onPress={() => router.push('/legal/privacy-policy')}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                {t('settings.privacyPolicy')}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {t('settings.privacyPolicyDesc')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderColor: theme.borderColor }]}
          onPress={() => router.push('/legal/terms-conditions')}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                {t('settings.termsConditions')}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {t('settings.termsConditionsDesc')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

        {/* Otros */}
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

        {/* Explora nuestras otras apps */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t('settings.exploreApps')}
        </Text>

        {OTHER_APPS.map((app) => (
          <View key={app.id} style={[styles.appCard, { borderColor: theme.borderColor }]}>
            <View style={[styles.appIcon, { borderColor: app.color, backgroundColor: app.color + '12' }]}>
              {app.id === 'mountlion' ? (
                <LionIcon size={22} color={app.color} />
              ) : (
                <Ionicons name={app.icon as any} size={22} color={app.color} />
              )}
            </View>
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: theme.textPrimary }]}>{app.name}</Text>
              <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
                {settingsStore.language === 'ES' ? app.taglineEs : app.taglineEn}
              </Text>
            </View>
            {app.comingSoon ? (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>{t('settings.comingSoon')}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.downloadBtn, { borderColor: '#490a66' }]}
                onPress={() => Linking.openURL(app.url)}
                activeOpacity={0.7}
              >
                <Text style={styles.downloadText}>{t('settings.download')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

        {/* Logout */}
        <Button
          title={t('settings.logout')}
          onPress={handleLogout}
          variant="primary"
        />

        <View style={styles.brandFooter}>
          <Svg height={22} width={140}>
            <Defs>
              <SvgGradient id="greenGradSettings" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#1b5e20" />
                <Stop offset="1" stopColor="#81c784" />
              </SvgGradient>
            </Defs>
            <SvgText fill="url(#greenGradSettings)" fontSize="11" fontWeight="bold" x="70" y="16" textAnchor="middle" letterSpacing="1">
              By MountLion
            </SvgText>
          </Svg>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  brandFooter: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
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
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  appTagline: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
  },
  downloadBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  downloadText: {
    color: '#490a66',
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  comingSoonBadge: {
    borderWidth: 1,
    borderColor: '#C8BDD4',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F5F0FA',
  },
  comingSoonText: {
    color: '#9B89A8',
    fontSize: 9,
    fontWeight: '300',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
