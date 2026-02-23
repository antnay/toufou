import { Animator } from './animator';
import { StagePhase, Loser, Stage, MidBossPhase, BossPhase, Direction, MidBoss, Boss, Scene, LoserConfig } from './stageloader';
import { GameState } from "./state";
import { HitBox } from "./hitbox";
import type { BulletPatternDef, BulletPatternInstance } from "./patterns";

export const TARGET_FPS = 180;

export class Director {
    private frameCount: number = 0;
    private sceneQueue: Scene[] = [];
    private sceneIndex: number = 0;
    private sceneActive: boolean = false;

    async update(state: GameState) {
        this.frameCount++;

        if (!this.sceneActive && this.sceneIndex < this.sceneQueue.length) {
            this.startNextScene(state);
        }

        if (this.sceneActive && this.isSceneCleared(state)) {
            console.log(`Scene ${this.sceneIndex} cleared`);
            this.sceneActive = false;
        }

        this.updateLoserMovement(state);
        this.updateEnemyPatterns(state);
    }

    initGame(state: GameState) {
        this.frameCount = 0;
        state.player = this.createPlayer(state, state.stage.player.x, state.stage.player.y);

        if (state.stage.timeline && state.stage.timeline.length > 0) {
            this.sceneQueue = [...state.stage.timeline];
            this.sceneIndex = 0;
            this.sceneActive = false;
        }
    }

    createPlayer(state: GameState, x: number, y: number) {
        let playerAnimator: Animator | undefined;
        try {
            const playerImg = state.assets.getImage(state.stage.player.animation_idle.sprite);
            playerAnimator = new Animator(
                playerImg,
                state.stage.player.animation_idle.x,
                state.stage.player.animation_idle.y,
                state.stage.player.animation_idle.width,
                state.stage.player.animation_idle.height,
                state.stage.player.animation_idle.frames,
                state.stage.player.animation_idle.speed
            );
        } catch (e) {
            console.error("Failed to create player animator", e);
        }

        return {
            x: x,
            y: y,
            width: state.stage.player.animation_idle.width * state.stage.player.animation_idle.scale,
            height: state.stage.player.animation_idle.height * state.stage.player.animation_idle.scale,
            direction: Direction.IDLE,
            hitbox: new HitBox(0, 0, state.stage.player.hitbox),
            speed: state.stage.player.speed,
            bullets: [],
            animator: playerAnimator
        };
    }

    createLoser(state: GameState, x: number, y: number, loserType?: string): Loser {
        const config = this.getLoserConfig(state, loserType);
        const animator = new Animator(
            state.assets.getImage(config.animation.sprite),
            config.animation.x,
            config.animation.y,
            config.animation.width,
            config.animation.height,
            config.animation.frames,
            config.animation.speed
        );
        const hp = config.hp;
        const hitbox = new HitBox(x, y, config.hitbox);
        return {
            x,
            y,
            width: config.animation.width * config.animation.scale,
            height: config.animation.height * config.animation.scale,
            speed: config.speed,
            hp,
            maxHp: hp,
            vx: config.speed,
            bullets: [],
            animator,
            patternNames: config.patterns,
            patternCycle: {
                index: 0,
                activeEndFrame: 0,
                gapEndFrame: 0,
            },
            hitbox,
            bulletSprite: config.bullet.animation.sprite,
            bulletAnimation: config.bullet.animation,
            animationScale: config.animation.scale,
        };
    }

    private getLoserConfig(state: GameState, loserType?: string): LoserConfig {
        const types = state.stage.loser_types;
        if (loserType && types && types[loserType]) return types[loserType];
        return state.stage.loser;
    }

    createMidBoss(state: GameState, x: number, y: number): MidBoss {
        let midBossAnimator: Animator | undefined;
        try {
            const midBossImg = state.assets.getImage(state.stage.midboss.phases[MidBossPhase.ONE].animation.sprite);
            midBossAnimator = new Animator(
                midBossImg,
                state.stage.midboss.phases[MidBossPhase.ONE].animation.x,
                state.stage.midboss.phases[MidBossPhase.ONE].animation.y,
                state.stage.midboss.phases[MidBossPhase.ONE].animation.width,
                state.stage.midboss.phases[MidBossPhase.ONE].animation.height,
                state.stage.midboss.phases[MidBossPhase.ONE].animation.frames,
                state.stage.midboss.phases[MidBossPhase.ONE].animation.speed
            );
        } catch (e) {
            console.error("Failed to create mid boss animator", e);
        }

        const phase = state.stage.midboss.phases[MidBossPhase.ONE];
        const initialHp = phase.hp ?? 75;

        return {
            x: x,
            y: y,
            width: phase.animation.width * phase.animation.scale,
            height: phase.animation.height * phase.animation.scale,
            hitbox: new HitBox(0, 0, phase.hitbox),
            speed: phase.speed,
            hp: initialHp,
            maxHp: initialHp,
            bullets: [],
            animator: midBossAnimator,
            patterns: phase.patterns ?? [],
            patternCycle: {
                index: 0,
                activeEndFrame: 0,
                gapEndFrame: 0,
            },
            current_phase: MidBossPhase.ONE,
        };
    }

