import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface StatCardProps {
  value: string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary, borderColor: theme.borderColor }]}>
      <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '48%',
  },
  value: {
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: 2,
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
