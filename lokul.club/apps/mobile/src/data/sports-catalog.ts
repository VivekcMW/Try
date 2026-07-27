// Static sports catalog — sport list, skill levels, and availability days are
// reference data (not user-generated content), so they live here rather than
// as backend models.

export type LeagueStatus = 'registering' | 'ongoing' | 'completed';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SportOption {
  id: string;
  name: string;
  color: string;
}

export const SPORTS: SportOption[] = [
  { id: 'cricket', name: 'Cricket', color: '#22C55E' },
  { id: 'football', name: 'Football', color: '#3B82F6' },
  { id: 'badminton', name: 'Badminton', color: '#EF4444' },
  { id: 'tennis', name: 'Tennis', color: '#F59E0B' },
  { id: 'basketball', name: 'Basketball', color: '#8B5CF6' },
  { id: 'running', name: 'Running', color: '#EC4899' },
  { id: 'cycling', name: 'Cycling', color: '#14B8A6' },
  { id: 'swimming', name: 'Swimming', color: '#0EA5E9' },
  { id: 'table-tennis', name: 'Table Tennis', color: '#F97316' },
  { id: 'volleyball', name: 'Volleyball', color: '#6366F1' },
  { id: 'chess', name: 'Chess', color: '#64748B' },
  { id: 'yoga', name: 'Yoga', color: '#A855F7' },
  { id: 'hiking', name: 'Hiking', color: '#84CC16' },
  { id: 'kabaddi', name: 'Kabaddi', color: '#D97706' },
];

export const SKILL_LEVELS: { id: SkillLevel; label: string; color: string }[] = [
  { id: 'beginner', label: 'Beginner', color: '#22C55E' },
  { id: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
  { id: 'advanced', label: 'Advanced', color: '#EF4444' },
];

export const AVAILABILITY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const LEAGUE_STATUS_META: Record<LeagueStatus, { label: string; color: string; bg: string }> = {
  registering: { label: 'Registering', color: '#065f46', bg: '#D1FAE5' },
  ongoing: { label: 'Ongoing', color: '#92400e', bg: '#FEF3C7' },
  completed: { label: 'Completed', color: '#475569', bg: '#f8fafc' },
};
