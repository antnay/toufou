import { Stage } from "./stageloader";

export class AssetManager {
    images: Map<string, HTMLImageElement> = new Map();

    async loadStageAssets(stage: Stage) {
        await this.load(stage.player.sprite);
        await this.load(stage.player.player_bullet.sprite);

        await this.load(stage.loser.sprite);
        await this.load(stage.loser.bullet.sprite);

        for (const phase of stage.midboss.phases) {
            await this.load(phase.sprite);
            await this.load(phase.bullet.sprite);
        }
        for (const phase of stage.boss.phases) {
            await this.load(phase.sprite);
            await this.load(phase.bullet.sprite);
        }
    }

    async load(src: string) {
        if (!this.images.has(src)) {
            try {
                const img = await loadImage(src);
                this.images.set(src, img);
            } catch (e) {
                console.error(`Failed to load asset: ${src}`, e);
            }
        }
    }

    get(src: string): HTMLImageElement {
        const img = this.images.get(src);
        if (!img) {
            console.warn(`Asset not found: ${src}`);
            return new Image(); // Return empty image to prevent crash
        }
        return img;
    }
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = "/assets/" + src;
    });
};