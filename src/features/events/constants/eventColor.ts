export const EVENT_COLORS = {
  primary: '#3366FF',
  team: '#0EA5A5',
  personal: '#8B5CF6',
  reminder: '#F59E0B',
  danger: '#F43F5E',
} as const

export type EventColor =
  (typeof EVENT_COLORS)[keyof typeof EVENT_COLORS]