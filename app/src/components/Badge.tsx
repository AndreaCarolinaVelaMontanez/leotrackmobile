import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { ReadingStatus } from '../types';

interface BadgeProps {
  status: ReadingStatus;
}

const statusKeys: Record<ReadingStatus, string> = {
  READING: 'library.reading',
  FINISHED: 'library.finished',
  WISHLIST: 'library.wishlist',
  ABANDONED: 'library.abandoned',
};

export function Badge({ status }: BadgeProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const badgeKey = `badge${status.charAt(0) + status.slice(1).toLowerCase()}` as
    | 'badgeReading'
    | 'badgeFinished'
    | 'badgeWishlist'
    | 'badgeAbandoned';

  const colors = theme[badgeKey];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {t(statusKeys[status])}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
