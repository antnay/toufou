// Scoreboard overlay //
import { GameState } from "./state";
import { StagePhase } from "./stageloader";

// DOM element references for overlay components
let scoreElement: HTMLElement | null = null;
let hiScoreElement: HTMLElement | null = null;
let bombElement: HTMLElement | null = null;
let livesElement: HTMLElement | null = null;
let heartElements: HTMLImageElement[] = [];
let deathsElement: HTMLElement | null = null;
let phaseElement: HTMLElement | null = null;
let enemyHpElement: HTMLElement | null = null;
let spellcardElement: HTMLElement | null = null;
let spellcardNameElement: HTMLElement | null = null;

// High score
let hiScore: number = 0;

const PHASE_NAMES: Record<StagePhase, string> = {
    [StagePhase.LOSERS]: 'Phase: Losers',
    [StagePhase.MIDBOSS]: 'Phase: Mid Boss',
    [StagePhase.BOSS]: 'Phase: Boss',
    [StagePhase.CLEAR]: 'Phase: Clear',
};

const STAT_PANEL_WIDTH = 400;
const SCORE_DIGITS = 9;
const MAX_LIVES = 3;
const HEART_IMG_SRC = `${import.meta.env.BASE_URL}assets/heart.png`;

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
        width: ${STAT_PANEL_WIDTH}px;
        min-height: 100vh;
        border-left: 1px solid rgba(100, 100, 180, 0.35);
        font-family: 'Segoe UI', system-ui, sans-serif;
        color: #e8e8f0;
        padding: 24px;
        box-sizing: border-box;
        overflow-y: auto;
        pointer-events: none;
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.25);
    `;
    return statPanel;
}

// Game title
function createGameTitle(): HTMLElement {
    const gameTitle = document.createElement('div');
    gameTitle.textContent = 'TOUFOU Prototpye ver0.1';
    gameTitle.style.cssText = `
        font-size: 20px;
        font-weight: 600;
        text-align: center;
        margin-bottom: 28px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(160, 160, 255, 0.2);
        color: #a8b0ff;
        letter-spacing: 0.02em;
    `;
    return gameTitle;
}

// Score display section
function createScoreSection(): { container: HTMLElement; hiScore: HTMLElement; score: HTMLElement; } {
    const scoreSection = document.createElement('div');
    scoreSection.style.cssText = `
        margin-bottom: 22px;
        line-height: 1.5;
    `;

    const hiScoreDiv = document.createElement('div');
    hiScoreDiv.style.cssText = `
        font-size: 12px;
        color: #888;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    `;

    const scoreDiv = document.createElement('div');
    scoreDiv.style.cssText = `
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        letter-spacing: 0.02em;
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
function createStatsSection(): { container: HTMLElement; bomb: HTMLElement; lives: HTMLElement; deaths: HTMLElement; } {
    const statsSection = document.createElement('div');
    statsSection.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.8;
        font-size: 14px;
    `;

    const bombDiv = document.createElement('div');
    bombDiv.style.cssText = 'color: #ffaa00;';

    const livesLabel = document.createElement('div');
    livesLabel.textContent = 'Lives';
    livesLabel.style.cssText = 'color: #7dd3fc; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;';
    const livesHeartsWrap = document.createElement('div');
    livesHeartsWrap.className = 'lives-hearts';
    livesHeartsWrap.style.cssText = 'display: flex; gap: 4px; flex-wrap: wrap;';
    heartElements = [];
    for (let i = 0; i < MAX_LIVES; i++) {
        const heart = document.createElement('img');
        heart.src = HEART_IMG_SRC;
        heart.alt = '';
        heart.className = 'heart';
        heart.style.cssText = 'width: 24px; height: 24px; display: inline-block; object-fit: contain;';
        livesHeartsWrap.appendChild(heart);
        heartElements.push(heart);
    }
    const livesDiv = document.createElement('div');
    livesDiv.appendChild(livesLabel);
    livesDiv.appendChild(livesHeartsWrap);

    const deathsDiv = document.createElement('div');
    deathsDiv.style.cssText = 'color: #ff6b6b;';

    statsSection.appendChild(bombDiv);
    statsSection.appendChild(livesDiv);
    statsSection.appendChild(deathsDiv);

    return {
        container: statsSection,
        bomb: bombDiv,
        lives: livesDiv,
        deaths: deathsDiv,
    };
}

// Phase display section
function createPhaseSection(): HTMLElement {
    const phaseSection = document.createElement('div');
    phaseSection.style.cssText = `
        margin-bottom: 22px;
        font-size: 13px;
        color: #b0b8d0;
    `;
    return phaseSection;
}

function createEnemyHPSection(): HTMLElement {
    const enemyHpSection = document.createElement('div');
    enemyHpSection.style.cssText = `
        margin-bottom: 22px;
        font-size: 13px;
        color: #b0b8d0;
    `;
    return enemyHpSection;
}

// Spellcard display section
function createSpellcardSection(): { container: HTMLElement; name: HTMLElement; } {
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
        right: 24px;
        font-size: 11px;
        color: #555;
        letter-spacing: 0.03em;
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
    livesElement = statsSection.lives;
    deathsElement = statsSection.deaths;
    statPanel.appendChild(statsSection.container);

    phaseElement = createPhaseSection();
    statPanel.appendChild(phaseElement);
    enemyHpElement = createEnemyHPSection();
    statPanel.appendChild(enemyHpElement);

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
    if (!scoreElement || !hiScoreElement || !bombElement || !livesElement || !deathsElement ||
        !phaseElement || !enemyHpElement || !spellcardElement || !spellcardNameElement) {
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
    const livesClamped = Math.min(MAX_LIVES, Math.max(0, state.lives));
    for (let i = 0; i < heartElements.length; i++) {
        heartElements[i].style.display = i < livesClamped ? 'inline-block' : 'none';
    }
    deathsElement.textContent = `Deaths ${state.deaths}`;
    phaseElement.textContent = PHASE_NAMES[state.current_phase] || 'Phase: Unknown';
    if (state.current_phase === StagePhase.BOSS) {
        if (!state.boss) {
            enemyHpElement.textContent = '';
            return;
        }
        enemyHpElement.textContent = `Enemy HP ${state.boss.hp} / ${state.boss.maxHp}`;
    } else if (state.current_phase === StagePhase.MIDBOSS) {
        if (!state.midboss) {
            enemyHpElement.textContent = '';
            return;
        }
        enemyHpElement.textContent = `Enemy HP ${state.midboss.hp} / ${state.midboss.maxHp}`;
    } else {
        // enemyHpElement.textContent ;
    }

    // Spellcard display
    if (!state.boss) {
        spellcardElement.style.display = 'none';
        return;
    }
    if (state.boss.spellcard_on && state.boss.spellcard) {
        spellcardNameElement.textContent = `"${state.boss.spellcard}"`;
        spellcardElement.style.display = 'block';
    } else {
        spellcardElement.style.display = 'none';
    }
}