    createBoss(state: GameState, x: number, y: number): Boss {
        let bossAnimator: Animator | undefined;
        try {
            const bossImg = state.assets.getImage(state.stage.boss.phases[BossPhase.ONE].animation.sprite);
            bossAnimator = new Animator(
                bossImg,
                state.stage.boss.phases[BossPhase.ONE].animation.x,
                state.stage.boss.phases[BossPhase.ONE].animation.y,
                state.stage.boss.phases[BossPhase.ONE].animation.width,
                state.stage.boss.phases[BossPhase.ONE].animation.height,
                state.stage.boss.phases[BossPhase.ONE].animation.frames,
                state.stage.boss.phases[BossPhase.ONE].animation.speed
            );
        } catch (e) {
            console.error("Failed to create boss animator", e);
        }

        const phase = state.stage.boss.phases[BossPhase.ONE];
        const initialHp = phase.hp ?? 125;

        return {
            x: x,
            y: y,
            width: phase.animation.width * phase.animation.scale,
            height: phase.animation.height * phase.animation.scale,
            hitbox: new HitBox(0, 0, phase.hitbox),
            speed: phase.speed,
            hp: initialHp,
            maxHp: initialHp,
            bullets: [],
            animator: bossAnimator,
            current_phase: BossPhase.ONE,
            spellcard_on: false,
            spellcard: "",
            patterns: phase.patterns ?? [],
            patternCycle: {
                index: 0,
                activeEndFrame: 0,
                gapEndFrame: 0,
            },
        };
    }

    private spawnEvent(event: { type: string; x: number; y: number; loserType?: string }, state: GameState) {
        switch (event.type) {
            case "LOSER": {
                state.current_phase = StagePhase.LOSERS;
                state.losers.push(this.createLoser(state, event.x, event.y, event.loserType));
                console.log(`Spawned LOSER${event.loserType ? ` (${event.loserType})` : ""} at ${event.x}, ${event.y}`);
                break;
            }
            case "MIDBOSS":
                state.current_phase = StagePhase.MIDBOSS;
                state.losers = [];
                state.boss = undefined;
                state.midboss = this.createMidBoss(state, event.x, event.y);
                console.log(`Spawned MIDBOSS at ${event.x}, ${event.y}`);
                break;
            case "BOSS":
                state.current_phase = StagePhase.BOSS;
                state.losers = [];
                state.midboss = undefined;
                state.boss = this.createBoss(state, event.x, event.y);
                console.log(`Spawned BOSS at ${event.x}, ${event.y}`);
                break;
            default:
                console.warn(`Unknown event type: ${event.type}`);
                break;
        }
    }

    /** Spawn all enemies in the next scene and mark it as active. */
    private startNextScene(state: GameState) {
        const scene = this.sceneQueue[this.sceneIndex];
        console.log(`Starting scene ${this.sceneIndex + 1}/${this.sceneQueue.length}`);
        for (const enemy of scene.enemies) {
            this.spawnEvent(enemy, state);
        }
        this.sceneActive = true;
    }

    /** Check whether all enemies from the current scene are dead. */
    private isSceneCleared(state: GameState): boolean {
        const losersAlive = state.losers.some(l => l.hp > 0);
        if (losersAlive) return false;
        if (state.losers.length > 0) return false;
        if (state.midboss && state.midboss.hp > 0) return false;
        if (state.boss && state.boss.hp > 0) return false;
        this.sceneIndex++;
        if (this.sceneIndex >= this.sceneQueue.length) {
            state.current_phase = StagePhase.CLEAR;
        }
        return true;
    }

