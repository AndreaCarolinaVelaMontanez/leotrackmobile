import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useLibraryList } from '../src/hooks/useLibrary';
import { EmptyState } from '../src/components/EmptyState';
import { UserBook } from '../src/types';

export default function MyRecommendationsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useLibraryList('FINISHED', undefined, 1, 100);

  const rated = (data?.books ?? []).filter((b) => b.recommended === true) as (UserBook & { recommended: boolean })[];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('settings.myRecommendations')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accentPrimary} />
      ) : (
        <FlatList
          data={rated}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: theme.borderColor }]}>
              {item.book.coverUrl ? (
                <Image source={{ uri: item.book.coverUrl }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, { backgroundColor: theme.bgTertiary }]} />
              )}
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
                  {item.book.title}
                </Text>
                <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.book.author}
                </Text>
                {item.book.category ? (
                  <Text style={[styles.category, { color: theme.textTertiary }]} numberOfLines={1}>
                    {item.book.category}
                  </Text>
                ) : null}
                <View style={[styles.badge, { backgroundColor: `${theme.accentPrimary}18` }]}>
                  <Text style={[styles.badgeText, { color: theme.accentPrimary }]}>
                    👍  {t('bookDetail.recommendYes')}
                  </Text>
                </View>

                {item.bookTags && item.bookTags.length > 0 && (
                  <View style={styles.tags}>
                    {item.bookTags.map((bt) => (
                      <View key={bt.id} style={[styles.tag, { borderColor: theme.borderColor }]}>
                        <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                          {t(`bookTags.${bt.tag}`)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title={t('myRecommendations.emptyTitle')}
              text={t('myRecommendations.emptyText')}
            />
          }
        />
      )}
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
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  list: {
    padding: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  cover: {
    width: 60,
    height: 90,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  author: {
    fontSize: 13,
  },
  category: {
    fontSize: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
  },
});
