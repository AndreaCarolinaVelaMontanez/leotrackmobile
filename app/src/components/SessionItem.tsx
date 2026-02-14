import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ReadingSession } from '../types';
import { formatSessionDate } from '../utils/formatDate';
import { formatMinutes } from '../utils/formatTime';

interface SessionItemProps {
  session: ReadingSession;
  isLast?: boolean;
}

export function SessionItem({ session, isLast }: SessionItemProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.item,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.borderColor },
      ]}
    >
      <Text style={[styles.date, { color: theme.textSecondary }]}>
        {formatSessionDate(session.startedAt)}
      </Text>
      <Text style={[styles.duration, { color: theme.textPrimary }]}>
        {formatMinutes(session.durationMinutes)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  date: {
    fontSize: 14,
  },
  duration: {
    fontSize: 14,
    fontWeight: '500',
  },
});
