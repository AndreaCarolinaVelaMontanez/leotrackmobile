import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useBookDetail, useDeleteUserBook } from '../../../src/hooks/useLibrary';
import { ProgressBar } from '../../../src/components/ProgressBar';
import { Badge } from '../../../src/components/Badge';
import { TimerDisplay } from '../../../src/components/TimerDisplay';
import { SessionItem } from '../../../src/components/SessionItem';
import { RegisterPagesModal } from '../../../src/components/RegisterPagesModal';
import { formatMinutes } from '../../../src/utils/formatTime';
import * as progressApi from '../../../src/api/progress';
import * as sessionsApi from '../../../src/api/sessions';

export default function BookDetailScreen() {
  const { userBookId } = useLocalSearchParams<{ userBookId: string }>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userBook, isLoading } = useBookDetail(userBookId!);
  const deleteBookMutation = useDeleteUserBook();
  const [modalVisible, setModalVisible] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      t('bookDetail.deleteBook'),
      t('bookDetail.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('bookDetail.deleteBook'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBookMutation.mutateAsync(userBookId!);
              router.back();
            } catch (error: any) {
              const msg = error?.response?.data?.error || error?.message || t('common.unknownError');
              Alert.alert(t('common.error'), msg);
            }
          },
        },
      ]
    );
  };

  const handleRegisterPages = async (pages: number) => {
    await progressApi.createProgress(userBookId!, pages);
    queryClient.invalidateQueries({ queryKey: ['library'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  };

  const handleTimerStop = async (startedAt: number, endedAt: number) => {
    try {
      await sessionsApi.createSession(
        userBookId!,
        new Date(startedAt).toISOString(),
        new Date(endedAt).toISOString()
      );
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.error || t('common.failedSaveSession'));
    }
  };

  if (isLoading || !userBook) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accentPrimary} />
      </SafeAreaView>
    );
  }

  const { book, currentPage, totalMinutes, status, readingSessions } = userBook;
  const pageCount = book.pageCount || 0;
  const progress = pageCount > 0 ? currentPage / pageCount : 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, flex: 1 }]}>
          {t('bookDetail.title')}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
          <Ionicons name="trash-outline" size={22} color={theme.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Book Header */}
        <View style={styles.bookHeader}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, { backgroundColor: '#667eea' }]} />
          )}
          <View style={styles.bookMeta}>
            <Text style={[styles.bookTitle, { color: theme.textPrimary }]}>
              {book.title}
            </Text>
            <Text style={[styles.bookAuthor, { color: theme.textSecondary }]}>
              {book.author}
            </Text>
            <Text style={[styles.bookExtra, { color: theme.textTertiary }]}>
              {book.category ? `${book.category} · ` : ''}{pageCount > 0 ? `${pageCount} ${t('library.pages')}` : ''}
            </Text>
            <View style={{ marginTop: 12 }}>
              <Badge status={status} />
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={[styles.card, { borderColor: theme.borderColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {t('bookDetail.progress')}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={[styles.registerBtn, { color: theme.accentPrimary }]}>
                {t('bookDetail.register')}
              </Text>
            </TouchableOpacity>
          </View>
          {pageCount > 0 && <ProgressBar progress={progress} />}
          <Text style={[styles.progressText, { color: theme.textTertiary }]}>
            {currentPage} / {pageCount} {t('library.pages')} ({pageCount > 0 ? Math.round(progress * 100) : 0}%)
          </Text>
        </View>

        {/* Timer */}
        <TimerDisplay userBookId={userBookId!} onStop={handleTimerStop} />

        <Text style={[styles.totalTime, { color: theme.textSecondary }]}>
          {t('bookDetail.totalTime')}: {formatMinutes(totalMinutes)}
        </Text>

        {/* Recent Sessions */}
        {readingSessions && readingSessions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 16 }]}>
              {t('bookDetail.recentSessions')}
            </Text>
            <View style={[styles.card, { borderColor: theme.borderColor }]}>
              {readingSessions.map((session, idx) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isLast={idx === readingSessions.length - 1}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <RegisterPagesModal
        visible={modalVisible}
        currentPage={currentPage}
        onClose={() => setModalVisible(false)}
        onSave={handleRegisterPages}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    padding: 20,
  },
  bookHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  cover: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  bookMeta: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 13,
    marginBottom: 8,
  },
  bookExtra: {
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerBtn: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
  },
  totalTime: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 32,
  },
});
