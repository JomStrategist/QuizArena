/**
 * QuizArena Global Reusable Quiz Audio System
 * Manages background music, dynamic timer warning music, answer submission sound effects,
 * and leaderboard reveal music across all existing and future quizzes.
 */

export type QuizAudioState =
  | 'IDLE'
  | 'LOBBY'
  | 'QUESTION_ACTIVE'
  | 'QUESTION_WARNING'
  | 'TIME_UP'
  | 'ANSWER_SUBMITTED'
  | 'LEADERBOARD';

export interface QuizAudioConfigItem {
  src: string;
  loop: boolean;
  volume: number;
}

export const quizAudioConfig: Record<string, QuizAudioConfigItem> = {
  lobby: {
    src: '/Music/Lobby Theme.mp3',
    loop: true,
    volume: 0.35,
  },
  question: {
    src: '/Music/Live Game Question Music.mp3',
    loop: true,
    volume: 0.35,
  },
  warning: {
    src: '/Music/Time Warning : Final Countdown.mp3',
    loop: true,
    volume: 0.45,
  },
  timeUp: {
    src: '/Music/Time Up : Answer Time Over.mp3',
    loop: false,
    volume: 0.5,
  },
  answerSubmitted: {
    src: '/Music/Answer Submitted.mp3',
    loop: false,
    volume: 0.55,
  },
  leaderboard: {
    src: '/Music/Leaderboard : Results Reveal.mp3',
    loop: false,
    volume: 0.45,
  },
};

class SoundManager {
  private currentState: QuizAudioState = 'IDLE';
  private isMuted: boolean = false;
  private currentAudioKey: string | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (this.isUnlocked) return;
        this.isUnlocked = true;
        // Warm up / unlock audio elements
        Object.keys(quizAudioConfig).forEach((key) => {
          const audio = this.getAudioElement(key);
          if (audio) {
            audio.load();
          }
        });
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('click', unlockAudio);
      window.addEventListener('pointerdown', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
    }
  }

  private getAudioElement(key: string): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    const config = quizAudioConfig[key];
    if (!config) return null;

    if (!this.audioCache.has(key)) {
      const audio = new Audio(config.src);
      audio.loop = config.loop;
      audio.volume = config.volume;
      audio.preload = 'auto';
      this.audioCache.set(key, audio);
    }

    return this.audioCache.get(key) || null;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopCurrentAudio();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  private stopCurrentAudio(): void {
    if (this.currentAudioKey) {
      const audio = this.audioCache.get(this.currentAudioKey);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      this.currentAudioKey = null;
    }
  }

  public setAudioState(newState: QuizAudioState, options?: { force?: boolean }): void {
    if (this.currentState === newState && !options?.force) {
      return;
    }

    this.currentState = newState;

    if (this.isMuted) {
      this.stopCurrentAudio();
      return;
    }

    let targetKey: string | null = null;
    switch (newState) {
      case 'LOBBY':
        targetKey = 'lobby';
        break;
      case 'QUESTION_ACTIVE':
        targetKey = 'question';
        break;
      case 'QUESTION_WARNING':
        targetKey = 'warning';
        break;
      case 'TIME_UP':
        targetKey = 'timeUp';
        break;
      case 'ANSWER_SUBMITTED':
        targetKey = 'answerSubmitted';
        break;
      case 'LEADERBOARD':
        targetKey = 'leaderboard';
        break;
      case 'IDLE':
      default:
        targetKey = null;
        break;
    }

    if (!targetKey) {
      this.stopCurrentAudio();
      return;
    }

    if (this.currentAudioKey === targetKey) {
      return;
    }

    this.stopCurrentAudio();

    const audio = this.getAudioElement(targetKey);
    if (audio) {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Gracefully ignore autoplay restriction errors until user interacts
        });
      }
      this.currentAudioKey = targetKey;
    }
  }

  public playAnswerSubmitted(): void {
    this.setAudioState('ANSWER_SUBMITTED', { force: true });
  }

  public playTimeUp(): void {
    this.setAudioState('TIME_UP', { force: true });
  }

  public playLeaderboardSound(): void {
    this.setAudioState('LEADERBOARD', { force: true });
  }

  public playStartBeep(final: boolean = false): void {
    if (final) {
      this.setAudioState('QUESTION_ACTIVE', { force: true });
    }
  }

  public playCorrectSound(): void {
    this.playAnswerSubmitted();
  }

  public playWrongSound(): void {
    this.playAnswerSubmitted();
  }

  public playTimeoutSound(): void {
    this.playTimeUp();
  }

  public playTickSound(): void {
    // Tick sound handled by warning music state transition
  }

  /**
   * Calculates the dynamic warning countdown threshold based on question time limit
   */
  public getWarningThreshold(questionTimeLimit: number = 20): number {
    if (questionTimeLimit >= 45) return 10;
    if (questionTimeLimit >= 15) return 5;
    return Math.max(3, Math.floor(questionTimeLimit * 0.25));
  }

  /**
   * Automatically updates quiz audio state based on current stage, timer, and submission state
   */
  public updateQuizState(params: {
    stage: string;
    timeLeft: number;
    questionTimeLimit?: number;
    isAnswerSubmitted?: boolean;
  }): void {
    const { stage, timeLeft, questionTimeLimit = 20, isAnswerSubmitted = false } = params;

    if (stage === 'LOBBY') {
      this.setAudioState('LOBBY');
      return;
    }

    if (stage === 'FINAL_PODIUM' || stage === 'FINAL_SCOREBOARD' || stage === 'LEADERBOARD' || stage === 'SHOWING_RESULT') {
      this.setAudioState('LEADERBOARD');
      return;
    }

    if (stage === 'QUESTION_ACTIVE') {
      if (isAnswerSubmitted) {
        if (this.currentState !== 'ANSWER_SUBMITTED') {
          this.setAudioState('ANSWER_SUBMITTED');
        }
        return;
      }

      if (timeLeft <= 0) {
        this.setAudioState('TIME_UP');
        return;
      }

      const warningThreshold = this.getWarningThreshold(questionTimeLimit);
      if (timeLeft <= warningThreshold) {
        this.setAudioState('QUESTION_WARNING');
        return;
      }

      this.setAudioState('QUESTION_ACTIVE');
      return;
    }

    if (stage === 'PAUSED' || stage === 'CLOSED') {
      this.setAudioState('IDLE');
      return;
    }
  }
}

export const soundManager = new SoundManager();
