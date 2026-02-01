import { Animator } from './animator';
import { StagePhase, Loser, Stage, MidBossPhase, BossPhase, Direction } from './stageloader';
import { GameState } from "./state";
import { HitBox } from "./hitbox";
import type { BulletPatternInstance } from "./patterns";

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
            const playerImg = state.assets.get(state.stage.player.animation_idle.sprite);
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
            hitbox: new HitBox(0, 0, 5),
            speed: state.stage.player.speed,
            bullets: [],
            animator: playerAnimator
        };
    }

    createLoser(stage: Stage, x: number, y: number, animator?: Animator, patternInstances: BulletPatternInstance[] = []): Loser {
        return {
            x,
            y,
            width: stage.loser.animation.width * stage.loser.animation.scale,
            height: stage.loser.animation.height * stage.loser.animation.scale,
            speed: stage.loser.speed,
            bullets: [],
            animator,
            patternInstances
        };
    }

    createMidBoss(state: GameState) {
        let midBossAnimator: Animator | undefined;
        try {
            const midBossImg = state.assets.get(state.stage.midboss.phases[MidBossPhase.ONE].animation.sprite);
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
            hitbox: new HitBox(0, 0, 5),
            speed: state.stage.midboss.phases[MidBossPhase.ONE].speed,
            bullets: [],
            animator: midBossAnimator,
            current_phase: MidBossPhase.ONE,
        };
    }

    createBoss(state: GameState) {
        let bossAnimator: Animator | undefined;
        try {
            const bossImg = state.assets.get(state.stage.boss.phases[BossPhase.ONE].animation.sprite);
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
            hitbox: new HitBox(0, 0, 5),
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
                const patterns = this.createLoserPatterns(state);
                state.losers.push(this.createLoser(
                    state.stage,
                    event.x,
                    event.y,
                    new Animator(
                        state.assets.get(state.stage.loser.animation.sprite),
                        state.stage.loser.animation.x,
                        state.stage.loser.animation.y,
                        state.stage.loser.animation.width,
                        state.stage.loser.animation.height,
                        state.stage.loser.animation.frames,
                        state.stage.loser.animation.speed
                    ),
                    patterns
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
            if (!loser.patternInstances || loser.patternInstances.length === 0) continue;
            for (const pattern of loser.patternInstances) {
                const bullets = pattern.update({
                    owner: loser,
                    player: state.player,
                    bulletSprite: state.stage.loser.bullet.animation.sprite,
                    bulletAnimation: state.stage.loser.bullet.animation,
                    getBulletImage: (sprite) => state.assets.get(sprite),
                });
                if (bullets.length > 0) {
                    loser.bullets.push(...bullets);
                }
            }
        }
    }

    private createLoserPatterns(state: GameState): BulletPatternInstance[] {
        const patterns = Array.from(state.patterns.values());
        if (patterns.length === 0) return [];
        return [patterns[0].createInstance()];
    }
    
    private timelineFinished(state: GameState): boolean {
        if (!state.stage.timeline || state.stage.timeline.length === 0) return true;
        const lastEventFrame = Math.max(...state.stage.timeline.map(e => e.frame));
        return this.frameCount > lastEventFrame;
    }
}