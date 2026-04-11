import { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/authStore';
import * as authApi from '../../src/api/auth';

const TEXT_DARK = '#1C1024';
const TEXT_MUTED = '#8B7A96';
const GRADIENT: [string, string, string] = ['#2a0040', '#490a66', '#7a2d99'];
const RESEND_COOLDOWN = 60;

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { userId, email } = useLocalSearchParams<{ userId: string; email: string }>();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const { user, token } = await authApi.verifyEmail(userId!, code);
      setAuth(token, user);
    } catch (error: any) {
      if (error?.response?.status === 429) {
        setErrorMsg(t('auth.tooManyAttempts'));
      } else {
        setErrorMsg(t('verifyEmail.invalidCode'));
      }
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await authApi.resendVerification(userId!);
      startCooldown();
      setSuccessMsg(t('verifyEmail.resendSuccessText'));
    } catch {
      setErrorMsg(t('common.unknownError'));
    } finally {
      setResending(false);
    }
  };

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
          <Text style={styles.tagline}>{t('verifyEmail.title')}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.subtitle}>
            {t('verifyEmail.subtitle', { email: decodeURIComponent(email ?? '') })}
          </Text>

          <TextInput
            style={[styles.codeInput, { color: TEXT_DARK }]}
            value={code}
            onChangeText={(v) => { setCode(v.replace(/[^0-9]/g, '').slice(0, 6)); setErrorMsg(''); }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="#C0B0CC"
            textAlign="center"
            autoFocus
          />

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || code.length !== 6}
            activeOpacity={0.85}
            style={{ marginTop: 8, marginBottom: 12, borderRadius: 8, overflow: 'hidden', opacity: code.length !== 6 ? 0.5 : 1 }}
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
                <Text style={styles.gradientButtonText}>{t('verifyEmail.verify')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendZone}>
            <Text style={[styles.resendLabel, { color: TEXT_MUTED }]}>
              {t('verifyEmail.noCode')}
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={cooldown > 0 || resending}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendLink, { color: cooldown > 0 ? TEXT_MUTED : '#490a66' }]}>
                {cooldown > 0
                  ? t('verifyEmail.resendCooldown', { seconds: cooldown })
                  : t('verifyEmail.resend')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/register')}
              activeOpacity={0.7}
              style={{ marginTop: 12 }}
            >
              <Text style={[styles.backLink, { color: TEXT_MUTED }]}>
                {t('verifyEmail.backToRegister')}
              </Text>
            </TouchableOpacity>
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
  tagline: {
    fontSize: 10,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
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
  subtitle: {
    fontSize: 11,
    fontWeight: '300',
    color: TEXT_MUTED,
    letterSpacing: 1,
    lineHeight: 20,
    marginBottom: 28,
    textAlign: 'center',
  },
  codeInput: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 12,
    borderWidth: 1.5,
    borderColor: '#E2DCE8',
    borderRadius: 14,
    backgroundColor: '#F7F4FA',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
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
  resendZone: {
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  resendLabel: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  resendLink: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  backLink: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
    textDecorationLine: 'underline',
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
  successBox: {
    backgroundColor: '#F0FAF4',
    borderWidth: 1,
    borderColor: '#B7E4C7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  successText: {
    fontSize: 11,
    fontWeight: '300',
    color: '#155724',
    letterSpacing: 0.5,
    lineHeight: 16,
    textAlign: 'center',
  },
});
