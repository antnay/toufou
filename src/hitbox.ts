class HitBox {
    x: number;
    y: number;
    radius: number;

    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    intersects(other: HitBox): boolean {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared);

        return distance < (this.radius + other.radius);
    }
}

export { HitBox };