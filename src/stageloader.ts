import { Animator } from './animator';
import { HitBox } from './hitbox';

export interface Stage {
    background: string;
    player: {
        sprite: string;
        speed: number;
        x: number;
        y: number;
        initial_lives: number;
        initial_bombs: number;
        bomb_freq: number;
        animation: {
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
        player_bullet: {
            sprite: string;
            animation: {
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
        sprite: string;
        speed: number;
        animation: {
            x: number;
            y: number;
            width: number;
            height: number;
            frames: number;
            speed: number;
            scale: number;
        };
        bullet: {
            sprite: string;
            animation: {
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
    sprite: string;
    speed: number;
    x: number;
    y: number;
    animation: {
        x: number;
        y: number;
        width: number;
        height: number;
        frames: number;
        speed: number;
        scale: number;
    };
    bullet: {
        sprite: string;
        animation: {
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
    hitbox: HitBox;
    speed: number;
    bullets: Bullet[];
    animator?: Animator;
}

// represents the lesser enemy
export interface Loser {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    bullets: Bullet[];
    animator?: Animator;
}

// represents the midboss
export interface MidBoss extends Loser {
    current_phase: MidBossPhase;
}

export enum MidBossPhase {
    ONE = 0,
    TWO,
}

// represents the final boss
export interface Boss extends Loser {
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
    owner: Player | Loser | MidBoss | Boss;
    skin: string;
}

export interface InputState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    shoot: boolean;
    bomb: boolean;
}
