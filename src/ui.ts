import { saveScore, getScores } from './leaderboard';

const SCORE_DIGITS = 9;

function formatScore(score: number): string {
    return score.toString().padStart(SCORE_DIGITS, '0');
}

async function populateLeaderboard(): Promise<void> {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<li>Loading scores...</li>';
    const scores = await getScores();
    list.innerHTML = ''; // Clear loading text
    for (let i = 0; i < 10; i++) {
        const li = document.createElement('li');
        const rank = document.createElement('span');
        rank.className = 'lb-rank';
        rank.textContent = `#${i + 1}`;
        const score = document.createElement('span');
        score.className = 'lb-score';
        score.textContent = scores[i] !== undefined ? scores[i].username + ' ' + formatScore(scores[i].score) : '—————————';
        li.appendChild(rank);
        li.appendChild(score);
        list.appendChild(li);
    }
}

// Initializes the UI system and hides default HTML elements
export function initUI(startOptions?: {
    start: () => void | Promise<void>;
    backToMenu: () => void;
}): void {
    const title = document.getElementById('title');
    const btn = document.getElementById('btn');
    const gameOver = document.getElementById('game-over-layer');
    const btnBack = document.getElementById('btn-back');
    const youWon = document.getElementById('you-won-layer');
    const btnWonBack = document.getElementById('btn-won-back');
    const btnLeaderboard = document.getElementById('btn-leaderboard');
    const leaderboardLayer = document.getElementById('leaderboard-layer');
    const btnLeaderboardClose = document.getElementById('btn-leaderboard-close');

    if (!startOptions) {
        if (title) title.style.display = 'none';
        if (btn) btn.style.display = 'none';
        return;
    }

    const uiLayer = document.getElementById('ui-layer');
    const subtitle = document.getElementById('subtitle');

    function showMenu() {
        if (uiLayer) uiLayer.classList.add('menu-visible');
        if (title) (title as HTMLElement).style.display = '';
        if (subtitle) (subtitle as HTMLElement).style.display = '';
        if (btn) (btn as HTMLElement).style.display = 'block';
        if (btnLeaderboard) (btnLeaderboard as HTMLElement).style.display = 'block';
    }
    function hideMenu() {
        if (uiLayer) uiLayer.classList.remove('menu-visible');
        if (title) (title as HTMLElement).style.display = 'none';
        if (subtitle) (subtitle as HTMLElement).style.display = 'none';
        if (btn) (btn as HTMLElement).style.display = 'none';
        if (btnLeaderboard) (btnLeaderboard as HTMLElement).style.display = 'none';
    }

    showMenu();

    if (btn) {
        btn.onclick = () => {
            hideMenu();
            void startOptions.start();
        };
    }

    if (btnLeaderboard && leaderboardLayer) {
        btnLeaderboard.onclick = async () => {
            hideMenu();
            leaderboardLayer.style.display = 'flex';
            await populateLeaderboard();
        };
    }

    if (btnLeaderboardClose && leaderboardLayer) {
        btnLeaderboardClose.onclick = () => {
            leaderboardLayer.style.display = 'none';
            showMenu();
        };
    }

    if (btnBack && gameOver) {
        btnBack.onclick = () => {
            (gameOver as HTMLElement).style.display = 'none';
            showMenu();
            startOptions.backToMenu();
        };
    }
    if (btnWonBack && youWon) {
        btnWonBack.onclick = () => {
            (youWon as HTMLElement).style.display = 'none';
            showMenu();
            startOptions.backToMenu();
        };
    }
}

const SAVED_USERNAME_KEY = 'toufou_last_username';

function setupScoreSubmission(
    score: number,
    inputId: string,
    submitBtnId: string,
    backBtnId: string
) {
    const usernameInput = document.getElementById(inputId) as HTMLInputElement | null;
    const submitBtn = document.getElementById(submitBtnId);
    const backBtn = document.getElementById(backBtnId);

    if (usernameInput) {
        // Pre-fill with last used name
        const lastSaved = localStorage.getItem(SAVED_USERNAME_KEY);
        usernameInput.value = lastSaved || '';
        setTimeout(() => usernameInput.focus(), 100);
    }

    if (submitBtn) {
        // Reset state from previous runs
        submitBtn.textContent = 'Submit Score';
        submitBtn.style.pointerEvents = 'auto';

        submitBtn.onclick = async () => {
            const rawName = usernameInput ? usernameInput.value.trim() : '';
            const finalName = rawName.length > 0 ? rawName : 'Anonymous';

            // Save for next play
            if (rawName.length > 0) {
                localStorage.setItem(SAVED_USERNAME_KEY, rawName);
            }

            submitBtn.textContent = 'Saving...';
            submitBtn.style.pointerEvents = 'none';
            await saveScore(score, finalName);

            if (backBtn) {
                backBtn.click();
            }
        };
    }
}

export function GG(score: number): void {
    const el = document.getElementById('game-over-layer');
    if (!el) return;
    el.style.display = 'flex';
    const scoreEl = document.getElementById('game-over-score');
    if (scoreEl) scoreEl.textContent = formatScore(score);

    setupScoreSubmission(score, 'username-input-gg', 'btn-submit-score-gg', 'btn-back');
}

export function WIN(score: number): void {
    const el = document.getElementById('you-won-layer');
    if (!el) return;
    el.style.display = 'flex';
    const scoreEl = document.getElementById('you-won-score');
    if (scoreEl) scoreEl.textContent = formatScore(score);

    setupScoreSubmission(score, 'username-input', 'btn-submit-score', 'btn-won-back');
}
