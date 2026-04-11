import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { Input } from './Input';
import { Button } from './Button';

interface RegisterTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (totalMinutes: number) => Promise<void>;
}

export function RegisterTimeModal({ visible, onClose, onSave }: RegisterTimeModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    const h = parseInt(hours || '0', 10);
    const m = parseInt(minutes || '0', 10);

    if (isNaN(h) || isNaN(m)) {
      setErrorMsg(t('registerTime.errorEmpty'));
      return;
    }
    if (m < 0 || m > 59) {
      setErrorMsg(t('registerTime.errorMinutes'));
      return;
    }
    if (h > 24) {
      setErrorMsg(t('registerTime.errorMaxHours'));
      return;
    }
    const total = h * 60 + m;
    if (total <= 0) {
      setErrorMsg(t('registerTime.errorEmpty'));
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      await onSave(total);
      setHours('');
      setMinutes('');
      onClose();
    } catch {
      setErrorMsg(t('common.failedSaveSession'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, { backgroundColor: theme.bgPrimary }]}>
              <View style={[styles.handle, { backgroundColor: theme.borderColor }]} />
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {t('registerTime.title')}
              </Text>

              <View style={styles.row}>
                <View style={styles.field}>
                  <Input
                    label={t('registerTime.hours')}
                    placeholder={t('registerTime.hoursPlaceholder')}
                    value={hours}
                    onChangeText={setHours}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.separator, { backgroundColor: theme.borderColor }]} />
                <View style={styles.field}>
                  <Input
                    label={t('registerTime.minutes')}
                    placeholder={t('registerTime.minutesPlaceholder')}
                    value={minutes}
                    onChangeText={setMinutes}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <Button
                title={t('registerTime.save')}
                onPress={handleSave}
                loading={loading}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  field: {
    flex: 1,
  },
  separator: {
    width: 1,
    height: 48,
    marginTop: 28,
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F5C2C7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '300',
    color: '#842029',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
