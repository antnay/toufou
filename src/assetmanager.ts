import { BulletPatternDef } from './patterns';
import { Stage } from "./stageloader";

export class AssetManager {
    images: Map<string, HTMLImageElement> = new Map();
    patterns: Map<string, BulletPatternDef> = new Map();

    async loadStageAssets(stage: Stage) {
        await this.loadImage(stage.player.animation_up.sprite);
        await this.loadImage(stage.player.animation_down.sprite);
        await this.loadImage(stage.player.animation_left.sprite);
        await this.loadImage(stage.player.animation_right.sprite);
        await this.loadImage(stage.player.animation_idle.sprite);
        await this.loadImage(stage.player.player_bullet.animation.sprite);

        await this.loadImage(stage.loser.animation.sprite);
        await this.loadImage(stage.loser.bullet.animation.sprite);

        for (const phase of stage.midboss.phases) {
            await this.loadImage(phase.animation.sprite);
            await this.loadImage(phase.bullet.animation.sprite);
        }
        for (const phase of stage.boss.phases) {
            await this.loadImage(phase.animation.sprite);
            await this.loadImage(phase.bullet.animation.sprite);
        }


        for (const pattern of stage.pattern_index) {
            await this.loadPatterns(pattern);
        }
    }

    async loadImage(src: string) {
        if (!this.images.has(src)) {
            try {
                const img = await loadImage(src);
                this.images.set(src, img);
            } catch (e) {
                console.error(`Failed to load asset: ${src}`, e);
            }
        }
    }

    getImage(src: string): HTMLImageElement {
        const img = this.images.get(src);
        if (!img) {
            console.warn(`Asset not found: ${src}`);
            return new Image(); // Return empty image to prevent crash
        }
        return img;
    }

    async loadPatterns(src: string) {
        const path = `patterns/${src}`;
        try {
            const text = await loadText(path);
            if (!text) return;
            const defs = parsePatternFile(src, text);
            for (const def of defs) {
                this.patterns.set(def.name, def);
            }
        } catch (e) {
            console.error(`Failed to load patterns from: ${path}`, e);
        }
    }

    getPattern(src: string): BulletPatternDef | undefined {
        const text = this.patterns.get(src);
        if (!text) {
            console.warn(`Pattern not found: ${src}`);
            return undefined;
        }
        return text;
    }
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = `${import.meta.env.BASE_URL}assets/${src}`;
    });
};

export const loadText = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Failed to load ${url}: ${xhr.status} ${xhr.statusText}`));
            }
        };
        xhr.onerror = reject;
        xhr.open("GET", `${import.meta.env.BASE_URL}${url}`);
        xhr.send();
    });
};

// export async function loadPatterns(files: string[], assetManager: AssetManager) {
//     for (const file of files) {
//         const text = assetManager.getPattern(file);
//         if (!text) continue;

//         const defs = parsePatternFile(file, text);
//         for (const def of defs) {
//             assetManager.patterns.set(def.name, def);
//         }
//     }
// }

function parsePatternFile(fileName: string, text: string): BulletPatternDef[] {
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const lines = text.split(/\r?\n/);
    const defs: BulletPatternDef[] = [];

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i].trim();
        if (!raw || raw.startsWith("#") || raw.startsWith("//")) continue;

        const tokens = raw.split(/\s+/);
        if (tokens.length < 12) continue;

        const numbers = tokens.slice(0, 12).map((value) => Number(value));
        if (numbers.some((value) => Number.isNaN(value))) continue;

        let idx = 12;
        let durationSeconds: number | undefined;
        let blinkSeconds: number | undefined;
        if (idx < tokens.length && isNumberToken(tokens[idx])) {
            durationSeconds = Number(tokens[idx]);
            idx += 1;
        }
        if (idx < tokens.length && isNumberToken(tokens[idx])) {
            blinkSeconds = Number(tokens[idx]);
            idx += 1;
        }
        const bulletType = tokens[idx] ?? "";
        const name = lines.length > 1 ? `${baseName}_${defs.length + 1}` : baseName;

        defs.push(new BulletPatternDef(name, {
            originX: numbers[0],
            originY: numbers[1],
            frequency: numbers[2],
            burstCount: numbers[3],
            burstSize: numbers[4],
            burstSizeChange: numbers[5],
            direction: numbers[6],
            directionChange: numbers[7],
            spawnDirection: numbers[8],
            spawnDirectionChange: numbers[9],
            velocity: numbers[10],
            velocityChange: numbers[11],
            durationSeconds,
            blinkSeconds,
            bulletType,
        }));
    }
    return defs;
}

function isNumberToken(value: string): boolean {
    return value !== "" && !Number.isNaN(Number(value));
}