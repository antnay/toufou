import { Animator } from './animator';
import { StagePhase, Loser, Stage, MidBossPhase, BossPhase, Direction } from './stageloader';
import { GameState } from "./state";
import { HitBox } from "./hitbox";
import type { BulletPatternDef, BulletPatternInstance } from "./patterns";

export class Director {
    private frameCount: number = 0;

    async update(state: GameState) {
        this.frameCount++;

        switch (state.current_phase) {
            case StagePhase.LOSERS:
                break;
            case StagePhase.MID_BOSS:
                break;
            case StagePhase.BOSS:
                break;
        }

        if (state.stage.timeline) {
            const currentEvents = state.stage.timeline.filter(e => e.frame === this.frameCount);
            for (const event of currentEvents) {
                await this.spawnEvent(event, state);
            }
        }

        this.updateLoserMovement(state);
        this.updateEnemyPatterns(state);
        if (state.losers.length === 0 && this.timelineFinished(state)) {
            state.current_phase = StagePhase.MID_BOSS;
        }
    }

    initGame(state: GameState) {
        state.player = this.createPlayer(state);
    }

    createPlayer(state: GameState) {
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
            x: state.stage.player.x,
            y: state.stage.player.y,
            width: state.stage.player.animation_idle.width * state.stage.player.animation_idle.scale,
            height: state.stage.player.animation_idle.height * state.stage.player.animation_idle.scale,
            direction: Direction.IDLE,
            hitbox: new HitBox(0, 0, state.stage.player.hitbox),
            speed: state.stage.player.speed,
            bullets: [],
            animator: playerAnimator
        };
    }

    createLoser(stage: Stage, x: number, y: number, animator?: Animator, patternNames: string[] = []): Loser {
        return {
            x,
            y,
            width: stage.loser.animation.width * stage.loser.animation.scale,
            height: stage.loser.animation.height * stage.loser.animation.scale,
            speed: stage.loser.speed,
            vx: stage.loser.speed,
            bullets: [],
            animator,
            patternNames,
            patternCycle: {
                index: 0,
                activeEndFrame: 0,
                gapEndFrame: 0,
            },
        };
    }

    createMidBoss(state: GameState) {
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

        return {
            x: state.stage.timeline.find(e => e.type === "MID_BOSS")?.x,
            y: state.stage.timeline.find(e => e.type === "MID_BOSS")?.y,
            width: state.stage.midboss.phases[MidBossPhase.ONE].animation.width * state.stage.midboss.phases[MidBossPhase.ONE].animation.scale,
            height: state.stage.midboss.phases[MidBossPhase.ONE].animation.height * state.stage.midboss.phases[MidBossPhase.ONE].animation.scale,
            hitbox: new HitBox(0, 0, state.stage.midboss.phases[MidBossPhase.ONE].hitbox),
            speed: state.stage.midboss.phases[MidBossPhase.ONE].speed,
            bullets: [],
            animator: midBossAnimator,
            current_phase: MidBossPhase.ONE,
        };
    }

    createBoss(state: GameState) {
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

        return {
            x: state.stage.timeline.find(e => e.type === "BOSS")?.x,
            y: state.stage.timeline.find(e => e.type === "BOSS")?.y,
            width: state.stage.boss.phases[BossPhase.ONE].animation.width * state.stage.boss.phases[BossPhase.ONE].animation.scale,
            height: state.stage.boss.phases[BossPhase.ONE].animation.height * state.stage.boss.phases[BossPhase.ONE].animation.scale,
            hitbox: new HitBox(0, 0, state.stage.boss.phases[BossPhase.ONE].hitbox),
            speed: state.stage.boss.phases[BossPhase.ONE].speed,
            bullets: [],
            animator: bossAnimator,
            current_phase: BossPhase.ONE,
            spellcard_on: false,
            spellcard: "",
        };
    }

    private async spawnEvent(event: any, state: GameState) {
        switch (event.type) {
            case "LOSER": {
                // name of the pattern is the file name without the extension
                const patternNames = ["straight"];
                state.losers.push(this.createLoser(
                    state.stage,
                    event.x,
                    event.y,
                    new Animator(
                        state.assets.getImage(state.stage.loser.animation.sprite),
                        state.stage.loser.animation.x,
                        state.stage.loser.animation.y,
                        state.stage.loser.animation.width,
                        state.stage.loser.animation.height,
                        state.stage.loser.animation.frames,
                        state.stage.loser.animation.speed
                    ),
                    patternNames
                ));
                console.log(`Spawned LOSER at ${event.x}, ${event.y}`);
                break;
            }
            case "MIDBOSS":
                // state.midboss = this.createMidBoss(state);
                break;
            case "BOSS":
                // state.boss = this.createBoss(state);
                break;
            default:
                console.warn(`Unknown event type: ${event.type}`);
                break;
        }
    }

    private updateEnemyPatterns(state: GameState) {
        if (state.losers.length === 0) return;

        for (const loser of state.losers) {
            const cycle = loser.patternCycle;
            const patternNames = loser.patternNames;
            if (!cycle || !patternNames || patternNames.length === 0) continue;

            if (cycle.active) {
                if (this.frameCount <= cycle.activeEndFrame) {
                    const bullets = cycle.active.update({
                        owner: loser,
                        player: state.player,
                        bulletSprite: state.stage.loser.bullet.animation.sprite,
                        bulletAnimation: state.stage.loser.bullet.animation,
                        getBulletImage: (sprite) => state.assets.getImage(sprite),
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
    }

    private updateLoserMovement(state: GameState) {
        if (state.losers.length === 0) return;

        for (const loser of state.losers) {
            loser.x += loser.vx;

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

    private timelineFinished(state: GameState): boolean {
        if (!state.stage.timeline || state.stage.timeline.length === 0) return true;
        const lastEventFrame = Math.max(...state.stage.timeline.map(e => e.frame));
        return this.frameCount > lastEventFrame;
    }
}

// Pattern duration in frames
function getPatternDurationFrames(def: BulletPatternDef): number {
    const seconds = typeof def.config.durationSeconds === "number" && def.config.durationSeconds > 0
        ? def.config.durationSeconds
        : DEFAULT_PATTERN_DURATION_SECONDS;
    return Math.max(1, Math.round(seconds * FRAMES_PER_SECOND));
}

const FRAMES_PER_SECOND = 60;
const DEFAULT_PATTERN_DURATION_SECONDS = 3;

// gap between patterns
const PATTERN_GAP_SECONDS = 0;
const PATTERN_GAP_FRAMES = Math.round(PATTERN_GAP_SECONDS * FRAMES_PER_SECOND);

const CANVAS_WIDTH = 600;
const LOSER_LEFT_BOUND = 50;
const LOSER_RIGHT_BOUND = CANVAS_WIDTH - 50;