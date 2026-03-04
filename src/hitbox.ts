class HitBox {
    x: number;
    y: number;
    radius: number;
    invulnerabilityTimer: number; // seconds remaining
    invulnerabilityState: boolean = false;
    bulletHit: boolean = false;

    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.invulnerabilityTimer = 0;
    }

    intersects(other: HitBox): boolean {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + other.radius) && !other.invulnerabilityState;
    }

    startInvulnerability(seconds = 2.0) {
        if (!this.invulnerabilityState) {
            this.invulnerabilityTimer = seconds;
            this.invulnerabilityState = true;
        }
    }

    updateHitbox(x: number, y: number, dt: number) {
        this.x = x;
        this.y = y;
        if (this.invulnerabilityTimer > 0) {
            this.invulnerabilityTimer -= dt;
        } else {
            this.invulnerabilityState = false;
        }
    }

}

export { HitBox };