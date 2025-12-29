
import { Achievement, LeagueUser, FeedPost } from '../types';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'wildfire', title: 'Wildfire', description: 'Reach a 7-day streak', level: 1, maxLevel: 3, progress: 0, target: 7, icon: '🔥', color: 'bg-orange-500' },
  { id: 'sage', title: 'Sage', description: 'Earn 1000 XP', level: 1, maxLevel: 5, progress: 0, target: 1000, icon: '🧙‍♂️', color: 'bg-purple-500' }
];

export const LEAGUE_DATA: LeagueUser[] = [
  { rank: 1, name: 'Sarah K.', xp: 3200, streak: 50, status: 'same', avatarEmoji: '👩' },
  { rank: 2, name: 'Mike R.', xp: 3150, streak: 48, status: 'up', avatarEmoji: '🧔' }
];

export const FEED_POSTS: FeedPost[] = [
  { id: 1, author: 'Sarah K.', role: 'Guide', content: 'Just hit 2 years sober! Grateful for this community.', type: 'milestone', likes: 24, time: '2h ago' },
  { id: 2, author: 'Mike R.', role: 'Builder', content: 'Anyone hitting the gym today? Moving the body helps the mind.', type: 'text', likes: 12, time: '4h ago' }
];
