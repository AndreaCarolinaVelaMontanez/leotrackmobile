import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import * as authApi from '../../src/api/auth';

const BG = '#490a66';
const INPUT_BG = '#F7F4FA';
const INPUT_BORDER = '#E2DCE8';
const TEXT_DARK = '#1C1024';
const TEXT_MUTED = '#8B7A96';
const PLACEHOLDER = '#B0A0BA';
const GRADIENT: [string, string, string] = ['#2a0040', '#490a66', '#7a2d99'];

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  const [token, setToken] = useState(params.token ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async () => {
    if (!token.trim() || !newPassword) return;
    setErrorMsg('');
    setLoading(true);
    try {
      await authApi.resetPassword(token.trim(), newPassword);
      setSuccess(true);
    } catch (error: any) {
      if (error?.response?.status === 429) {
        setErrorMsg(t('auth.tooManyAttempts'));
      } else {
        setErrorMsg(t('resetPassword.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#2a0040' }}>
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.brandZone}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../assets/icon2.png')}
              style={styles.icon}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>{t('app.name')}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.successTitle}>{t('resetPassword.successTitle')}</Text>
          <Text style={styles.successText}>{t('resetPassword.successText')}</Text>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.85}
            style={{ marginTop: 32, borderRadius: 8, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.gradientButtonText}>{t('forgotPassword.backToLogin')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#2a0040' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ZONA SUPERIOR: degradado de marca */}
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.brandZone}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../assets/icon2.png')}
              style={styles.icon}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>{t('app.name')}</Text>
        </LinearGradient>

        {/* ZONA INFERIOR: tarjeta blanca */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('resetPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('resetPassword.subtitle')}</Text>

          <Input
            placeholder={t('resetPassword.tokenPlaceholder')}
            value={token}
            onChangeText={(v) => { setToken(v); setErrorMsg(''); }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={PLACEHOLDER}
            style={{ backgroundColor: INPUT_BG, color: TEXT_DARK, borderColor: INPUT_BORDER, borderWidth: 1.5, fontWeight: '300', letterSpacing: 0.5 }}
          />

          <Input
            placeholder={t('resetPassword.newPasswordPlaceholder')}
            value={newPassword}
            onChangeText={(v) => { setNewPassword(v); setErrorMsg(''); }}
            secureTextEntry
            autoCorrect={false}
            autoComplete="off"
            textContentType="newPassword"
            placeholderTextColor={PLACEHOLDER}
            style={{ backgroundColor: INPUT_BG, color: TEXT_DARK, borderColor: INPUT_BORDER, borderWidth: 1.5, fontWeight: '300', letterSpacing: 0.5 }}
          />

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.85}
            style={{ marginTop: 4, marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.gradientButtonText}>{t('resetPassword.resetButton')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryZone}>
            <Button
              title={t('forgotPassword.backToLogin')}
              onPress={() => router.replace('/(auth)/login')}
              variant="text"
              textStyle={{ color: TEXT_MUTED, textDecorationLine: 'underline', fontSize: 11, fontWeight: '300', letterSpacing: 1.5 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  brandZone: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 18,
    borderWidth: 3.5,
    borderColor: '#C0C0C0',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  icon: {
    width: 84,
    height: 84,
    borderRadius: 17,
  },
  appName: {
    fontSize: 22,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '300',
    color: TEXT_DARK,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '300',
    color: TEXT_MUTED,
    letterSpacing: 1,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  secondaryZone: {
    alignItems: 'center',
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F5C2C7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '300',
    color: '#842029',
    letterSpacing: 0.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '300',
    color: TEXT_DARK,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 11,
    fontWeight: '300',
    color: TEXT_MUTED,
    letterSpacing: 1,
    lineHeight: 20,
    textAlign: 'center',
  },
});
