import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0-1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const { theme } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.track, { backgroundColor: theme.bgTertiary }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: theme.accentPrimary,
            width: `${clampedProgress * 100}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
