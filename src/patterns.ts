import { Animator } from "./animator";
import { HitBox } from "./hitbox";
import type { Bullet, Loser, MidBoss, Boss, Player, Stage } from "./stageloader";

export interface BulletPatternConfig {
    originX: number;
    originY: number;
    frequency: number;
    burstCount: number;
    burstSize: number;
    burstSizeChange: number;
    direction: number;
    directionChange: number;
    spawnDirection: number;
    spawnDirectionChange: number;
    velocity: number;
    velocityChange: number;
    durationSeconds?: number;
    blinkSeconds?: number;
    bulletType: string;
}

export class BulletPatternDef {
    constructor(public readonly name: string, public readonly config: BulletPatternConfig) { }

    createInstance(): BulletPatternInstance {
        return new BulletPatternInstance(this.config);
    }
}

export class BulletPatternInstance {
    private frameCounter = 0;
    private burstsFired = 0;
    private directionOffset = 0;
    private spawnDirectionOffset = 0;
    private velocityOffset = 0;
    private currentBurstSize: number;
    private durationFrames?: number;
    private blinkFrames?: number;

    constructor(private readonly config: BulletPatternConfig) {
        this.currentBurstSize = config.burstSize;
        if (typeof config.durationSeconds === "number" && config.durationSeconds > 0) {
            this.durationFrames = Math.max(1, Math.round(config.durationSeconds * FRAMES_PER_SECOND));
        }
        if (typeof config.blinkSeconds === "number" && config.blinkSeconds > 0) {
            this.blinkFrames = Math.max(1, Math.round(config.blinkSeconds * FRAMES_PER_SECOND));
        }
    }

    update(params: {
        owner: Loser | MidBoss | Boss;
        player: Player;
        bulletSprite: string;
        bulletAnimation: Stage["loser"]["bullet"]["animation"];
        getBulletImage: (sprite: string) => HTMLImageElement;
    }): Bullet[] {
        this.frameCounter++;
        if (this.durationFrames && this.frameCounter > this.durationFrames) {
            return [];
        }
        if (this.blinkFrames) {
            const blinkPhase = Math.floor(this.frameCounter / this.blinkFrames) % 2;
            if (blinkPhase === 1) {
                return [];
            }
        }

        const frequency = Math.max(1, Math.floor(this.config.frequency));
        if (this.config.burstCount > 0 && this.burstsFired >= this.config.burstCount) {
            return [];
        }

        if (this.frameCounter % frequency !== 0) return [];

        const originX = this.config.originX === -1 ? params.owner.x : this.config.originX;
        const originY = this.config.originY === -1 ? params.owner.y : this.config.originY;
        const baseAim = this.config.direction === -1
            ? radToDeg(Math.atan2(params.player.y - originY, params.player.x - originX))
            : this.config.direction;

        const burstSize = Math.max(1, Math.round(this.currentBurstSize));
        const direction = baseAim + this.directionOffset;
        const spawnStep = this.config.spawnDirection + this.spawnDirectionOffset;
        const velocity = this.config.velocity + this.velocityOffset;

        const bullets: Bullet[] = [];
        const sprite = this.config.bulletType && this.config.bulletType !== "-1"
            ? this.config.bulletType
            : params.bulletSprite;
        const bulletImage = params.getBulletImage(sprite);
        for (let i = 0; i < burstSize; i++) {
            const angle = degToRad(direction + i * spawnStep);
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            bullets.push(createBullet({ ...params, bulletSprite: sprite, bulletImage }, originX, originY, vx, vy));
        }

        this.burstsFired++;
        this.directionOffset += this.config.directionChange;
        this.spawnDirectionOffset += this.config.spawnDirectionChange;
        this.velocityOffset += this.config.velocityChange;
        this.currentBurstSize += this.config.burstSizeChange;

        return bullets;
    }
}

// export async function loadPatterns(): Promise<Map<string, BulletPatternDef>> {
//     const index = await fetch("/patterns/pattern.json")
//         .then((response) => response.json())
//         .catch(() => []);

//     const files: string[] = Array.isArray(index) ? index : [];
//     const map = new Map<string, BulletPatternDef>();

//     for (const file of files) {
//         const text = await fetch(`/patterns/${file}`)
//             .then((response) => response.text())
//             .catch(() => "");
//         if (!text) continue;

//         const defs = parsePatternFile(file, text);
//         for (const def of defs) {
//             map.set(def.name, def);
//         }
//     }

//     return map;
// }

// function parsePatternFile(fileName: string, text: string): BulletPatternDef[] {
//     const baseName = fileName.replace(/\.[^/.]+$/, "");
//     const lines = text.split(/\r?\n/);
//     const defs: BulletPatternDef[] = [];

//     for (let i = 0; i < lines.length; i++) {
//         const raw = lines[i].trim();
//         if (!raw || raw.startsWith("#") || raw.startsWith("//")) continue;

//         const tokens = raw.split(/\s+/);
//         if (tokens.length < 12) continue;

//         const numbers = tokens.slice(0, 12).map((value) => Number(value));
//         if (numbers.some((value) => Number.isNaN(value))) continue;

//         let idx = 12;
//         let durationSeconds: number | undefined;
//         let blinkSeconds: number | undefined;
//         if (idx < tokens.length && isNumberToken(tokens[idx])) {
//             durationSeconds = Number(tokens[idx]);
//             idx += 1;
//         }
//         if (idx < tokens.length && isNumberToken(tokens[idx])) {
//             blinkSeconds = Number(tokens[idx]);
//             idx += 1;
//         }
//         const bulletType = tokens[idx] ?? "";
//         const name = lines.length > 1 ? `${baseName}_${defs.length + 1}` : baseName;

//         defs.push(new BulletPatternDef(name, {
//             originX: numbers[0],
//             originY: numbers[1],
//             frequency: numbers[2],
//             burstCount: numbers[3],
//             burstSize: numbers[4],
//             burstSizeChange: numbers[5],
//             direction: numbers[6],
//             directionChange: numbers[7],
//             spawnDirection: numbers[8],
//             spawnDirectionChange: numbers[9],
//             velocity: numbers[10],
//             velocityChange: numbers[11],
//             durationSeconds,
//             blinkSeconds,
//             bulletType,
//         }));
//     }
//     return defs;
// }

function createBullet(
    params: {
        owner: Loser | MidBoss | Boss;
        bulletSprite: string;
        bulletAnimation: Stage["loser"]["bullet"]["animation"];
        bulletImage: HTMLImageElement;
    },
    x: number,
    y: number,
    vx: number,
    vy: number
): Bullet {
    const animation = params.bulletAnimation;
    const sprite = params.bulletSprite;
    const animator = new Animator(
        params.bulletImage,
        animation.x,
        animation.y,
        animation.width,
        animation.height,
        animation.frames,
        animation.speed
    );
    return {
        x,
        y,
        width: animation.width * animation.scale,
        height: animation.height * animation.scale,
        speed: Math.hypot(vx, vy),
        vx,
        vy,
        owner: params.owner,
        animator,
        skin: sprite,
        scale: animation.scale,
        hitbox: new HitBox(x, y, 5), // TODO change to a value based on JSON config later
    };
}

function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}

// function isNumberToken(value: string): boolean {
//     return value !== "" && !Number.isNaN(Number(value));
// }

const FRAMES_PER_SECOND = 60;