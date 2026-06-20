/**
 * Achievement definitions and utility checking functions
 */

export const ACHIEVEMENTS = [
  {
    id: 'first_set',
    title: 'First Step taken',
    description: 'Generated your first interview set',
    icon: '🏆',
    color: 'from-amber-400 to-orange-500',
    check: (stats) => stats.sessionsGenerated >= 1,
  },
  {
    id: 'complete_10',
    title: 'Warm Up',
    description: 'Completed 10 interview questions',
    icon: '🔥',
    color: 'from-blue-400 to-indigo-600',
    check: (stats) => stats.completedCount >= 10,
  },
  {
    id: 'complete_25',
    title: 'Rising Star',
    description: 'Completed 25 interview questions',
    icon: '⚡',
    color: 'from-green-400 to-emerald-600',
    check: (stats) => stats.completedCount >= 25,
  },
  {
    id: 'complete_50',
    title: 'Interview Ace',
    description: 'Completed 50 interview questions',
    icon: '👑',
    color: 'from-purple-500 to-pink-600',
    check: (stats) => stats.completedCount >= 50,
  },
  {
    id: 'save_5',
    title: 'Organized Prep',
    description: 'Saved 5 interview sessions',
    icon: '📁',
    color: 'from-cyan-400 to-blue-600',
    check: (stats) => stats.savedSessionsCount >= 5,
  },
  {
    id: 'bookmark_20',
    title: 'Knowledge Vault',
    description: 'Bookmarked 20 key questions',
    icon: '💾',
    color: 'from-rose-400 to-red-600',
    check: (stats) => stats.bookmarksCount >= 20,
  },
];

/**
 * Checks stats against all achievements and returns array of newly unlocked achievement ids
 * @param {object} stats User stats { completedCount, sessionsGenerated, savedSessionsCount, bookmarksCount }
 * @param {string[]} unlockedIds Array of already unlocked achievement ids
 * @returns {string[]} New list of unlocked achievement ids
 */
export function checkAchievements(stats, unlockedIds = []) {
  const newlyUnlocked = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (!unlockedIds.includes(achievement.id)) {
      if (achievement.check(stats)) {
        newlyUnlocked.push(achievement.id);
      }
    }
  });
  
  return newlyUnlocked;
}
