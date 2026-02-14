import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatMinutes } from '../utils/formatTime';

const CATEGORY_COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
  ['#a18cd1', '#fbc2eb'],
];

interface CategoryItemProps {
  name: string;
  minutes: number;
  index: number;
}

export function CategoryItem({ name, minutes, index }: CategoryItemProps) {
  const { theme } = useTheme();
  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length][0];

  return (
    <View style={styles.item}>
      <View style={[styles.colorDot, { backgroundColor: color }]} />
      <Text style={[styles.name, { color: theme.textPrimary }]}>{name}</Text>
      <Text style={[styles.count, { color: theme.textSecondary }]}>
        {formatMinutes(minutes)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
  },
});
