import { LucideIcon } from 'lucide-react';

export interface StatItem {
  title: keyof typeof import('@/utils/translations').translations.en.nav;
  value: number | string;
  icon: LucideIcon;
  color: string;
}