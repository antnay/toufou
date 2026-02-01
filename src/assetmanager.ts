import { Stage } from "./stageloader";

export class AssetManager {
    images: Map<string, HTMLImageElement> = new Map();

    async loadStageAssets(stage: Stage) {
        await this.load(stage.player.animation_up.sprite);
        await this.load(stage.player.animation_down.sprite);
        await this.load(stage.player.animation_left.sprite);
        await this.load(stage.player.animation_right.sprite);
        await this.load(stage.player.animation_idle.sprite);
        await this.load(stage.player.player_bullet.animation.sprite);

        await this.load(stage.loser.animation.sprite);
        await this.load(stage.loser.bullet.animation.sprite);

        for (const phase of stage.midboss.phases) {
            await this.load(phase.animation.sprite);
            await this.load(phase.bullet.animation.sprite);
        }
        for (const phase of stage.boss.phases) {
            await this.load(phase.animation.sprite);
            await this.load(phase.bullet.animation.sprite);
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