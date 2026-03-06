const STORAGE_KEY = 'toufou_leaderboard';
const MAX_ENTRIES = 10;

export async function saveScore(score: number, username: string = 'Anonymous'): Promise<void> {
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score })
        });

        if (response.ok) {
            return;
        } else {
            console.error('API responded with error when saving score');
        }
    } catch (e) {
        console.error('Failed to save score to API, falling back to local.', e);
    }

    // Fallback
    const scores = await getScores();
    scores.push({ username, score });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_ENTRIES)));
}

export async function getScores(): Promise<{ username: string, score: number; }[]> {
    try {
        const response = await fetch('/api/scores');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) return data as { username: string, score: number; }[];
        }
    } catch (e) {
        console.error('Failed to fetch from API, falling back to local storage', e);
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as { username: string, score: number; }[];
    } catch {
        // ignore malformed data
    }
    return [];
}
