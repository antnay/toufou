// Initializes the UI system and hides default HTML elements
export function initUI(startOptions?: {
    start: () => void | Promise<void>;
    backToMenu: () => void;
}): void {
    const title = document.getElementById('title');
    const btn = document.getElementById('btn');
    const gameOver = document.getElementById('game-over-layer');
    const btnBack = document.getElementById('btn-back');

    if (!startOptions) {
        if (title) title.style.display = 'none';
        if (btn) btn.style.display = 'none';
        return;
    }

    if (title) title.style.display = '';
    if (btn) {
        btn.style.display = 'block';
        btn.onclick = () => {
            (title as HTMLElement).style.display = 'none';
            (btn as HTMLElement).style.display = 'none';
            void startOptions.start();
        };
    }
    if (btnBack && gameOver) {
        btnBack.onclick = () => {
            (gameOver as HTMLElement).style.display = 'none';
            if (title) (title as HTMLElement).style.display = '';
            if (btn) (btn as HTMLElement).style.display = 'block';
            startOptions.backToMenu();
        };
    }
}

export function GG(): void {
    const el = document.getElementById('game-over-layer');
    if (el) (el as HTMLElement).style.display = 'flex';
}