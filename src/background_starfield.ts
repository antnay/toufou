import { TARGET_FPS } from "./director";

export interface Star {
    x: number;
    y: number;
    speed: number;
    size: number;
    alpha: number;
}

const STAR_COUNT = 120;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;

function randomIn(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export function createStarfield(): Star[] {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            speed: randomIn(0.8, 3.5),
            size: randomIn(0.5, 2),
            alpha: randomIn(0.25, 0.95),
        });
    }
    return stars;
}


export function updateStarfield(stars: Star[], width: number, height: number, dt: number): void {
    const scale = dt * TARGET_FPS;
    for (const star of stars) {
        star.y += star.speed * scale;
        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }
    }
}

export function drawStarfield(
    ctx: CanvasRenderingContext2D,
    stars: Star[],
    width: number,
    height: number
): void {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    for (const star of stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}