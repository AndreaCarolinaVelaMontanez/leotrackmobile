import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';
import { Book } from '../types';

interface AddToLibraryModalProps {
  visible: boolean;
  book: Book | null;
  onClose: () => void;
  onConfirm: (status: string, finishedYear?: number, pageCount?: number) => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'WISHLIST', labelKey: 'addToLibraryModal.statusWishlist', icon: 'bookmark-outline' as const },
  { value: 'READING', labelKey: 'addToLibraryModal.statusReading', icon: 'book-outline' as const },
  { value: 'FINISHED', labelKey: 'addToLibraryModal.statusFinished', icon: 'checkmark-circle-outline' as const },
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i);

export function AddToLibraryModal({ visible, book, onClose, onConfirm, loading }: AddToLibraryModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>('WISHLIST');
  const [finishedYear, setFinishedYear] = useState<number | undefined>(undefined);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [pageCountStr, setPageCountStr] = useState<string>('');
  const [pageCountError, setPageCountError] = useState('');

  useEffect(() => {
    if (book?.pageCount) {
      setPageCountStr(String(book.pageCount));
    } else {
      setPageCountStr('');
    }
  }, [book]);

  const handleConfirm = () => {
    if (pageCountStr !== '') {
      const parsed = parseInt(pageCountStr, 10);
      if (isNaN(parsed) || parsed <= 0) {
        setPageCountError(t('common.invalidPageCount'));
        return;
      }
    }
    setPageCountError('');
    const parsedPageCount = parseInt(pageCountStr, 10);
    const pageCount = status === 'FINISHED' && parsedPageCount > 0 ? parsedPageCount : undefined;
    onConfirm(status, status === 'FINISHED' ? finishedYear : undefined, pageCount);
  };

  const handleClose = () => {
    setStatus('WISHLIST');
    setFinishedYear(undefined);
    setYearPickerOpen(false);
    setPageCountStr(book?.pageCount ? String(book.pageCount) : '');
    setPageCountError('');
    onClose();
  };

  if (!book) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
      <View style={[styles.sheet, { backgroundColor: theme.bgSecondary }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: theme.borderColor }]} />

        {/* Book info */}
        <View style={styles.bookRow}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={[styles.cover, { backgroundColor: `${theme.accentPrimary}22` }]}>
              <Ionicons name="book-outline" size={20} color={theme.accentPrimary} />
            </View>
          )}
          <View style={styles.bookMeta}>
            <Text style={[styles.bookTitle, { color: theme.textPrimary }]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.bookAuthor, { color: theme.textSecondary }]} numberOfLines={1}>
              {book.author}
            </Text>
          </View>
        </View>

        {/* Status selector */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          {t('addToLibraryModal.statusLabel')}
        </Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = status === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.statusBtn,
                  {
                    borderColor: isActive ? theme.accentPrimary : theme.borderColor,
                    backgroundColor: isActive ? `${theme.accentPrimary}18` : 'transparent',
                  },
                ]}
                onPress={() => {
                  setStatus(opt.value);
                  if (opt.value !== 'FINISHED') setFinishedYear(undefined);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color={isActive ? theme.accentPrimary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.statusBtnText,
                    { color: isActive ? theme.accentPrimary : theme.textSecondary },
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Campos extra — solo cuando FINISHED */}
        {status === 'FINISHED' && (
          <>
            {/* Year picker */}
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {t('addToLibraryModal.yearLabel')}
            </Text>
            <TouchableOpacity
              style={[styles.dropdown, { borderColor: theme.borderColor, backgroundColor: theme.bgPrimary }]}
              onPress={() => setYearPickerOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, { color: finishedYear ? theme.textPrimary : theme.textTertiary }]}>
                {finishedYear ?? t('addToLibraryModal.thisYear')}
              </Text>
              <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Pages input */}
            <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 14 }]}>
              {t('addToLibraryModal.pagesLabel')}
            </Text>
            <TextInput
              style={[
                styles.pagesInput,
                {
                  borderColor: pageCountError ? '#F44336' : theme.borderColor,
                  backgroundColor: theme.bgPrimary,
                  color: theme.textPrimary,
                },
              ]}
              value={pageCountStr}
              onChangeText={(v) => { setPageCountStr(v); setPageCountError(''); }}
              keyboardType="numeric"
              placeholder={t('addToLibraryModal.pagesPlaceholder')}
              placeholderTextColor={theme.textTertiary}
              maxLength={6}
            />
            {pageCountError ? (
              <Text style={styles.pageCountError}>{pageCountError}</Text>
            ) : null}

            <Modal visible={yearPickerOpen} transparent animationType="fade" onRequestClose={() => setYearPickerOpen(false)}>
              <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setYearPickerOpen(false)} />
              <View style={[styles.pickerSheet, { backgroundColor: theme.bgSecondary, borderColor: theme.borderColor }]}>
                <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>
                  {t('addToLibraryModal.yearLabel')}
                </Text>
                <FlatList
                  data={[undefined, ...YEARS.slice(1)]}
                  keyExtractor={(item) => String(item ?? 'thisYear')}
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: year }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, (year === undefined ? finishedYear === undefined : finishedYear === year) && { backgroundColor: `${theme.accentPrimary}15` }]}
                      onPress={() => { setFinishedYear(year); setYearPickerOpen(false); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerItemText, { color: (year === undefined ? finishedYear === undefined : finishedYear === year) ? theme.accentPrimary : theme.textPrimary }]}>
                        {year ?? t('addToLibraryModal.thisYear')}
                      </Text>
                      {(year === undefined ? finishedYear === undefined : finishedYear === year) && (
                        <Ionicons name="checkmark" size={18} color={theme.accentPrimary} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Modal>
          </>
        )}

        <Button
          title={t('addToLibraryModal.confirm')}
          onPress={handleConfirm}
          loading={loading}
          style={{ marginTop: 20 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000060',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bookRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cover: {
    width: 52,
    height: 72,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bookMeta: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  bookAuthor: {
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 4,
  },
  dropdownText: {
    fontSize: 14,
  },
  pagesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: '#00000050',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: 320,
    paddingTop: 16,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  pickerScroll: {
    paddingHorizontal: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    marginHorizontal: 4,
    marginBottom: 2,
  },
  pickerItemText: {
    fontSize: 15,
  },
  pageCountError: {
    fontSize: 11,
    color: '#F44336',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
