import { HitBox } from "./hitbox";
import { Animator } from "./animator";
import { loadStage, Loser, MidBoss, Boss, StagePhase, Player, Stage, MidBossPhase, BossPhase, Direction } from './stageloader';
import { AssetManager } from "./assetmanager";
import { BulletPatternDef } from "./patterns";

export interface GameState {
    stage: Stage;
    current_phase: StagePhase;
    player: Player;
    losers: Loser[];
    midboss: MidBoss;
    boss: Boss;
    lives: number;
    current_bomb: number;
    score: number;
    deaths: number;
    assets: AssetManager;
    patterns: Map<string, BulletPatternDef>;
}

export async function initState(): Promise<GameState> {
    const stage = await loadStage("stages/stage1.json");

    const assets = new AssetManager();
    await assets.loadStageAssets(stage);

    return {
        stage: stage,
        current_phase: StagePhase.LOSERS,
        player: {
            x: stage.player.x - stage.player.animation_idle.width / 2,
            y: stage.player.y - stage.player.animation_idle.height / 2,
            width: stage.player.animation_idle.width * stage.player.animation_idle.scale,
            height: stage.player.animation_idle.height * stage.player.animation_idle.scale,
            direction: Direction.IDLE,
            hitbox: new HitBox(stage.player.x - stage.player.animation_idle.width / 2, stage.player.y - stage.player.animation_idle.height / 2, stage.player.hitbox), // radius 5
            speed: stage.player.speed,
            bullets: []
        },
        losers: [],
        midboss: {
            x: 0, y: 0, width: 0, height: 0, speed: 0, bullets: [], current_phase: MidBossPhase.ONE, hitbox: new HitBox(0, 0, 0),
        },
        boss: {
            x: 0, y: 0, width: 0, height: 0, speed: 0, bullets: [], current_phase: BossPhase.ONE, spellcard_on: false, spellcard: "", hitbox: new HitBox(0, 0, 0),
        },
        lives: stage.player.initial_lives,
        current_bomb: stage.player.initial_bombs,
        score: 0,
        deaths: 0,
        assets: assets,
        patterns: assets.patterns,
    };
}