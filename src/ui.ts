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

    if (!startOptions) {
        if (title) title.style.display = 'none';
        if (btn) btn.style.display = 'none';
        return;
    }

    const uiLayer = document.getElementById('ui-layer');

    function showMenu() {
        if (uiLayer) uiLayer.classList.add('menu-visible');
        if (title) (title as HTMLElement).style.display = '';
        if (btn) (btn as HTMLElement).style.display = 'block';
    }
    function hideMenu() {
        if (uiLayer) uiLayer.classList.remove('menu-visible');
        if (title) (title as HTMLElement).style.display = 'none';
        if (btn) (btn as HTMLElement).style.display = 'none';
    }

    showMenu();
    if (btn) {
        btn.onclick = () => {
            hideMenu();
            void startOptions.start();
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

export function GG(): void {
    const el = document.getElementById('game-over-layer');
    if (el) (el as HTMLElement).style.display = 'flex';
}

export function WIN(): void {
    const el = document.getElementById('you-won-layer');
    if (el) (el as HTMLElement).style.display = 'flex';
}