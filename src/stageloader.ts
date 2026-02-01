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
    timeline: { frame: number, type: string, x: number, y: number; }[];
    spellcards: {
        easy: string[];
        medium: string[];
        hard: string[];
    };

    // add more stuff as needed
}

export interface EnemyPhase {
    speed: number;
    x: number;
    y: number;
    hitbox: number;
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
    MID_BOSS,
    BOSS,
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
}

// represents the midboss
export interface MidBoss {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    bullets: Bullet[];
    patternInstances?: BulletPatternInstance[];
    animator?: Animator;
    current_phase: MidBossPhase;
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
    bullets: Bullet[];
    patternInstances?: BulletPatternInstance[];
    animator?: Animator;
    current_phase: BossPhase;
    spellcard_on: boolean;
    spellcard: string;
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
}

export interface InputState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    shoot: boolean;
    bomb: boolean;
}