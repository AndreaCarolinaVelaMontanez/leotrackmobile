import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../theme/ThemeContext';

interface ChartData {
  date: string;
  minutes: number;
  pages: number;
}

interface StatsBarChartProps {
  data: ChartData[];
}

export function StatsBarChart({ data }: StatsBarChartProps) {
  const { theme } = useTheme();

  const barData = data.map((d) => ({
    value: d.pages,
    label: d.date.slice(5), // MM-DD
    frontColor: theme.accentPrimary,
    topLabelComponent: undefined,
  }));

  if (barData.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
      <BarChart
        data={barData}
        barWidth={barData.length > 14 ? 12 : 22}
        spacing={barData.length > 14 ? 6 : 12}
        roundedTop
        roundedBottom={false}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={0}
        xAxisLabelTextStyle={{ color: theme.textTertiary, fontSize: 10 }}
        yAxisTextStyle={{ color: theme.textTertiary, fontSize: 10 }}
        hideRules
        barBorderRadius={4}
        height={150}
        isAnimated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    paddingLeft: 8,
    marginBottom: 24,
  },
});
