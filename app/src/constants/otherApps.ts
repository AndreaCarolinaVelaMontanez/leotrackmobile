export interface OtherApp {
  id: string;
  name: string;
  taglineEs: string;
  taglineEn: string;
  color: string;
  icon: string;
  url: string;
  comingSoon?: boolean;
}

export const OTHER_APPS: OtherApp[] = [
  {
    id: 'mountlion',
    name: 'MountLion',
    taglineEs: 'Desarrolla hábitos, potencia tu vida',
    taglineEn: 'Build habits, power your life',
    color: '#2D7A3A',
    icon: 'lion',
    url: 'https://play.google.com/store',
    comingSoon: false,
  },
  {
    id: 'budgetpeak',
    name: 'BudgetPeak',
    taglineEs: 'Control inteligente de gastos',
    taglineEn: 'Smart expense tracking',
    color: '#B8650A',
    icon: 'wallet-outline',
    url: 'https://play.google.com/store',
    comingSoon: true,
  },
  {
    id: 'pulsetrack',
    name: 'PulseTrack',
    taglineEs: 'Entrena. Mide. Mejora.',
    taglineEn: 'Train. Measure. Improve.',
    color: '#A0272A',
    icon: 'pulse-outline',
    url: 'https://play.google.com/store',
    comingSoon: true,
  },
  {
    id: 'flowdesk',
    name: 'FlowDesk',
    taglineEs: 'Foco y productividad personal',
    taglineEn: 'Focus and personal productivity',
    color: '#1A4F8A',
    icon: 'bulb-outline',
    url: 'https://play.google.com/store',
    comingSoon: true,
  },
];
