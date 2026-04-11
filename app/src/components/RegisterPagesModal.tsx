import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { Input } from './Input';
import { Button } from './Button';

interface RegisterPagesModalProps {
  visible: boolean;
  currentPage: number;
  onClose: () => void;
  onSave: (pages: number) => Promise<void>;
}

export function RegisterPagesModal({
  visible,
  currentPage,
  onClose,
  onSave,
}: RegisterPagesModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleClose = () => {
    setPages('');
    setErrorMsg('');
    onClose();
  };

  const handleSave = async () => {
    const num = parseInt(pages, 10);
    if (isNaN(num) || num <= 0 || num > 3000) {
      setErrorMsg(t('common.invalidPageCount'));
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await onSave(num);
      setPages('');
      onClose();
    } catch {
      setErrorMsg(t('common.failedSaveProgress'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
            <View style={[styles.content, { backgroundColor: theme.bgPrimary }]}>
              <View style={[styles.handle, { backgroundColor: theme.borderColor }]} />
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {t('registerPages.title')}
              </Text>

              <Input
                label={t('registerPages.pagesRead')}
                placeholder={t('registerPages.pagesReadPlaceholder')}
                value={pages}
                onChangeText={setPages}
                keyboardType="numeric"
              />

              <Text style={[styles.progress, { color: theme.textSecondary }]}>
                {t('registerPages.currentProgress', { pages: currentPage })}
              </Text>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <Button
                title={t('registerPages.save')}
                onPress={handleSave}
                loading={loading}
              />
            </View>
          </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    position: 'relative',
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
  progress: {
    fontSize: 13,
    marginBottom: 12,
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
