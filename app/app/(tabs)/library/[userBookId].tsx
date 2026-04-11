import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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
import { Toast, useToast } from '../../../src/components/Toast';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useBookDetail, useDeleteUserBook } from '../../../src/hooks/useLibrary';
import { useTimerStore } from '../../../src/stores/timerStore';
import { ProgressBar } from '../../../src/components/ProgressBar';
import { Badge } from '../../../src/components/Badge';
import { TimerDisplay } from '../../../src/components/TimerDisplay';
import { SessionItem } from '../../../src/components/SessionItem';
import { RegisterPagesModal } from '../../../src/components/RegisterPagesModal';
import { RegisterTimeModal } from '../../../src/components/RegisterTimeModal';
import { TagSelector } from '../../../src/components/TagSelector';
import { formatMinutes } from '../../../src/utils/formatTime';
import * as progressApi from '../../../src/api/progress';
import * as sessionsApi from '../../../src/api/sessions';
import * as libraryApi from '../../../src/api/library';
import * as tagsApi from '../../../src/api/tags';
import { BookTagKey } from '../../../src/constants/bookTags';

export default function BookDetailScreen() {
  const { userBookId } = useLocalSearchParams<{ userBookId: string }>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userBook, isLoading } = useBookDetail(userBookId!);
  const deleteBookMutation = useDeleteUserBook();
  const [modalVisible, setModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [savingRecommend, setSavingRecommend] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const { toast, showToast } = useToast();

  const timerReset = useTimerStore((s) => s.reset);
  const timerBookId = useTimerStore((s) => s.userBookId);
  const timerIsRunning = useTimerStore((s) => s.isRunning);

  // Si el libro cambia a FINISHED y el timer sigue corriendo para este libro,
  // lo reseteamos — evita que el store persistido muestre un timer activo.
  useEffect(() => {
    if (userBook?.status === 'FINISHED' && timerBookId === userBookId && timerIsRunning) {
      timerReset();
    }
  }, [userBook?.status, timerBookId, timerIsRunning]);

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
            } catch {
              showToast(t('common.unknownError'), 'error');
            }
          },
        },
      ]
    );
  };

  const handleRegisterPages = async (pages: number) => {
    const pc = userBook?.book.pageCount ?? 0;
    const cp = userBook?.currentPage ?? 0;
    const willFinish = pc > 0 && (cp + pages >= pc);
    await progressApi.createProgress(userBookId!, pages);
    queryClient.invalidateQueries({ queryKey: ['library'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    showToast(willFinish ? t('bookDetail.bookFinished') : t('bookDetail.progressSaved'), 'success');
  };

  const handleManualTime = async (totalMinutes: number) => {
    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - totalMinutes * 60000);
    await sessionsApi.createSession(
      userBookId!,
      startedAt.toISOString(),
      endedAt.toISOString()
    );
    queryClient.invalidateQueries({ queryKey: ['library'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-activity'] });
    showToast(t('bookDetail.timeSaved'), 'success');
  };

  const handleRecommend = async (value: boolean) => {
    setSavingRecommend(true);
    try {
      await libraryApi.updateUserBook(userBookId!, { recommended: value });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
    } catch {
      showToast(t('common.unknownError'), 'error');
    } finally {
      setSavingRecommend(false);
    }
  };

  const handleTagToggle = async (tag: BookTagKey) => {
    const currentTags = (bookTags ?? []).map((t) => t.tag);
    const next = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    if (next.length > 2) return;
    setSavingTags(true);
    try {
      await tagsApi.setTags(userBookId!, next);
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
    } catch {
      showToast(t('common.unknownError'), 'error');
    } finally {
      setSavingTags(false);
    }
  };

  const handleTimerStop = async (startedAt: number, endedAt: number) => {
    if (endedAt - startedAt < 60000) return;
    try {
      await sessionsApi.createSession(
        userBookId!,
        new Date(startedAt).toISOString(),
        new Date(endedAt).toISOString()
      );
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-activity'] });
    } catch {
      showToast(t('common.failedSaveSession'), 'error');
    }
  };

  if (isLoading || !userBook) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accentPrimary} />
      </SafeAreaView>
    );
  }

  const { book, currentPage, totalMinutes, status, readingSessions, bookTags } = userBook;
  const pageCount = book.pageCount || 0;
  const progress = pageCount > 0 ? currentPage / pageCount : 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <Toast toast={toast} />
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
            <View style={[styles.cover, { backgroundColor: theme.bgTertiary }]} />
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
            {pageCount > 0
              ? `${currentPage} / ${pageCount} ${t('library.pages')} (${Math.round(progress * 100)}%)`
              : `${currentPage} ${t('library.pages')}`}
          </Text>
        </View>

        {/* Timer — oculto cuando el libro está terminado */}
        {status !== 'FINISHED' && (
          <TimerDisplay userBookId={userBookId!} onStop={handleTimerStop} />
        )}

        <View style={[styles.card, { borderColor: theme.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 8 }]}>
            {t('bookDetail.totalTime')}
          </Text>
          <Text style={[styles.totalTimeValue, { color: theme.textSecondary }]}>
            {formatMinutes(totalMinutes)}
          </Text>
          <TouchableOpacity onPress={() => setTimeModalVisible(true)} style={{ marginTop: 10 }}>
            <Text style={[styles.registerBtn, { color: theme.accentPrimary }]}>
              {t('bookDetail.registerTime')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recomendación — solo cuando el libro está terminado */}
        {status === 'FINISHED' && (
          <View style={[styles.card, { borderColor: theme.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 16 }]}>
              {t('bookDetail.recommendTitle')}
            </Text>
            <View style={styles.recommendRow}>
              <TouchableOpacity
                style={[styles.recommendBtn, { borderColor: '#2D7A3A', overflow: 'hidden' }]}
                onPress={() => handleRecommend(true)}
                disabled={savingRecommend}
                activeOpacity={0.7}
              >
                {userBook.recommended === true ? (
                  <LinearGradient
                    colors={['#1b5e20', '#4caf50']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.recommendBtnInner}
                  >
                    <Text style={[styles.recommendBtnText, { color: '#fff' }]}>
                      👍  {t('bookDetail.recommendYes')}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={[styles.recommendBtnText, { color: '#2D7A3A' }]}>
                    👍  {t('bookDetail.recommendYes')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.recommendBtn, { borderColor: '#A0272A', overflow: 'hidden' }]}
                onPress={() => handleRecommend(false)}
                disabled={savingRecommend}
                activeOpacity={0.7}
              >
                {userBook.recommended === false ? (
                  <LinearGradient
                    colors={['#7f0000', '#A0272A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.recommendBtnInner}
                  >
                    <Text style={[styles.recommendBtnText, { color: '#fff' }]}>
                      👎  {t('bookDetail.recommendNo')}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={[styles.recommendBtnText, { color: '#A0272A' }]}>
                    👎  {t('bookDetail.recommendNo')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tags — solo cuando el libro está terminado y recomendado */}
        {status === 'FINISHED' && userBook.recommended === true && (
          <TagSelector
            selected={(bookTags ?? []).map((t) => t.tag)}
            saving={savingTags}
            onToggle={handleTagToggle}
          />
        )}

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

      <RegisterTimeModal
        visible={timeModalVisible}
        onClose={() => setTimeModalVisible(false)}
        onSave={handleManualTime}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
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
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  registerBtn: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
  },
  totalTimeValue: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 4,
  },
  recommendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendBtnInner: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -12,
    paddingVertical: 12,
  },
  recommendBtnText: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
