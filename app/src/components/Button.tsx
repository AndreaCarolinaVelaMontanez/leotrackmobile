import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

const GRADIENT_COLORS: [string, string, string] = ['#2a0040', '#490a66', '#7a2d99'];

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();

  const buttonStyles: ViewStyle[] = [styles.base];
  const labelStyles: TextStyle[] = [styles.label];

  switch (variant) {
    case 'primary':
      buttonStyles.push({ backgroundColor: theme.accentPrimary });
      labelStyles.push({ color: '#FFFFFF' });
      break;
    case 'secondary':
      buttonStyles.push({ backgroundColor: theme.bgTertiary });
      labelStyles.push({ color: theme.textPrimary });
      break;
    case 'text':
      buttonStyles.push({ backgroundColor: 'transparent', paddingVertical: 8 });
      labelStyles.push({ color: theme.accentPrimary });
      break;
    case 'outline':
      buttonStyles.push({ backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.borderColor });
      labelStyles.push({ color: theme.textPrimary });
      break;
  }

  if (disabled || loading) {
    buttonStyles.push({ opacity: 0.6 });
  }

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[{ borderRadius: 8, overflow: 'hidden' }, style, disabled || loading ? { opacity: 0.6 } : {}]}
      >
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.base}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[...labelStyles, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[...buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={theme.accentPrimary}
          size="small"
        />
      ) : (
        <Text style={[...labelStyles, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
