import { HitBox } from "./hitbox";
import { loadStage, Loser, MidBoss, Boss, StagePhase, Player, Stage, MidBossPhase, BossPhase, Direction } from './stageloader';
import { AssetManager } from "./assetmanager";
import { BulletPatternDef } from "./patterns";
import { AudioManager } from "./audiomanager";

export interface BombEffect {
    flashAlpha: number;
    shockRadius: number;
    shockAlpha: number;
}

export interface GameState {
    stage: Stage;
    isInfinite: boolean;
    current_phase: StagePhase;
    player: Player;
    shooting: boolean;
    _toggleShooting: boolean;
    _toggleBomb: boolean;
    losers: Loser[];
    midboss: MidBoss | undefined;
    boss: Boss | undefined;
    lives: number;
    current_bomb: number;
    score: number;
    deaths: number;
    assets: AssetManager;
    audio: AudioManager;
    patterns: Map<string, BulletPatternDef>;
    dt: number;
    bombEffect: BombEffect | null;
    hitEffect: number;
    secretSoundPlayed: boolean;
}

export async function initState(stagePath: string = "stages/one.json"): Promise<GameState> {
    const stage = await loadStage(stagePath);

    const assets = new AssetManager();
    await assets.loadStageAssets(stage);

    const audio = new AudioManager();
    // Load common SFX
    // await audio.loadAudio("hit", "assets/hit.wav");
    // await audio.loadAudio("shoot", "assets/shoot.wav");
    // await audio.loadAudio("bomb", "assets/bomb.wav");

    const copyAudio = (name?: string) => {
        if (name) {
            const buffer = assets.getAudio(name);
            if (buffer) {
                (audio as any).buffers.set(name, buffer);
            }
        }
    };

    copyAudio(stage.music);
    copyAudio(stage.bomb_sound);
    copyAudio(stage.player_hit_sound);
    copyAudio(stage.midboss_spawn_sound);
    copyAudio(stage.midboss_death_sound);
    copyAudio(stage.boss_spawn_sound);
    copyAudio(stage.boss_death_sound);

    await assets.loadAudio("secret", "assets/secret.mp3");
    copyAudio("secret");

    return {
        stage: stage,
        isInfinite: stagePath.includes("infinite"),
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
        _toggleBomb: false,
        lives: Math.min(3, Math.max(0, stage.player.initial_lives)),
        current_bomb: stage.player.initial_bombs,
        score: 0,
        deaths: 0,
        assets: assets,
        audio: audio,
        patterns: assets.patterns,
        dt: 0,
        bombEffect: null,
        hitEffect: 0,
        secretSoundPlayed: false,
    };
}