// Scoreboard overlay //
import { GameState } from "./state";
import { StagePhase } from "./stageloader";

let scoreElement: HTMLElement | null = null;
let hiScoreElement: HTMLElement | null = null;
let bombElement: HTMLElement | null = null;
let bombElements: HTMLImageElement[] = [];
let livesElement: HTMLElement | null = null;
let heartElements: HTMLImageElement[] = [];
let deathsElement: HTMLElement | null = null;
let phaseElement: HTMLElement | null = null;
let enemyHpElement: HTMLElement | null = null;
let enemyHpBarFill: HTMLElement | null = null;
let enemyHpContainer: HTMLElement | null = null;
let spellcardElement: HTMLElement | null = null;
let spellcardNameElement: HTMLElement | null = null;

let hiScore: number = 0;

const PHASE_LABELS: Record<StagePhase, string> = {
    [StagePhase.LOSERS]: 'Losers',
    [StagePhase.MIDBOSS]: 'Mid Boss',
    [StagePhase.BOSS]: 'Boss',
    [StagePhase.CLEAR]: 'Clear',
};

const PHASE_COLORS: Record<StagePhase, string> = {
    [StagePhase.LOSERS]: '#7dd3fc',
    [StagePhase.MIDBOSS]: '#fb923c',
    [StagePhase.BOSS]: '#f87171',
    [StagePhase.CLEAR]: '#4ade80',
};

const STAT_PANEL_WIDTH = 400;
const SCORE_DIGITS = 9;
const MAX_LIVES = 3;
const MAX_BOMBS = 2;
const HEART_IMG_SRC = `${import.meta.env.BASE_URL}assets/heart.png`;
const BOMB_IMG_SRC  = `${import.meta.env.BASE_URL}assets/bomb.png`;

function loadHighScore(): void {
    const savedHiScore = localStorage.getItem('toufou_hiscore');
    if (savedHiScore) {
        hiScore = Number.parseInt(savedHiScore, 10);
    }
}

function makeDivider(): HTMLElement {
    const el = document.createElement('div');
    el.style.cssText = 'border-top: 1px solid rgba(160,160,255,0.12); margin: 20px 0;';
    return el;
}

