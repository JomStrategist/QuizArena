/**
 * QuizArena Speed-Based Scoring Engine
 * 
 * Formula:
 * If Correct:
 *   Points = Math.round( maxPoints * (0.5 + 0.5 * ( (timeLimitSeconds - responseTimeSeconds) / timeLimitSeconds )) )
 * If Wrong or Timeout:
 *   Points = 0
 */
export interface CalculateScoreParams {
  isCorrect: boolean;
  maxPoints: number; // e.g. 1000
  timeLimitSeconds: number; // e.g. 15
  responseTimeMs: number; // e.g. 2400
}

export function calculateQuestionScore({
  isCorrect,
  maxPoints = 1000,
  timeLimitSeconds = 20,
  responseTimeMs,
}: CalculateScoreParams): number {
  if (!isCorrect) {
    return 0;
  }

  const responseTimeSeconds = responseTimeMs / 1000;

  // Late submission past duration
  if (responseTimeSeconds > timeLimitSeconds) {
    return 0;
  }

  // Ensure non-negative duration ratio
  const remainingRatio = Math.max(0, (timeLimitSeconds - responseTimeSeconds) / timeLimitSeconds);
  
  // Score range: 50% maxPoints (for slowest correct answer) up to 100% maxPoints (instant correct answer)
  const scoreMultiplier = 0.5 + 0.5 * remainingRatio;
  
  return Math.round(maxPoints * scoreMultiplier);
}
