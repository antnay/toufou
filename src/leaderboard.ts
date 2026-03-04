const STORAGE_KEY = 'toufou_leaderboard';
const MAX_ENTRIES = 10;

export function saveScore(score: number): void {
    const scores = getScores();
    scores.push(score);
    scores.sort((a, b) => b - a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_ENTRIES)));
}

export function getScores(): number[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as number[];
    } catch {
        // ignore malformed data
    }
    return [];
}
