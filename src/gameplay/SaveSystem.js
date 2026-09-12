// SaveSystem.js - LocalStorage persistence for progress, settings, and high scores (§16)

export class SaveSystem {
  static KEY = 'DEAD_HALLOWEEN_MASSACRE_SAVE';

  static load() {
    try {
      const data = localStorage.getItem(SaveSystem.KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('SaveSystem load error:', e);
    }
    return {
      unlockedLevel: 0,
      bestTimes: [null, null, null, null],
      difficulty: 'normal',
      volume: 0.8
    };
  }

  static save(state) {
    try {
      localStorage.setItem(SaveSystem.KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('SaveSystem save error:', e);
    }
  }

  static completeLevel(levelIndex, timeSeconds) {
    const data = SaveSystem.load();
    data.unlockedLevel = Math.max(data.unlockedLevel, levelIndex + 1);
    if (!data.bestTimes[levelIndex] || timeSeconds < data.bestTimes[levelIndex]) {
      data.bestTimes[levelIndex] = timeSeconds;
    }
    SaveSystem.save(data);
  }
}
