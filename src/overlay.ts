// Scoreboard overlay //

interface GameState {
    stage: any;
    current_phase: Phase;
    player: any;
    losers: any[];
    mid_boss: any;
    boss: {
        spellcard_on: boolean;
        spellcard: string;
        [key: string]: any;
    };
    current_bomb: number;
    score: number;
    deaths: number;
}

enum Phase {
    LOSERS,
    MID_BOSS,
    BOSS,
}

// DOM element references for overlay components
let scoreElement: HTMLElement | null = null;
let hiScoreElement: HTMLElement | null = null;
let bombElement: HTMLElement | null = null;
let deathsElement: HTMLElement | null = null;
let phaseElement: HTMLElement | null = null;
let spellcardElement: HTMLElement | null = null;
let spellcardNameElement: HTMLElement | null = null;

// High score
let hiScore: number = 0;

const PHASE_NAMES: Record<Phase, string> = {
    [Phase.LOSERS]: 'Phase: Losers',
    [Phase.MID_BOSS]: 'Phase: Mid Boss',
    [Phase.BOSS]: 'Phase: Boss',
};

const STAT_PANEL_WIDTH = 280;
const SCORE_DIGITS = 9;

// Loads high score
function loadHighScore(): void {
    const savedHiScore = localStorage.getItem('toufou_hiscore');
    if (savedHiScore) {
        hiScore = Number.parseInt(savedHiScore, 10);
    }
}

// Stats panel container
function createStatPanel(): HTMLElement {
    const statPanel = document.createElement('div');
    statPanel.id = 'stat-panel';
    statPanel.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: ${STAT_PANEL_WIDTH}px;
        height: 100%;
        background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%);
        border-left: 2px solid #4a4a6a;
        font-family: 'Courier New', monospace;
        color: #fff;
        z-index: 1000;
        padding: 20px;
        box-sizing: border-box;
        overflow-y: auto;
        pointer-events: none;
    `;
    return statPanel;
}

// Game title
function createGameTitle(): HTMLElement {
    const gameTitle = document.createElement('div');
    gameTitle.textContent = 'TOUFOU Prototpye ver0.1';
    gameTitle.style.cssText = `
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 30px;
        color: #a0a0ff;
        text-shadow: 0 0 10px rgba(160, 160, 255, 0.5);
    `;
    return gameTitle;
}

// Score display section
function createScoreSection(): { container: HTMLElement; hiScore: HTMLElement; score: HTMLElement } {
    const scoreSection = document.createElement('div');
    scoreSection.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.6;
    `;

    const hiScoreDiv = document.createElement('div');
    hiScoreDiv.style.cssText = `
        font-size: 14px;
        color: #aaa;
        margin-bottom: 5px;
    `;

    const scoreDiv = document.createElement('div');
    scoreDiv.style.cssText = `
        font-size: 16px;
        font-weight: bold;
        color: #fff;
        margin-bottom: 15px;
    `;

    scoreSection.appendChild(hiScoreDiv);
    scoreSection.appendChild(scoreDiv);

    return {
        container: scoreSection,
        hiScore: hiScoreDiv,
        score: scoreDiv,
    };
}

// Stats display section (bomb, deaths)
function createStatsSection(): { container: HTMLElement; bomb: HTMLElement; deaths: HTMLElement } {
    const statsSection = document.createElement('div');
    statsSection.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.8;
        font-size: 14px;
    `;

    const bombDiv = document.createElement('div');
    bombDiv.style.cssText = 'color: #ffaa00;';

    const deathsDiv = document.createElement('div');
    deathsDiv.style.cssText = 'color: #ff6b6b;';

    statsSection.appendChild(bombDiv);
    statsSection.appendChild(deathsDiv);

    return {
        container: statsSection,
        bomb: bombDiv,
        deaths: deathsDiv,
    };
}

// Phase display section
function createPhaseSection(): HTMLElement {
    const phaseSection = document.createElement('div');
    phaseSection.style.cssText = `
        margin-bottom: 25px;
        font-size: 14px;
    `;
    return phaseSection;
}

// Spellcard display section
function createSpellcardSection(): { container: HTMLElement; name: HTMLElement } {
    const spellcardSection = document.createElement('div');
    spellcardSection.style.cssText = `
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(255, 100, 100, 0.1);
        border: 1px solid rgba(255, 100, 100, 0.3);
        border-radius: 5px;
        display: none;
    `;

    const spellcardLabel = document.createElement('div');
    spellcardLabel.textContent = 'Spell Card';
    spellcardLabel.style.cssText = `
        font-size: 12px;
        color: #ff6b6b;
        margin-bottom: 5px;
    `;

    const spellcardNameDiv = document.createElement('div');
    spellcardNameDiv.style.cssText = `
        font-size: 16px;
        font-weight: bold;
        color: #ffaaaa;
        text-shadow: 0 0 5px rgba(255, 170, 170, 0.5);
    `;

    spellcardSection.appendChild(spellcardLabel);
    spellcardSection.appendChild(spellcardNameDiv);

    return {
        container: spellcardSection,
        name: spellcardNameDiv,
    };
}

// Footer
function createFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.textContent = 'Bullet Hell';
    footer.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        font-size: 11px;
        color: #666;
    `;
    return footer;
}

// Initializes the overlay and all UI elements
export function initOverlay(): void {
    loadHighScore();

    const statPanel = createStatPanel();
    statPanel.appendChild(createGameTitle());

    const scoreSection = createScoreSection();
    hiScoreElement = scoreSection.hiScore;
    scoreElement = scoreSection.score;
    statPanel.appendChild(scoreSection.container);

    const statsSection = createStatsSection();
    bombElement = statsSection.bomb;
    deathsElement = statsSection.deaths;
    statPanel.appendChild(statsSection.container);

    phaseElement = createPhaseSection();
    statPanel.appendChild(phaseElement);

    const spellcardSection = createSpellcardSection();
    spellcardElement = spellcardSection.container;
    spellcardNameElement = spellcardSection.name;
    statPanel.appendChild(spellcardSection.container);

    statPanel.appendChild(createFooter());

    document.body.appendChild(statPanel);
}

// Score string with leading zeros
function formatScore(score: number): string {
    return score.toString().padStart(SCORE_DIGITS, '0');
}

// Updates the overlay with current game state
export function updateOverlay(state: GameState): void {
    if (!scoreElement || !hiScoreElement || !bombElement || !deathsElement || 
        !phaseElement || !spellcardElement || !spellcardNameElement) {
        return;
    }

    // Update high score if current score is higher
    if (state.score > hiScore) {
        hiScore = state.score;
        localStorage.setItem('toufou_hiscore', hiScore.toString());
    }

    hiScoreElement.textContent = `HiScore ${formatScore(hiScore)}`;
    scoreElement.textContent = `Score ${formatScore(state.score)}`;
    bombElement.textContent = `Bomb ${state.current_bomb}`;
    deathsElement.textContent = `Deaths ${state.deaths}`;
    phaseElement.textContent = PHASE_NAMES[state.current_phase] || 'Phase: Unknown';

    // Spellcard display
    if (state.boss.spellcard_on && state.boss.spellcard) {
        spellcardNameElement.textContent = `"${state.boss.spellcard}"`;
        spellcardElement.style.display = 'block';
    } else {
        spellcardElement.style.display = 'none';
    }
}

// Initialize overlay
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOverlay);
    } else {
        initOverlay();
    }
}