    private updateEnemyPatterns(state: GameState) {
        for (const loser of state.losers) {
            const cycle = loser.patternCycle;
            const patternNames = loser.patternNames;
            if (!cycle || !patternNames || patternNames.length === 0) continue;

            if (cycle.active) {
                if (this.frameCount <= cycle.activeEndFrame) {
                    const bullets = cycle.active.update({
                        owner: loser,
                        player: state.player,
                        bulletSprite: loser.bulletSprite,
                        bulletAnimation: loser.bulletAnimation,
                        getBulletImage: (sprite) => state.assets.getImage(sprite),
                        dt: state.dt,
                    });
                    if (bullets.length > 0) {
                        loser.bullets.push(...bullets);
                    }
                } else {
                    cycle.active = undefined;
                    cycle.gapEndFrame = this.frameCount + PATTERN_GAP_FRAMES;
                }
                continue;
            }

            if (this.frameCount < cycle.gapEndFrame) continue;

            const nextName = patternNames[cycle.index % patternNames.length];
            const def = state.patterns.get(nextName);
            if (!def) continue;

            cycle.active = def.createInstance();
            cycle.activeEndFrame = this.frameCount + getPatternDurationFrames(def);
            cycle.index = (cycle.index + 1) % patternNames.length;
        }

        if (state.midboss) {
            this.updateBossLikePatterns(
                state,
                state.midboss,
                state.stage.midboss.phases[state.midboss.current_phase].bullet.animation
            );
        }

        if (state.boss) {
            this.updateBossLikePatterns(
                state,
                state.boss,
                state.stage.boss.phases[state.boss.current_phase].bullet.animation
            );
        }
    }

    private updateBossLikePatterns(
        state: GameState,
        entity: import('./stageloader').MidBoss | import('./stageloader').Boss,
        bulletAnimation: import('./stageloader').Stage["loser"]["bullet"]["animation"]
    ) {
        const cycle = entity.patternCycle;
        const patternNames = entity.patterns;
        if (!cycle || !patternNames || patternNames.length === 0) return;

        if (cycle.active) {
            if (this.frameCount <= cycle.activeEndFrame) {
                const bullets = cycle.active.update({
                    owner: entity,
                    player: state.player,
                    bulletSprite: bulletAnimation.sprite,
                    bulletAnimation,
                    getBulletImage: (sprite) => state.assets.getImage(sprite),
                    dt: state.dt,
                });
                if (bullets.length > 0) {
                    entity.bullets.push(...bullets);
                }
            } else {
                cycle.active = undefined;
                cycle.gapEndFrame = this.frameCount + PATTERN_GAP_FRAMES;
            }
            return;
        }

        if (this.frameCount < cycle.gapEndFrame) return;

        const nextName = patternNames[cycle.index % patternNames.length];
        const def = state.patterns.get(nextName);
        if (!def) return;

        cycle.active = def.createInstance();
        cycle.activeEndFrame = this.frameCount + getPatternDurationFrames(def);
        cycle.index = (cycle.index + 1) % patternNames.length;
    }

    private updateLoserMovement(state: GameState) {
        if (state.losers.length === 0) return;
        const scale = state.dt * TARGET_FPS;

        for (const loser of state.losers) {
            loser.x += loser.vx * scale;

            const leftEdge = loser.x - loser.width / 2;
            const rightEdge = loser.x + loser.width / 2;

            if (leftEdge <= LOSER_LEFT_BOUND) {
                loser.x = LOSER_LEFT_BOUND + loser.width / 2;
                loser.vx = Math.abs(loser.vx);
            } else if (rightEdge >= LOSER_RIGHT_BOUND) {
                loser.x = LOSER_RIGHT_BOUND - loser.width / 2;
                loser.vx = -Math.abs(loser.vx);
            }
        }
    }

}

// Pattern duration in frames
function getPatternDurationFrames(def: BulletPatternDef): number {
    const seconds = typeof def.config.durationSeconds === "number" && def.config.durationSeconds > 0
        ? def.config.durationSeconds
        : DEFAULT_PATTERN_DURATION_SECONDS;
    return Math.max(1, Math.round(seconds * TARGET_FPS));
}

const DEFAULT_PATTERN_DURATION_SECONDS = 3;

// gap between patterns
const PATTERN_GAP_SECONDS = 0;
const PATTERN_GAP_FRAMES = Math.round(PATTERN_GAP_SECONDS * TARGET_FPS);

const CANVAS_WIDTH = 600;
const LOSER_LEFT_BOUND = 50;
const LOSER_RIGHT_BOUND = CANVAS_WIDTH - 50;