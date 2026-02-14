import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { useTimer } from '../hooks/useTimer';
import { useTimerStore } from '../stores/timerStore';
import { formatTimer } from '../utils/formatTime';

interface TimerDisplayProps {
  userBookId: string;
  onStop: (startedAt: number, endedAt: number) => void;
}

export function TimerDisplay({ userBookId, onStop }: TimerDisplayProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const elapsed = useTimer();
  const { isRunning, isPaused, start, pause, resume, stop, reset, userBookId: activeBookId } = useTimerStore();

  const isThisBook = activeBookId === userBookId;
  const isActive = isRunning && isThisBook;

  const handleStart = () => start(userBookId);

  const handleStop = () => {
    const result = stop();
    if (result) {
      onStop(result.startedAt, result.endedAt);
    }
  };

  const statusText = isActive
    ? isPaused
      ? t('bookDetail.paused')
      : t('bookDetail.running')
    : t('bookDetail.stopped');

  return (
    <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
      <Text style={[styles.status, { color: theme.textSecondary }]}>
        {isActive && !isPaused ? '● ' : ''}{statusText}
      </Text>
      <Text style={[styles.timer, { color: theme.textPrimary }]}>
        {formatTimer(isActive ? elapsed : 0)}
      </Text>
      {isRunning && !isThisBook && (
        <>
          <Text style={[styles.warning, { color: theme.warning }]}>
            {t('bookDetail.timerActiveOther')}
          </Text>
          <Button
            title={t('bookDetail.resetTimer')}
            onPress={reset}
            variant="secondary"
            style={{ marginBottom: 12, width: '100%' }}
          />
        </>
      )}
      <View style={styles.controls}>
        {!isActive ? (
          <Button
            title={t('bookDetail.start')}
            onPress={handleStart}
            disabled={isRunning && !isThisBook}
          />
        ) : (
          <>
            {isPaused ? (
              <Button
                title={t('bookDetail.resume')}
                onPress={resume}
                variant="secondary"
                style={{ flex: 1 }}
              />
            ) : (
              <Button
                title={t('bookDetail.pause')}
                onPress={pause}
                variant="secondary"
                style={{ flex: 1 }}
              />
            )}
            <Button
              title={t('bookDetail.stop')}
              onPress={handleStop}
              variant="secondary"
              style={{ flex: 1 }}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 24,
  },
  status: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: 2,
    marginBottom: 24,
    fontVariant: ['tabular-nums'],
  },
  warning: {
    fontSize: 12,
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});
