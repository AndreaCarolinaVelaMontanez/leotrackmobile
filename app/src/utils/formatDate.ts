export function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (dateDay.getTime() === today.getTime()) {
    return `Today, ${time}`;
  }
  if (dateDay.getTime() === yesterday.getTime()) {
    return `Yesterday, ${time}`;
  }
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}
