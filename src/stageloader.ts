import { Animator } from './animator';
import { HitBox } from './hitbox';
import type { BulletPatternInstance } from "./patterns";

export interface Stage {
    background: string;
    player: {
        speed: number;
        x: number;
        y: number;
        initial_lives: number;
        initial_bombs: number;
        bomb_freq: number;
        hitbox: number;
        animation_up: {
            sprite: string;
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
        animation_down: {
            sprite: string;
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
        animation_left: {
            sprite: string;
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
        animation_right: {
            sprite: string;
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
        animation_idle: {
            sprite: string;
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
        player_bullet: {
            animation: {
                sprite: string;
                x: number;
                y: number;
                width: number;
                height: number;
                frames: number;
                speed: number;
                scale: number;
            };
        },
    },
    loser: {
        speed: number;
        hitbox: number;
        hp: number;
        patterns: string[];
        animation: {
            sprite: string;
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
        bullet: {
            animation: {
                sprite: string;
                x: number;
                y: number;
                width: number;
                height: number;
                frames: number;
                speed: number;
                scale: number;
            };
        };
    },
    midboss: {
        phases: EnemyPhase[];
    },
    boss: {
        phases: EnemyPhase[];
    };
    pattern_index: string[];
    timeline: Scene[];
    spellcards: {
        easy: string[];
        medium: string[];
        hard: string[];
    };

    // optional: named loser variants (different sprites/bullets). key = loserType in timeline.
    loser_types?: Record<string, LoserConfig>;
}

export interface LoserConfig {
    speed: number;
    hitbox: number;
    hp: number;
    patterns: string[];
    animation: {
        sprite: string;
        x: number;
        y: number;
        width: number;
        height: number;
        frames: number;
        speed: number;
        scale: number;
    };
    bullet: {
        animation: {
            sprite: string;
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
    };
}

export interface EnemyPhase {
    speed: number;
    hitbox: number;
    hp: number;
    patterns: string[];
    animation: {
        sprite: string;
        x: number;
        y: number;
        width: number;
        height: number;
        frames: number;
        speed: number;
        scale: number;
    };
    bullet: {
        animation: {
            sprite: string;
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
    };
}

export async function loadStage(path: string): Promise<Stage> {
    return await fetch(path).then((response) => response.json()).catch((error) => {
        console.error(error);
        throw error;
    });
}


export enum StagePhase {
    LOSERS = 0,
    MIDBOSS,
    BOSS,
    CLEAR,
}

// represents the player
export interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    direction: Direction;
    hitbox: HitBox;
    speed: number;
    bullets: Bullet[];
    animator?: Animator;
}

export enum Direction {
    UP = 0,
    DOWN,
    LEFT,
    RIGHT,
    IDLE,
}

// represents the lesser enemy
export interface Loser {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    hp: number;
    maxHp: number;
    vx: number;
    bullets: Bullet[];
    patternInstances?: BulletPatternInstance[];
    patternNames?: string[];
    // this should be on mid-boss or boss mob.
    // but let's keep it just for prototype.
    patternCycle?: {
        index: number;
        active?: BulletPatternInstance;
        activeEndFrame: number;
        gapEndFrame: number;
    };
    animator?: Animator;
    hitbox: HitBox;
    /** Bullet sprite for this loser type (used by patterns). */
    bulletSprite: string;
    /** Bullet animation for this loser type (used by patterns). */
    bulletAnimation: LoserConfig["bullet"]["animation"];
    /** Scale when drawing this loser. */
    animationScale: number;
}

// represents the midboss
export interface MidBoss {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    hp: number;
    maxHp: number;
    bullets: Bullet[];
    patternInstances?: BulletPatternInstance[];
    patterns: string[];
    animator?: Animator;
    current_phase: MidBossPhase;
    hitbox: HitBox;
}

export enum MidBossPhase {
    ONE = 0,
    TWO,
}

// represents the final boss
export interface Boss {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    hp: number;
    maxHp: number;
    bullets: Bullet[];
    patternInstances?: BulletPatternInstance[];
    patterns: string[];
    animator?: Animator;
    current_phase: BossPhase;
    spellcard_on: boolean;
    spellcard: string;
    hitbox: HitBox;
}

export enum BossPhase {
    ONE = 0,
    TWO,
    THREE,
}

// represents a bullet
export interface Bullet {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    vx?: number;
    vy?: number;
    owner: Player | Loser | MidBoss | Boss;
    animator?: Animator;
    skin?: string;
    scale?: number;
    hitbox: HitBox;
}

export interface InputState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    shoot: boolean;
    bomb: boolean;
}

export interface SceneEnemy {
    type: string;
    x: number;
    y: number;
    /** Which loser config to use when type is LOSER. Omit or use "default" for stage.loser. */
    loserType?: string;
}

export interface Scene {
    enemies: SceneEnemy[];
}