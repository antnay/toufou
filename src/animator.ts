export class Animator {
    sprite: HTMLImageElement;
    xStart: number;
    yStart: number;
    width: number;
    height: number;
    frameCount: number;
    frameDuration: number;
    elapsedTime: number = 0;
    totalTime: number;

    constructor(sprite: HTMLImageElement, xStart: number, yStart: number, width: number, height: number, frameCount: number, frameDuration: number) {
        this.sprite = sprite;
        this.xStart = xStart;
        this.yStart = yStart;
        this.width = width;
        this.height = height;
        this.frameCount = frameCount;
        this.frameDuration = frameDuration;

        this.elapsedTime = 0;
        this.totalTime = this.frameCount * this.frameDuration;
    };

    drawFrameHorizontal(tick: number, ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
        this.elapsedTime += tick;
        if (this.elapsedTime >= this.totalTime) {
            this.elapsedTime -= this.totalTime;
        }
        const frame = this.currentFrame();
        ctx.drawImage(this.sprite, this.xStart + frame * this.width, this.yStart, this.width, this.height, x, y, this.width * scale, this.height * scale);
    };


    drawFrameVertical(tick: number, ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
        this.elapsedTime += tick;
        if (this.elapsedTime >= this.totalTime) {
            this.elapsedTime -= this.totalTime;
        }
        const frame = this.currentFrame();
        ctx.drawImage(this.sprite, this.xStart, this.yStart + frame * this.height, this.width, this.height, x, y, this.width * scale, this.height * scale);
    };

    switchAnimation(sprite: HTMLImageElement, xStart: number, yStart: number, width: number, height: number, frameCount: number, frameDuration: number) {
        this.sprite = sprite;
        this.xStart = xStart;
        this.yStart = yStart;
        this.width = width;
        this.height = height;
        this.frameCount = frameCount;
        this.frameDuration = frameDuration;
        this.elapsedTime = 0;
        this.totalTime = this.frameCount * this.frameDuration;
    }

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    };

    isDone() {
        return (this.currentFrame() >= this.frameCount);
    };
};
