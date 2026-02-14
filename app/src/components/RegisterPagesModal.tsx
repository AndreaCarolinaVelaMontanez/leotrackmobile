import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
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

  const handleSave = async () => {
    const num = parseInt(pages, 10);
    if (isNaN(num) || num <= 0) {
      Alert.alert(t('common.error'), t('common.invalidPageCount'));
      return;
    }
    setLoading(true);
    try {
      await onSave(num);
      setPages('');
      onClose();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.error || t('common.failedSaveProgress'));
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
                {t('registerPages.title')}
              </Text>

              <Input
                label={t('registerPages.pagesRead')}
                placeholder="25"
                value={pages}
                onChangeText={setPages}
                keyboardType="numeric"
              />

              <Text style={[styles.progress, { color: theme.textSecondary }]}>
                {t('registerPages.currentProgress', { pages: currentPage })}
              </Text>

              <Button
                title={t('registerPages.save')}
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
  progress: {
    fontSize: 13,
    marginBottom: 24,
  },
});
