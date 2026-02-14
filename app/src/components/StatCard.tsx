import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface StatCardProps {
  value: string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
      <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '48%',
  },
  value: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
  },
});
