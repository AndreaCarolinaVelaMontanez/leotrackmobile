import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ProgressBar } from './ProgressBar';
import { Badge } from './Badge';
import { UserBook } from '../types';
import { formatMinutes } from '../utils/formatTime';
import { useTranslation } from 'react-i18next';


interface BookCardProps {
  userBook: UserBook;
  onPress: () => void;
}

const GRADIENTS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
];

export function BookCard({ userBook, onPress }: BookCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { book, currentPage, totalMinutes, status } = userBook;
  const pageCount = book.pageCount || 0;
  const progress = pageCount > 0 ? currentPage / pageCount : 0;

  // Deterministic gradient based on book title
  const gradientIdx =
    book.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    GRADIENTS.length;
  const gradient = GRADIENTS[gradientIdx];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.bgPrimary, borderColor: theme.borderColor },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.cover} />
      ) : (
        <View
          style={[
            styles.cover,
            { backgroundColor: gradient[0] },
          ]}
        />
      )}

      <View style={styles.info}>
        <Text
          style={[styles.title, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text style={[styles.author, { color: theme.textSecondary }]}>
          {book.author}
        </Text>

        {pageCount > 0 && <ProgressBar progress={progress} />}
        {pageCount > 0 && (
          <Text style={[styles.progressText, { color: theme.textTertiary }]}>
            {currentPage} / {pageCount} {t('library.pages')}
          </Text>
        )}

        <View style={styles.meta}>
          <Badge status={status} />
          {totalMinutes > 0 && (
            <Text style={[styles.time, { color: theme.textTertiary }]}>
              {formatMinutes(totalMinutes)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  cover: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  time: {
    fontSize: 12,
  },
});
