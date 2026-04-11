import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const GRADIENT: [string, string, string] = ['#2a0040', '#490a66', '#7a2d99'];
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useExplore } from '../src/hooks/useExplore';
import { EmptyState } from '../src/components/EmptyState';
import { ExploreBook } from '../src/types';
import { VALID_TAGS, BookTagKey } from '../src/constants/bookTags';

type ViewMode = 'category' | 'rating';

function BookCover({ book, size = 'sm' }: { book: ExploreBook; size?: 'sm' | 'md' }) {
  const { theme } = useTheme();
  const dim = size === 'md' ? { width: 80, height: 108 } : { width: 52, height: 70 };
  const radius = size === 'md' ? 8 : 6;

  if (book.coverUrl) {
    return (
      <Image
        source={{ uri: book.coverUrl }}
        style={[dim, { borderRadius: radius }]}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={[
        dim,
        {
          borderRadius: radius,
          backgroundColor: theme.bgTertiary,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Ionicons name="book-outline" size={size === 'md' ? 22 : 16} color={theme.accentPrimary} />
    </View>
  );
}

export default function ExploreRecommendationsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeRatingFilter, setActiveRatingFilter] = useState<string>('all');

  const { data, isLoading } = useExplore();

  const categories = data?.byCategory ?? [];
  const ratings = data?.byRating ?? [];
  const topBooks = data?.topBooks ?? [];

  const categoryFilters = ['all', ...categories.map((c) => c.name)];
  const ratingFilters = ['all', ...ratings.map((r) => r.tag)];

  const filteredCategories =
    activeCategoryFilter === 'all'
      ? categories
      : categories.filter((c) => c.name === activeCategoryFilter);

  const filteredRatings =
    activeRatingFilter === 'all'
      ? ratings
      : ratings.filter((r) => r.tag === activeRatingFilter);

  const hasData = topBooks.length > 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {t('explore.title')}
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {t('explore.subtitle')}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accentPrimary} />
      ) : !hasData ? (
        <EmptyState
          icon="people-outline"
          title={t('explore.emptyTitle')}
          text={t('explore.emptyText')}
        />
      ) : (
        <>
          {/* Toggle */}
          <View style={[styles.modeToggle, { backgroundColor: theme.bgSecondary, borderColor: theme.borderColor }]}>
            <TouchableOpacity
              style={[styles.modeBtn, { overflow: 'hidden' }]}
              onPress={() => setViewMode('category')}
              activeOpacity={0.8}
            >
              {viewMode === 'category' ? (
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modeBtnInner}>
                  <Text style={[styles.modeBtnText, { color: '#fff' }]}>{t('explore.byCategory')}</Text>
                </LinearGradient>
              ) : (
                <Text style={[styles.modeBtnText, { color: theme.textSecondary }]}>{t('explore.byCategory')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, { overflow: 'hidden' }]}
              onPress={() => setViewMode('rating')}
              activeOpacity={0.8}
            >
              {viewMode === 'rating' ? (
                <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modeBtnInner}>
                  <Text style={[styles.modeBtnText, { color: '#fff' }]}>{t('explore.byRating')}</Text>
                </LinearGradient>
              ) : (
                <Text style={[styles.modeBtnText, { color: theme.textSecondary }]}>{t('explore.byRating')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Pills filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillsScroll}
            contentContainerStyle={styles.pillsContainer}
          >
            {(viewMode === 'category' ? categoryFilters : ratingFilters).map((filter) => {
              const isActive =
                viewMode === 'category'
                  ? activeCategoryFilter === filter
                  : activeRatingFilter === filter;
              const label =
                filter === 'all'
                  ? t('explore.all')
                  : viewMode === 'rating'
                  ? t(`bookTags.${filter as BookTagKey}`)
                  : filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.pill,
                    { borderColor: isActive ? '#490a66' : theme.borderColor, overflow: 'hidden' },
                  ]}
                  onPress={() =>
                    viewMode === 'category'
                      ? setActiveCategoryFilter(filter)
                      : setActiveRatingFilter(filter)
                  }
                  activeOpacity={0.7}
                >
                  {isActive ? (
                    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pillInner}>
                      <Text style={[styles.pillText, { color: '#fff' }]}>{label}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={[styles.pillText, { color: theme.textSecondary }]}>{label}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Top recomendados */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {t('explore.topRecommended')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topRow}
            >
              {topBooks.map((book) => (
                <View key={book.bookId} style={[styles.topCard, { backgroundColor: theme.bgSecondary, borderColor: theme.borderColor }]}>
                  <BookCover book={book} size="md" />
                  <View style={styles.topCardInfo}>
                    <Text style={[styles.topCardTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                      {book.title}
                    </Text>
                    <Text style={[styles.topCardAuthor, { color: theme.textSecondary }]} numberOfLines={1}>
                      {book.author}
                    </Text>
                    <View style={[styles.recBadge, { backgroundColor: `${theme.accentPrimary}20` }]}>
                      <Ionicons name="thumbs-up" size={10} color={theme.accentPrimary} />
                      <Text style={[styles.recBadgeText, { color: theme.accentPrimary }]}>
                        {book.recCount}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Vista: Por categoría */}
            {viewMode === 'category' && (
              <>
                {filteredCategories.map((cat) => (
                  <View key={cat.name}>
                    <View style={styles.catHeader}>
                      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        {cat.name}
                      </Text>
                      <View style={[styles.recCountBadge, { backgroundColor: `${theme.accentPrimary}15` }]}>
                        <Text style={[styles.recCountText, { color: theme.accentPrimary }]}>
                          {cat.recCount} {t('explore.recs')}
                        </Text>
                      </View>
                    </View>
                    {cat.books.map((book, idx) => (
                      <View
                        key={book.bookId}
                        style={[
                          styles.bookRow,
                          {
                            borderBottomColor: theme.borderColor,
                            borderBottomWidth: idx < cat.books.length - 1 ? 1 : 0,
                          },
                        ]}
                      >
                        <Text style={[styles.rankNum, { color: theme.accentPrimary }]}>
                          #{idx + 1}
                        </Text>
                        <BookCover book={book} size="sm" />
                        <View style={styles.bookRowInfo}>
                          <Text style={[styles.bookRowTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                            {book.title}
                          </Text>
                          <Text style={[styles.bookRowAuthor, { color: theme.textSecondary }]} numberOfLines={1}>
                            {book.author}
                          </Text>
                          <View style={styles.bookRowTags}>
                            {book.tags.slice(0, 2).map((tag) => (
                              <View key={tag} style={[styles.tagChip, { backgroundColor: `${theme.accentPrimary}15`, borderColor: `${theme.accentPrimary}30` }]}>
                                <Text style={[styles.tagChipText, { color: theme.accentPrimary }]} numberOfLines={1}>
                                  {t(`bookTags.${tag as BookTagKey}`)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                        <View style={styles.bookRowCount}>
                          <Text style={[styles.bookRowCountNum, { color: theme.accentPrimary }]}>
                            {book.recCount}
                          </Text>
                          <Text style={[styles.bookRowCountLabel, { color: theme.textTertiary }]}>
                            {t('explore.recs')}
                          </Text>
                        </View>
                      </View>
                    ))}
                    <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                  </View>
                ))}
              </>
            )}

            {/* Vista: Por calificación */}
            {viewMode === 'rating' && (
              <>
                {filteredRatings.map((rating) => (
                  <View key={rating.tag} style={[styles.ratingCard, { backgroundColor: theme.bgSecondary, borderColor: theme.borderColor }]}>
                    <View style={styles.ratingCardHeader}>
                      <View style={[styles.ratingIconBox, { backgroundColor: `${theme.accentPrimary}15`, borderColor: `${theme.accentPrimary}25` }]}>
                        <Ionicons name="star" size={16} color={theme.accentPrimary} />
                      </View>
                      <Text style={[styles.ratingPhrase, { color: theme.textPrimary }]} numberOfLines={2}>
                        {t(`bookTags.${rating.tag as BookTagKey}`)}
                      </Text>
                      <Text style={[styles.ratingCount, { color: theme.accentPrimary }]}>
                        {rating.recCount} {t('explore.books')}
                      </Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.ratingBooks}
                    >
                      {rating.books.map((book) => (
                        <View key={book.bookId} style={styles.ratingBookItem}>
                          <BookCover book={book} size="sm" />
                          <Text style={[styles.ratingBookTitle, { color: theme.textSecondary }]} numberOfLines={2}>
                            {book.title}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center' },
  headerSub: { fontSize: 12, marginTop: 1 },
  modeToggle: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeBtnInner: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -9,
    paddingVertical: 9,
  },
  modeBtnText: { fontSize: 13, fontWeight: '600' },
  pillsScroll: { marginTop: 12, flexGrow: 0 },
  pillsContainer: { paddingHorizontal: 16, gap: 8, paddingBottom: 4, alignItems: 'center' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillInner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -14,
    marginVertical: -6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: { fontSize: 12, fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  topRow: { gap: 10, paddingBottom: 16 },
  topCard: {
    width: 120,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  topCardInfo: { gap: 3 },
  topCardTitle: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  topCardAuthor: { fontSize: 11 },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  recBadgeText: { fontSize: 11, fontWeight: '600' },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  recCountText: { fontSize: 11, fontWeight: '600' },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  rankNum: { fontSize: 12, fontWeight: '700', width: 24 },
  bookRowInfo: { flex: 1, gap: 2 },
  bookRowTitle: { fontSize: 13, fontWeight: '600' },
  bookRowAuthor: { fontSize: 11 },
  bookRowTags: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  tagChip: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 160,
  },
  tagChipText: { fontSize: 10, fontWeight: '500' },
  bookRowCount: { alignItems: 'center' },
  bookRowCountNum: { fontSize: 14, fontWeight: '700' },
  bookRowCountLabel: { fontSize: 9 },
  divider: { height: 1, marginVertical: 16 },
  ratingCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  ratingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    paddingBottom: 10,
  },
  ratingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ratingPhrase: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },
  ratingCount: { fontSize: 11, fontWeight: '600', flexShrink: 0 },
  ratingBooks: { gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  ratingBookItem: { width: 52, gap: 4 },
  ratingBookTitle: { fontSize: 9, lineHeight: 12, textAlign: 'center' },
});
