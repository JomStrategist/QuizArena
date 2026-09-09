/**
 * Central Leaderboard Animation Configuration System
 * Allows timings, staggers, reveal sequences, and audio behavior to be edited
 * cleanly or overridden by backend/settings in the future.
 */

export interface ILeaderboardAnimationConfig {
  // Intermediate Leaderboard (After Every Question)
  intermediate: {
    enabled: boolean;
    timerDurationSec?: number;
    containerDurationMs: number; // Entrance animation duration (400-600ms)
    rowStaggerMs: number; // Stagger delay per row (50-100ms)
    maxRowStaggerMs: number; // Cap for large participant counts
    scoreAnimationDurationMs: number; // Count-up number transition (600-800ms)
    rankMovementDurationMs: number; // FLIP row sliding animation (500-700ms)
    accuracyAnimationDurationMs: number; // Progress bar width fill (400-600ms)
    highlightDurationMs: number; // Affected participant pulse glow (700-1200ms)
    previousScoreboardPhaseMs: number; // Phase 1: Show initial scores before points added (1200ms)
    countingPointsPhaseMs: number; // Phase 2: Animated points count-up (1500ms)
    reorderingPhaseMs: number; // Phase 3: FLIP row re-sorting (1200ms)
    emojiRevealPhaseMs: number; // Phase 4: Cartoon emoji reveal & sunglasses drop (1000ms)
    postAnimationCountdownSec: number; // Phase 5: Countdown timer AFTER all animations complete (5s)
  };

  // Final Leaderboard (After Last Question Only)
  final: {
    enabled: boolean;
    introDurationMs: number; // Anticipation pause before reveal (0-800ms)
    thirdPlaceRevealDurationMs: number; // 3rd place entrance timing
    secondPlaceRevealDurationMs: number; // 2nd place entrance timing
    winnerRevealDurationMs: number; // 1st place dramatic climax timing
    celebrationDurationMs: number; // Confetti & celebration duration
    remainingParticipantStaggerMs: number; // Row 4+ entrance stagger delay
    maxRemainingStaggerMs: number; // Cap for large remaining participant lists
  };

  // Audio Configuration
  audio: {
    enabled: boolean;
    leaderboardRevealSound: string;
    soundVolume: number;
  };
}

export const LEADERBOARD_ANIMATION_CONFIG: ILeaderboardAnimationConfig = {
  intermediate: {
    enabled: true,
    timerDurationSec: 8,
    containerDurationMs: 500,
    rowStaggerMs: 70,
    maxRowStaggerMs: 400,
    scoreAnimationDurationMs: 2500,
    rankMovementDurationMs: 2500,
    accuracyAnimationDurationMs: 500,
    highlightDurationMs: 900,
    previousScoreboardPhaseMs: 5000,
    countingPointsPhaseMs: 3000,
    reorderingPhaseMs: 3000,
    emojiRevealPhaseMs: 3000,
    postAnimationCountdownSec: 8,
  },
  final: {
    enabled: true,
    introDurationMs: 800,
    thirdPlaceRevealDurationMs: 1000,
    secondPlaceRevealDurationMs: 1000,
    winnerRevealDurationMs: 1400,
    celebrationDurationMs: 3500,
    remainingParticipantStaggerMs: 80,
    maxRemainingStaggerMs: 500,
  },
  audio: {
    enabled: true,
    leaderboardRevealSound: '/sounds/Leaderboard / Results Reveal.mp3',
    soundVolume: 0.8,
  },
};
