import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Toast, useToast } from '../../src/components/Toast';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuthStore } from '../../src/stores/authStore';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import * as settingsApi from '../../src/api/settings';
import { COUNTRIES } from '../../src/constants/countries';
import i18n from '../../src/i18n';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const lang = i18n.language === 'es' ? 'es' : 'en';

  const [name, setName] = useState(user?.name ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const updated = await settingsApi.updateProfile(trimmed, country || undefined);
      setAuth(token!, { ...user!, name: updated.name, country: updated.country });
      showToast(t('profile.successText'), 'success');
      setTimeout(() => router.back(), 1200);
    } catch {
      showToast(t('common.unknownError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    name.trim() !== user?.name || country !== (user?.country ?? '');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <Toast toast={toast} />
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('profile.title')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Input
            label={t('profile.name')}
            placeholder={t('profile.namePlaceholder')}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Selector de país */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('profile.country')}
          </Text>
          <TouchableOpacity
            style={[styles.picker, { borderColor: theme.borderColor, backgroundColor: theme.bgPrimary }]}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pickerText, { color: selectedCountry ? theme.textPrimary : theme.textTertiary }]}>
              {selectedCountry ? selectedCountry[lang] : t('profile.countryPlaceholder')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.textTertiary} />
          </TouchableOpacity>

          <Button
            title={t('profile.save')}
            onPress={handleSave}
            loading={loading}
            disabled={!name.trim() || !hasChanges}
            style={{ marginTop: 8 }}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Modal selector de países */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.bgPrimary }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {t('profile.country')}
              </Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    { borderBottomColor: theme.borderColor },
                    item.code === country && { backgroundColor: theme.bgSecondary },
                  ]}
                  onPress={() => {
                    setCountry(item.code);
                    setShowPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.countryText, { color: theme.textPrimary }]}>
                    {item[lang]}
                  </Text>
                  {item.code === country && (
                    <Ionicons name="checkmark" size={18} color={theme.accentPrimary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center' },
  container: { padding: 20 },
  label: { fontSize: 13, fontWeight: '300', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  pickerText: { fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  countryText: { fontSize: 15 },
});