function makeSectionLabel(text: string): HTMLElement {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #556688;
        margin-bottom: 8px;
    `;
    return el;
}

function createStatPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'stat-panel';
    panel.style.cssText = `
        width: ${STAT_PANEL_WIDTH}px;
        min-height: 100vh;
        border-left: 1px solid rgba(100, 100, 180, 0.3);
        font-family: 'Segoe UI', system-ui, sans-serif;
        color: #e8e8f0;
        padding: 28px 28px 24px;
        box-sizing: border-box;
        overflow-y: auto;
        pointer-events: none;
        box-shadow: -6px 0 32px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
    `;
    return panel;
}

function createGameTitle(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.cssText = `
        text-align: center;
        margin-bottom: 28px;
        padding-bottom: 22px;
        border-bottom: 1px solid rgba(160, 160, 255, 0.18);
    `;

    const title = document.createElement('div');
    title.textContent = 'TOUFOU';
    title.style.cssText = `
        font-size: 36px;
        font-weight: 900;
        color: #c8d0ff;
        letter-spacing: 0.18em;
        text-shadow: 0 0 24px rgba(168,176,255,0.45), 0 0 48px rgba(168,176,255,0.2);
    `;

    wrap.appendChild(title);
    return wrap;
}

function createScoreSection(): { container: HTMLElement; hiScore: HTMLElement; score: HTMLElement; } {
    const container = document.createElement('div');
    container.style.marginBottom = '4px';

    const hiLabel = makeSectionLabel('Hi Score');
    const hiScoreDiv = document.createElement('div');
    hiScoreDiv.style.cssText = `
        font-size: 20px;
        font-weight: 700;
        color: #f0c040;
        font-family: 'Courier New', monospace;
        letter-spacing: 0.06em;
        margin-bottom: 16px;
    `;

    const scoreLabel = makeSectionLabel('Score');
    const scoreDiv = document.createElement('div');
    scoreDiv.style.cssText = `
        font-size: 28px;
        font-weight: 700;
        color: #ffffff;
        font-family: 'Courier New', monospace;
        letter-spacing: 0.06em;
    `;

    container.appendChild(hiLabel);
    container.appendChild(hiScoreDiv);
    container.appendChild(scoreLabel);
    container.appendChild(scoreDiv);

    return { container, hiScore: hiScoreDiv, score: scoreDiv };
}

function createStatsSection(): { container: HTMLElement; bomb: HTMLElement; lives: HTMLElement; deaths: HTMLElement; } {
    const container = document.createElement('div');

    // Lives
    const livesLabel = makeSectionLabel('Lives');
    const heartsWrap = document.createElement('div');
    heartsWrap.className = 'lives-hearts';
    heartsWrap.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;';
    heartElements = [];
    for (let i = 0; i < MAX_LIVES; i++) {
        const heart = document.createElement('img');
        heart.src = HEART_IMG_SRC;
        heart.alt = '';
        heart.className = 'heart';
        heart.style.cssText = 'width: 30px; height: 30px; display: inline-block; object-fit: contain;';
        heartsWrap.appendChild(heart);
        heartElements.push(heart);
    }
    const livesDiv = document.createElement('div');
    livesDiv.appendChild(livesLabel);
    livesDiv.appendChild(heartsWrap);

    // Bomb
    const bombLabel = makeSectionLabel('Bomb');
    const bombsWrap = document.createElement('div');
    bombsWrap.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;';
    bombElements = [];
    for (let i = 0; i < MAX_BOMBS; i++) {
        const bomb = document.createElement('img');
        bomb.src = BOMB_IMG_SRC;
        bomb.alt = '';
        bomb.style.cssText = 'width: 30px; height: 30px; display: inline-block; object-fit: contain;';
        bombsWrap.appendChild(bomb);
        bombElements.push(bomb);
    }
    const bombDiv = document.createElement('div');
    bombDiv.appendChild(bombLabel);
    bombDiv.appendChild(bombsWrap);

    // Deaths
    const deathsLabel = makeSectionLabel('Deaths');
    const deathsDiv = document.createElement('div');
    deathsDiv.style.cssText = `
        font-size: 22px;
        font-weight: 600;
        color: #ff6b6b;
        font-family: 'Courier New', monospace;
    `;

    container.appendChild(livesDiv);
    container.appendChild(bombDiv);
    container.appendChild(deathsLabel);
    container.appendChild(deathsDiv);

    return { container, bomb: bombDiv, lives: livesDiv, deaths: deathsDiv };
}

function createPhaseSection(): HTMLElement {
    const badge = document.createElement('div');
    badge.style.cssText = `
        display: inline-block;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        padding: 5px 12px;
        border-radius: 4px;
        background: rgba(120,130,200,0.12);
        border: 1px solid rgba(120,130,200,0.25);
        color: #7dd3fc;
        margin-bottom: 4px;
    `;
    return badge;
}

function createEnemyHPSection(): { container: HTMLElement; label: HTMLElement; barFill: HTMLElement; } {
    const container = document.createElement('div');
    container.style.cssText = 'margin-bottom: 4px; display: none;';

    const label = document.createElement('div');
    label.style.cssText = `
        font-size: 13px;
        color: #c0c8e0;
        margin-bottom: 8px;
        font-weight: 600;
    `;

    const barTrack = document.createElement('div');
    barTrack.style.cssText = `
        width: 100%;
        height: 6px;
        background: rgba(255,255,255,0.08);
        border-radius: 3px;
        overflow: hidden;
    `;

    const barFill = document.createElement('div');
    barFill.style.cssText = `
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, #f87171 0%, #fb923c 100%);
        border-radius: 3px;
        transition: width 0.12s ease;
    `;

    barTrack.appendChild(barFill);
    container.appendChild(label);
    container.appendChild(barTrack);

    return { container, label, barFill };
}

function createSpellcardSection(): { container: HTMLElement; name: HTMLElement; } {
    const container = document.createElement('div');
    container.style.cssText = `
        padding: 14px 16px;
        background: rgba(255, 80, 80, 0.07);
        border: 1px solid rgba(255, 80, 80, 0.28);
        border-radius: 6px;
        display: none;
    `;

    const spellLabel = document.createElement('div');
    spellLabel.textContent = '✦  SPELL CARD';
    spellLabel.style.cssText = `
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #ff6b6b;
        margin-bottom: 8px;
    `;

    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = `
        font-size: 17px;
        font-weight: 700;
        color: #ffbbbb;
        text-shadow: 0 0 10px rgba(255,160,160,0.5);
        font-style: italic;
        line-height: 1.4;
    `;

    container.appendChild(spellLabel);
    container.appendChild(nameDiv);
    return { container, name: nameDiv };
}

function createControlsGuide(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
        margin-top: auto;
        padding-top: 22px;
        border-top: 1px solid rgba(160,160,255,0.1);
    `;

    container.appendChild(makeSectionLabel('Controls'));

    const rows: [string, string][] = [
        ['Move', 'WASD  /  ↑↓←→'],
        ['Slow', 'Shift'],
        ['Shoot (toggle)', 'Space'],
        ['Bomb', 'Enter'],
    ];

    const table = document.createElement('div');
    table.style.cssText = 'display: flex; flex-direction: column; gap: 7px;';

    for (const [action, key] of rows) {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

        const actionEl = document.createElement('span');
        actionEl.textContent = action;
        actionEl.style.cssText = 'font-size: 15px; color: #6677aa;';

        const keyEl = document.createElement('span');
        keyEl.textContent = key;
        keyEl.style.cssText = `
            font-size: 14px;
            color: #9999cc;
            font-family: 'Courier New', monospace;
            background: rgba(255,255,255,0.04);
            padding: 2px 8px;
            border-radius: 3px;
            border: 1px solid rgba(255,255,255,0.08);
        `;

        row.appendChild(actionEl);
        row.appendChild(keyEl);
        table.appendChild(row);
    }

    container.appendChild(table);
    return container;
}

