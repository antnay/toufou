interface GameState {
    stage: Stage;
    current_phase: Phase;
    player: Player;
    losers: Loser[];
    mid_boss: MidBoss;
    boss: Boss;
    current_bomb: number;
    score: number;
    deaths: number;
}

enum Phase {
    LOSERS,
    MID_BOSS,
    BOSS,
}

// represents the player
interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    skin: string;
    bullets: Bullet[];
}

// represents the lesser enemy
interface Loser {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    skin: string;
    bullets: Bullet[];
}

// represents the midboss
interface MidBoss extends Loser {
    current_phase: MidBossPhase;
}

enum MidBossPhase {
    ONE,
    TWO,
}

// represents the final boss
interface Boss extends Loser {
    current_phase: BossPhase;
    spellcard_on: boolean;
    spellcard: string;
}

enum BossPhase {
    ONE,
    TWO,
    THREE,
}

// represents a bullet
interface Bullet {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    owner: Player | Loser | MidBoss | Boss;
    skin: string;
}

// todo: modify starting positions and dimensions
async function initState(): Promise<GameState> {
    return {
        stage: await loadStage("stage1.json"),
        current_phase: Phase.LOSERS,
        player: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            speed: 0,
            skin: "",
            bullets: [],
        },
        losers: [],
        mid_boss: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            speed: 0,
            skin: "",
            bullets: [],
            current_phase: 0,
        },
        boss: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            speed: 0,
            skin: "",
            bullets: [],
            current_phase: 0,
            spellcard_on: false,
            spellcard: "",
        },
        current_bomb: 0,
        score: 0,
        deaths: 0,
    };
}