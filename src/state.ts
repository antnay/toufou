interface GameState {
    stage: Stage;
    player: Player;
    losers: Loser[];
    mid_boss: MidBoss;
    boss: Boss;
    current_bomb: number;
    score: number;
    deaths: number;
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
    current_phase: number;
}

// represents the final boss
interface Boss extends Loser {
    current_phase: number;
    spellcard_on: boolean;
    spellcard: string;
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