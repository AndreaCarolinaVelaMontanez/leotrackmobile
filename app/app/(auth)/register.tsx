import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuthStore } from '../../src/stores/authStore';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import * as authApi from '../../src/api/auth';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      const { user, token } = await authApi.register(name.trim(), email.trim(), password);
      setAuth(token, user);
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {t('auth.createAccount')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('auth.startTracking')}
          </Text>
        </View>

        <Input
          label={t('auth.name')}
          placeholder={t('auth.namePlaceholder')}
          value={name}
          onChangeText={setName}
        />

        <Input
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={t('auth.createAccount')}
          onPress={handleRegister}
          loading={loading}
          style={{ marginBottom: 16 }}
        />

        <Button
          title={t('auth.alreadyHaveAccount')}
          onPress={() => router.back()}
          variant="text"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingHorizontal: 20,
  },
  logo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
  },
});
