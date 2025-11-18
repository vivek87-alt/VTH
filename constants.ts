import { HabitDefinition } from './types';

export const PREDEFINED_HABITS: HabitDefinition[] = [
  // Quitting / Detox
  { id: 'quit-porn', name: 'Quit Porn', category: 'quitting' },
  { id: 'quit-vaping', name: 'Quit Vaping', category: 'quitting' },
  { id: 'quit-smoking', name: 'Quit Smoking', category: 'quitting' },
  { id: 'quit-alcohol', name: 'Quit Alcohol', category: 'quitting' },
  { id: 'quit-weed', name: 'Quit Weed', category: 'quitting' },
  { id: 'quit-caffeine', name: 'Quit Caffeine', category: 'quitting' },
  { id: 'quit-overspending', name: 'Quit Overspending', category: 'quitting' },
  { id: 'stop-social-media', name: 'Stop Social Media', category: 'quitting' },
  { id: 'addiction-counter', name: 'General Addiction Counter', category: 'quitting' },
  { id: 'detox-counter', name: 'Detox Counter', category: 'quitting' },
  
  // Health & Fitness
  { id: 'fasting', name: 'Fasting', category: 'health' },
  { id: 'ranked-gym', name: 'Ranked Gym', category: 'health' },
  { id: 'weight-loss', name: 'Weight Loss', category: 'health' },
  { id: 'muscle-gain', name: 'Muscle Gain', category: 'health' },
  { id: 'healthy-eating', name: 'Healthy Eating', category: 'health' },
  { id: 'ranked-testo', name: 'Ranked Testo Maxing', category: 'health' },
  
  // Mental Health
  { id: 'anxiety-relief', name: 'Anxiety Relief', category: 'mental' },
  { id: 'depression', name: 'Manage Depression', category: 'mental' },
  { id: 'mens-mental-health', name: 'Men\'s Mental Health', category: 'mental' },
  { id: 'mindfulness', name: 'Mindfulness & Meditation', category: 'mental' },
  { id: 'gratitude', name: 'Gratitude Journal', category: 'mental' },
  { id: 'self-love', name: 'Self-Love & Confidence', category: 'mental' },
  { id: 'stress-relief', name: 'Stress Relief', category: 'mental' },
  
  // Productivity
  { id: 'procrastination', name: 'Beat Procrastination', category: 'productivity' },
  { id: 'build-discipline', name: 'Build Discipline', category: 'productivity' },
  { id: 'focus-deep-work', name: 'Focus & Deep Work', category: 'productivity' },
  { id: 'study-habits', name: 'Study Habits', category: 'productivity' },
  
  // Lifestyle
  { id: 'pregnancy', name: 'Pregnancy Tracker', category: 'lifestyle' },
  { id: 'daily-motivation', name: 'Daily Motivation', category: 'lifestyle' },
  { id: 'morning-routine', name: 'Morning Routine', category: 'lifestyle' },
  { id: 'night-routine', name: 'Night Routine', category: 'lifestyle' },
  { id: 'relationship', name: 'Relationship Goals', category: 'lifestyle' },
];