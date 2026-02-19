class HitBox {
    x: number;
    y: number;
    radius: number;
    invulnerabilityFrames: number;
    invulnerabilityState: boolean = false;
    bulletHit: boolean = false;


    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.invulnerabilityFrames = 0;
    }

    intersects(other: HitBox): boolean {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared);

        return distance < (this.radius + other.radius) && !other.invulnerabilityState;
    }

    startInvulnerability() {
        if (this.invulnerabilityState === false) {
            this.invulnerabilityFrames = 60; // Example: 60 frames of invulnerability (1 second at 60 FPS)
            this.invulnerabilityState = true;
        }
    }

    updateHitbox(x: number, y: number) {
        this.x = x;
        this.y = y;
        if (this.invulnerabilityFrames > 0) {
            this.invulnerabilityFrames--;
        } else {
            this.invulnerabilityState = false;
        }

    }

}

export { HitBox };