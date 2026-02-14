import { GameState } from "./state";
import { Director } from "./director";
import { Bullet, InputState, MidBoss, Boss, StagePhase } from './stageloader';
import { updateOverlay } from "./overlay";
import { createStarfield, updateStarfield, drawStarfield } from "./background_starfield";

const director = new Director();
const CANVAS_W = 600;
const CANVAS_H = 800;

export function run(state: GameState, input: InputState) {
    director.initGame(state);
    const starfield = createStarfield();

    function loop() {
        update(state, input);
        updateStarfield(starfield, CANVAS_W, CANVAS_H);
        draw(state, starfield);
        requestAnimationFrame(loop);
    }
    loop();
}

function update(state: GameState, input: InputState) {
    if (input.left && state.player.x > state.player.width / 2) {
        state.player.x -= state.player.speed;
        state.player.animator?.switchAnimation(state.assets.getImage(state.stage.player.animation_left.sprite),
            state.stage.player.animation_left.x,
            state.stage.player.animation_left.y,
            state.stage.player.animation_left.width,
            state.stage.player.animation_left.height,
            state.stage.player.animation_left.frames,
            state.stage.player.animation_left.speed);
    }
    if (input.right && state.player.x < CANVAS_W - state.player.width / 2) {
        state.player.x += state.player.speed;
        state.player.animator?.switchAnimation(state.assets.getImage(state.stage.player.animation_right.sprite),
            state.stage.player.animation_right.x,
            state.stage.player.animation_right.y,
            state.stage.player.animation_right.width,
            state.stage.player.animation_right.height,
            state.stage.player.animation_right.frames,
            state.stage.player.animation_right.speed);
    }
    if (input.up && state.player.y > state.player.height / 2) {
        state.player.y -= state.player.speed;
        state.player.animator?.switchAnimation(state.assets.getImage(state.stage.player.animation_up.sprite),
            state.stage.player.animation_up.x,
            state.stage.player.animation_up.y,
            state.stage.player.animation_up.width,
            state.stage.player.animation_up.height,
            state.stage.player.animation_up.frames,
            state.stage.player.animation_up.speed);
    }
    if (input.down && state.player.y < CANVAS_H - state.player.height / 2) {
        state.player.y += state.player.speed;
        state.player.animator?.switchAnimation(state.assets.getImage(state.stage.player.animation_down.sprite),
            state.stage.player.animation_down.x,
            state.stage.player.animation_down.y,
            state.stage.player.animation_down.width,
            state.stage.player.animation_down.height,
            state.stage.player.animation_down.frames,
            state.stage.player.animation_down.speed);
    }
    director.update(state);
    updateBullets(state);
    updateHitboxes(state);
    checkCollisions(state);
    updateHitboxes(state);
    updateBullets(state);
}

