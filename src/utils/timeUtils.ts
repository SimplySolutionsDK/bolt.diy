export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0')
  ];

  return parts.join(':');
}

export function formatHoursToTime(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (wholeHours === 0) {
    return `${minutes}m`;
  }
  
  return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
}

export const TIME_INTERVALS = [
  { value: 0.25, label: '15 minutes' },
  { value: 0.50, label: '30 minutes' },
  { value: 0.75, label: '45 minutes' }, 
  { value: 1, label: '1 hour' },
  { value: 1.25, label: '1 hour 15 minutes' },
  { value: 1.5, label: '1.5 hours' },
  { value: 1.75, label: '1 hour 45 minutes' },
  { value: 2, label: '2 hours' },
  { value: 2.25, label: '2 hours 15 minutes' },
  { value: 2.5, label: '2 hours 30 minutes' },
  { value: 2.75, label: '2 hours 45 minutes' },
  { value: 3, label: '3 hours' },
  { value: 3.25, label: '3 hours 15 minutes' },
  { value: 3.5, label: '3 hours 30 minutes' },
  { value: 3.75, label: '3 hours 45 minutes' },
  { value: 4, label: '4 hours' },
  { value: 4.25, label: '4 hours 15 minutes' },
  { value: 4.5, label: '4 hours 30 minutes' },
  { value: 4.75, label: '4 hours 45 minutes' },
  { value: 5, label: '5 hours' },
  { value: 5.25, label: '5 hours 15 minutes' },
  { value: 5.5, label: '5 hours 30 minutes' },
  { value: 5.75, label: '5 hours 45 minutes' },
  { value: 6, label: '6 hours' },
  { value: 6.25, label: '6 hours 15 minutes' },
  { value: 6.5, label: '6 hours 30 minutes' },
  { value: 6.75, label: '6 hours 45 minutes' },
  { value: 7, label: '7 hours' },
  { value: 7.25, label: '7 hours 15 minutes' },
  { value: 7.5, label: '7 hours 30 minutes' },
  { value: 7.75, label: '7 hours 45 minutes' },
  { value: 8, label: '8 hours' },
] as const;

export function findNearestTimeInterval(hours: number): number {
  // Ensure minimum of 5 minutes (0.083 hours)
  if (hours < 0.083) {
    return 0.083;
  }
  
  return TIME_INTERVALS.reduce((prev, curr) => {
    return Math.abs(curr.value - hours) < Math.abs(prev.value - hours) ? curr : prev;
  }).value;
}