export function initOverlay(): void {
    loadHighScore();

    const panel = createStatPanel();
    panel.appendChild(createGameTitle());

    const scoreSection = createScoreSection();
    hiScoreElement = scoreSection.hiScore;
    scoreElement = scoreSection.score;
    panel.appendChild(scoreSection.container);

    panel.appendChild(makeDivider());

    const statsSection = createStatsSection();
    bombElement = statsSection.bomb;
    livesElement = statsSection.lives;
    deathsElement = statsSection.deaths;
    panel.appendChild(statsSection.container);

    panel.appendChild(makeDivider());

    const phaseWrap = document.createElement('div');
    phaseWrap.style.marginBottom = '16px';
    phaseWrap.appendChild(makeSectionLabel('Phase'));
    phaseElement = createPhaseSection();
    phaseWrap.appendChild(phaseElement);
    panel.appendChild(phaseWrap);

    const enemyHpSection = createEnemyHPSection();
    enemyHpElement = enemyHpSection.label;
    enemyHpBarFill = enemyHpSection.barFill;
    enemyHpContainer = enemyHpSection.container;
    panel.appendChild(enemyHpContainer);

    panel.appendChild(makeDivider());

    const spellcardSection = createSpellcardSection();
    spellcardElement = spellcardSection.container;
    spellcardNameElement = spellcardSection.name;
    panel.appendChild(spellcardSection.container);

    panel.appendChild(createControlsGuide());

    document.body.appendChild(panel);
}

function formatScore(score: number): string {
    return score.toString().padStart(SCORE_DIGITS, '0');
}

export function updateOverlay(state: GameState): void {
    if (!scoreElement || !hiScoreElement || !bombElement || !livesElement || !deathsElement ||
        !phaseElement || !enemyHpElement || !enemyHpContainer || !enemyHpBarFill ||
        !spellcardElement || !spellcardNameElement) {
        return;
    }

    if (state.score > hiScore) {
        hiScore = state.score;
        localStorage.setItem('toufou_hiscore', hiScore.toString());
    }

    hiScoreElement.textContent = formatScore(hiScore);
    scoreElement.textContent = formatScore(state.score);

    for (let i = 0; i < bombElements.length; i++) {
        bombElements[i].style.opacity = i < state.current_bomb ? '1' : '0.15';
    }

    const livesClamped = Math.min(MAX_LIVES, Math.max(0, state.lives));
    for (let i = 0; i < heartElements.length; i++) {
        heartElements[i].style.opacity = i < livesClamped ? '1' : '0.15';
        heartElements[i].style.display = 'inline-block';
    }

    deathsElement.textContent = `${state.deaths}`;

    // Phase badge
    const phase = state.current_phase;
    phaseElement.textContent = `◆  ${PHASE_LABELS[phase] ?? 'Unknown'}`;
    phaseElement.style.color = PHASE_COLORS[phase] ?? '#aaa';
    phaseElement.style.borderColor = `${PHASE_COLORS[phase] ?? '#aaa'}44`;
    phaseElement.style.background = `${PHASE_COLORS[phase] ?? '#aaa'}14`;

    // Enemy HP bar
    let hpEntity: { hp: number; maxHp: number } | undefined;
    if (phase === StagePhase.BOSS && state.boss) {
        hpEntity = state.boss;
    } else if (phase === StagePhase.MIDBOSS && state.midboss) {
        hpEntity = state.midboss;
    }

    if (hpEntity) {
        enemyHpContainer.style.display = 'block';
        const pct = Math.max(0, Math.min(1, hpEntity.hp / hpEntity.maxHp));
        enemyHpElement.textContent = `HP  ${hpEntity.hp} / ${hpEntity.maxHp}`;
        enemyHpBarFill.style.width = `${pct * 100}%`;
    } else {
        enemyHpContainer.style.display = 'none';
    }

    // Spellcard
    if (state.boss?.spellcard_on && state.boss.spellcard) {
        spellcardNameElement.textContent = `"${state.boss.spellcard}"`;
        spellcardElement.style.display = 'block';
    } else {
        spellcardElement.style.display = 'none';
    }
}
