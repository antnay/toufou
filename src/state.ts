import { HitBox } from "./hitbox";
import { Animator } from "./animator";
import { loadStage, Loser, MidBoss, Boss, StagePhase, Player, Stage, MidBossPhase, BossPhase, Direction } from './stageloader';
import { AssetManager } from "./assetmanager";
import { BulletPatternDef } from "./patterns";

export interface GameState {
    stage: Stage;
    current_phase: StagePhase;
    player: Player;
    shooting: boolean;
    _toggleShooting: boolean;
    losers: Loser[];
    midboss: MidBoss | undefined;
    boss: Boss | undefined;
    lives: number;
    current_bomb: number;
    score: number;
    deaths: number;
    assets: AssetManager;
    patterns: Map<string, BulletPatternDef>;
}

export async function initState(): Promise<GameState> {
    const stage = await loadStage("stages/stage2.json");

    const assets = new AssetManager();
    await assets.loadStageAssets(stage);

    return {
        stage: stage,
        current_phase: StagePhase.CLEAR,
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
        midboss: undefined,
        boss: undefined,
        shooting: false,
        _toggleShooting: false,
        lives: Math.min(3, Math.max(0, stage.player.initial_lives)),
        current_bomb: stage.player.initial_bombs,
        score: 0,
        deaths: 0,
        assets: assets,
        patterns: assets.patterns,
    };
}