function draw(state: GameState, starfield: ReturnType<typeof createStarfield>) {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    if (!canvas) {
        console.error("Canvas not found!");
        return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawStarfield(ctx, starfield, canvas.width, canvas.height);

    const background = state.assets.getImage(state.stage.background);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    if (state.player.animator) {
        state.player.animator.drawFrameHorizontal(
            0.016,
            ctx,
            state.player.x - state.player.width / 2,
            state.player.y - state.player.height / 2,
            state.stage.player.animation_idle.scale
        );
    } else {
        ctx.fillStyle = "red";
        ctx.fillRect(
            state.player.x - state.player.width / 2,
            state.player.y - state.player.height / 2,
            state.player.width,
            state.player.height
        );
    }

    // Draw Hitbox (Debug)
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.hitbox.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Enemies (Losers)


    // Draw bullets
    for (const bullet of state.player.bullets) {
        if (bullet.animator) {
            bullet.animator.drawFrameHorizontal(
                0.016,
                ctx,
                bullet.x - bullet.width / 2,
                bullet.y - bullet.height / 2,
                state.stage.player.player_bullet.animation.scale
            );
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
        }
    }

    drawEnemyBullets(state, ctx);

    switch (state.current_phase) {
        case StagePhase.BOSS:
            if (!state.boss) {
                console.log("OH MAN IM BREAKING OUT OF BOSS LOOP BECAUSE THERE IS NO BOSS EVEN THOUGH ITS BOSS PHASE WHERE IS THE BOSS AHHHHHHHHHHHHHhh");
                break;
            }
            if (state.boss.animator) {
                state.boss.animator.drawFrameHorizontal(
                    0.016,
                    ctx,
                    state.boss.x - state.boss.width / 2,
                    state.boss.y - state.boss.height / 2,
                    state.stage.boss.phases[state.boss.current_phase].animation.scale
                );
                if (state.boss.maxHp > 0) {
                    drawCircularHealthBar(ctx, state.boss);
                }
            } else {
                ctx.fillStyle = "blue";
                ctx.fillRect(state.boss.x - state.boss.width / 2, state.boss.y - state.boss.height / 2, state.boss.width, state.boss.height);
            }
            break;
        case StagePhase.MIDBOSS:
            if (!state.midboss) {
                console.log("OH MAN IM BREAKING OUT OF MIDBOSS LOOP BECAUSE THERE IS NO MIDBOSS EVEN THOUGH ITS MIDBOSS PHASE WHERE IS THE MIDBOSS AHHHHHHHHHHHHHhh");
                break;
            }
            if (state.midboss.animator) {
                state.midboss.animator.drawFrameHorizontal(
                    0.016,
                    ctx,
                    state.midboss.x - state.midboss.width / 2,
                    state.midboss.y - state.midboss.height / 2,
                    state.stage.midboss.phases[state.midboss.current_phase].animation.scale
                );
                if (state.midboss.maxHp > 0) {
                    drawCircularHealthBar(ctx, state.midboss);
                }
            } else {
                ctx.fillStyle = "blue";
                ctx.fillRect(state.midboss.x - state.midboss.width / 2, state.midboss.y - state.midboss.height / 2, state.midboss.width, state.midboss.height);
            }
            break;
        case StagePhase.LOSERS:
            for (const loser of state.losers) {
                if (loser.animator) {
                    loser.animator.drawFrameHorizontal(
                        0.016,
                        ctx,
                        loser.x - loser.width / 2,
                        loser.y - loser.height / 2,
                        state.stage.loser.animation.scale
                    );
                } else {
                    ctx.fillStyle = "blue";
                    ctx.fillRect(loser.x - loser.width / 2, loser.y - loser.height / 2, loser.width, loser.height);
                }
            }
            break;
        default:
            break;
    }

    updateOverlay(state);
}

function updateBullets(state: GameState) {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null;
    const maxX = canvas?.width ?? 600;
    const maxY = canvas?.height ?? 800;

    const updateBulletList = (bullets: any[]) => {
        return bullets.filter((bullet) => {
            const vx = bullet.vx ?? 0;
            const vy = bullet.vy ?? bullet.speed;
            bullet.x += vx;
            bullet.y += vy;
            return bullet.x >= -bullet.width && bullet.x <= maxX + bullet.width &&
                bullet.y >= -bullet.height && bullet.y <= maxY + bullet.height;
        });
    };

    switch (state.current_phase) {
        case StagePhase.LOSERS:
            for (const loser of state.losers) {
                if (!loser) break;
                loser.bullets = updateBulletList(loser.bullets);
            }
            break;
        case StagePhase.MIDBOSS:
            if (!state.midboss) break;
            for (const loser of state.losers) {
                if (!loser) break;
                loser.bullets = updateBulletList(loser.bullets);
            }
            state.midboss.bullets = updateBulletList(state.midboss.bullets);
            break;
        case StagePhase.BOSS:
            if (!state.boss) break;
            for (const loser of state.losers) {
                if (!loser) break;
                loser.bullets = updateBulletList(loser.bullets);
            }
            state.boss.bullets = updateBulletList(state.boss.bullets);
            break;
    }

    state.player.bullets = updateBulletList(state.player.bullets);
}

function drawEnemyBullets(state: GameState, ctx: CanvasRenderingContext2D) {
    for (const loser of state.losers) {
        for (const bullet of loser.bullets) {
            if (bullet.animator) {
                bullet.animator.drawFrameHorizontal(
                    0.016,
                    ctx,
                    bullet.x - bullet.width / 2,
                    bullet.y - bullet.height / 2,
                    bullet.scale ?? 1
                );
            } else {
                const radius = Math.max(2, bullet.width * 0.35);
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function checkCollisions(state: GameState) {
    for (const loser of state.losers) {
        let newBullets: Bullet[] = [];
        for (const bullet of loser.bullets) {
            if (bullet.hitbox.intersects(state.player.hitbox)) {
                playerHit(state);
                // Handle player hit (e.g., reduce lives, reset position, etc.)
            }
            else newBullets.push(bullet);

        }
        loser.bullets = newBullets;
    }
    switch (state.current_phase) {
        case StagePhase.MIDBOSS:
            if (!state.midboss) break;
            for (const bullet of state.midboss.bullets) {
                if (bullet.hitbox.intersects(state.player.hitbox)) {
                    playerHit(state);
                }
            }
            for (const bullet of state.player.bullets) {
                for (const loser of state.losers) {
                    if (bullet.hitbox.intersects(loser.hitbox)) {
                        console.log("Loser hit by player bullet!");
                        // Handle enemy hit (e.g., reduce health, destroy enemy, etc.)
                    }
                }
                if (bullet.hitbox.intersects(state.midboss.hitbox)) {
                    console.log("MidBoss hit by player bullet!");
                    // Handle midboss hit (e.g., reduce health, destroy midboss, etc.)
                }
            }
            break;
        case StagePhase.BOSS:
            if (!state.boss) break;
            for (const bullet of state.boss.bullets) {
                if (bullet.hitbox.intersects(state.player.hitbox)) {
                    playerHit(state);
                }
            }
            for (const bullet of state.player.bullets) {
                for (const loser of state.losers) {
                    if (bullet.hitbox.intersects(loser.hitbox)) {
                        console.log("Loser hit by player bullet!");
                        // Handle enemy hit (e.g., reduce health, destroy enemy, etc.)
                    }
                }
                if (bullet.hitbox.intersects(state.boss.hitbox)) {
                    console.log("Boss hit by player bullet!");
                    // Handle boss hit (e.g., reduce health, destroy boss, etc.)
                }
            }
            break;
        case StagePhase.LOSERS:
            for (const bullet of state.player.bullets) {
                for (const loser of state.losers) {
                    if (bullet.hitbox.intersects(loser.hitbox)) {
                        console.log("Loser hit by player bullet!");
                        // Handle enemy hit (e.g., reduce health, destroy enemy, etc.)
                    }
                }
            }
            break;
        default:
            break;
    }
}

function playerHit(state: GameState) {
    console.log("Player hit!");
    state.player.hitbox.startInvulnerability(); // Start invulnerability frames
    // Handle player hit (e.g., reduce lives, reset position, etc.)
    state.lives = Math.max(0, state.lives - 1);
    if (state.lives === 0) {
        // state.deaths += 1;
    }
}

function updateHitboxes(state: GameState) {
    state.player.hitbox.updateHitbox(state.player.x, state.player.y);

    for (const loser of state.losers) {
        for (const bullet of loser.bullets) {
            bullet.hitbox.updateHitbox(bullet.x, bullet.y);
        }
    }
}

// Precomputed constants — avoids Math.PI lookups + multiplies every frame
const TAU = 6.2831853;        // 2 * Math.PI
const NEG_HALF_PI = -1.5707963; // -Math.PI / 2  (12 o'clock)

function drawCircularHealthBar(ctx: CanvasRenderingContext2D, entity: MidBoss | Boss) {
    // clamp ratio 0..1
    const ratio = entity.hp / entity.maxHp;
    const healthRatio = ratio > 1 ? 1 : (ratio < 0 ? 0 : ratio);

    const radius = (entity.width > entity.height ? entity.width : entity.height) / 2 + 10;
    const lineWidth = 4;
    const endAngle = NEG_HALF_PI + TAU * healthRatio;

    ctx.save();
    ctx.lineWidth = lineWidth;

    // Background ring (depleted portion)
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, radius, 0, TAU, false);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.stroke();

    // Health arc — starts at 12 o'clock, extends clockwise
    if (healthRatio > 0) {
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, radius, NEG_HALF_PI, endAngle, false);
        const hue = (healthRatio * 120) | 0;
        ctx.strokeStyle = `hsl(${hue}, 100%, 45%)`;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    ctx.restore();
}