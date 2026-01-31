import { HitBox } from "./hitbox";
import { Animator } from "./animator";
import { loadStage, Loser, MidBoss, Boss, StagePhase, Player, Stage, MidBossPhase, BossPhase } from './stageloader';
import { AssetManager } from "./assetmanager";

export interface GameState {
    stage: Stage;
    current_phase: StagePhase;
    player: Player;
    losers: Loser[];
    midboss: MidBoss;
    boss: Boss;
    current_bomb: number;
    score: number;
    deaths: number;
    assets: AssetManager;
}

export async function initState(): Promise<GameState> {
    const stage = await loadStage("stages/stage1.json");

    const assets = new AssetManager();
    await assets.loadStageAssets(stage);

    return {
        stage: stage,
        current_phase: StagePhase.LOSERS,
        player: {
            x: stage.player.x - stage.player.animation.width / 2,
            y: stage.player.y - stage.player.animation.height / 2,
            width: stage.player.animation.width * stage.player.animation.scale,
            height: stage.player.animation.height * stage.player.animation.scale,
            hitbox: new HitBox(stage.player.x - stage.player.animation.width / 2, stage.player.y - stage.player.animation.height / 2, 5), // radius 5
            speed: stage.player.speed,
            bullets: []
        },
        losers: [],
        midboss: {
            x: 0, y: 0, width: 0, height: 0, speed: 0, bullets: [], current_phase: MidBossPhase.ONE,
        },
        boss: {
            x: 0, y: 0, width: 0, height: 0, speed: 0, bullets: [], current_phase: BossPhase.ONE, spellcard_on: false, spellcard: "",
        },
        current_bomb: stage.player.initial_bombs,
        score: 0,
        deaths: 0,
        assets: assets,
    };
}