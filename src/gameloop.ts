import { GameState } from "./state";
import { Director } from "./director";
import { InputState, StagePhase } from './stageloader';
import { updateOverlay } from "./overlay";
import { HitBox } from "./hitbox";

const director = new Director();

export function run(state: GameState, input: InputState) {
    director.initGame(state);

    function loop() {
        update(state, input);
        draw(state);
        requestAnimationFrame(loop);
    }
    loop();
}

function update(state: GameState, input: InputState) {
    if (input.left) {
        state.player.x -= state.player.speed;
        state.player.animator?.switchAnimation(state.assets.getImage(state.stage.player.animation_left.sprite),
            state.stage.player.animation_left.x,
            state.stage.player.animation_left.y,
            state.stage.player.animation_left.width,
            state.stage.player.animation_left.height,
            state.stage.player.animation_left.frames,
            state.stage.player.animation_left.speed);
    }
    if (input.right) {
        state.player.x += state.player.speed;
        state.player.animator?.switchAnimation(state.assets.getImage(state.stage.player.animation_right.sprite),
            state.stage.player.animation_right.x,
            state.stage.player.animation_right.y,
            state.stage.player.animation_right.width,
            state.stage.player.animation_right.height,
            state.stage.player.animation_right.frames,
            state.stage.player.animation_right.speed);
    }
    if (input.up) {
        state.player.y -= state.player.speed;
        state.player.animator?.switchAnimation(state.assets.getImage(state.stage.player.animation_up.sprite),
            state.stage.player.animation_up.x,
            state.stage.player.animation_up.y,
            state.stage.player.animation_up.width,
            state.stage.player.animation_up.height,
            state.stage.player.animation_up.frames,
            state.stage.player.animation_up.speed);
    }
    if (input.down) {
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
    checkCollisions(state);
    updateHitboxes(state);
    updateBullets(state);
}

function draw(state: GameState) {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    if (!canvas) {
        console.error("Canvas not found!");
        return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    if (state.boss.animator) {
        state.boss.animator.drawFrameHorizontal(
            0.016,
            ctx,
            state.boss.x - state.boss.width / 2,
            state.boss.y - state.boss.height / 2,
            state.stage.boss.phases[state.boss.current_phase].animation.scale
        );
    } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(state.boss.x - state.boss.width / 2, state.boss.y - state.boss.height / 2, state.boss.width, state.boss.height);
    }

    if (state.midboss.animator) {
        state.midboss.animator.drawFrameHorizontal(
            0.016,
            ctx,
            state.midboss.x - state.midboss.width / 2,
            state.midboss.y - state.midboss.height / 2,
            state.stage.midboss.phases[state.midboss.current_phase].animation.scale
        );
    } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(state.midboss.x - state.midboss.width / 2, state.midboss.y - state.midboss.height / 2, state.midboss.width, state.midboss.height);
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
                loser.bullets = updateBulletList(loser.bullets);
            }
            break;
        case StagePhase.MID_BOSS:
            for (const loser of state.losers) {
                loser.bullets = updateBulletList(loser.bullets);
            }
            state.midboss.bullets = updateBulletList(state.midboss.bullets);
            break;
        case StagePhase.BOSS:
            for (const loser of state.losers) {
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
        for (const bullet of loser.bullets) {
            if (bullet.hitbox.intersects(state.player.hitbox)) {
                console.log("Player hit by bullet!");
                // Handle player hit (e.g., reduce lives, reset position, etc.)
            }
        }
    }
    for (const bullet of state.midboss.bullets) {
        if (bullet.hitbox.intersects(state.player.hitbox)) {
            console.log("Player hit by midboss bullet!");
            // Handle player hit (e.g., reduce lives, reset position, etc.)
        }
    }
    for (const bullet of state.boss.bullets) {
        if (bullet.hitbox.intersects(state.player.hitbox)) {
            console.log("Player hit by boss bullet!");
            // Handle player hit (e.g., reduce lives, reset position, etc.)
        }
    }
// Check player bullets against enemies
    // for (const bullet of state.player.bullets) {
    //     for (const loser of state.losers) {
    //         if (bullet.hitbox.intersects(loser.hitbox)) {
    //             console.log("Loser hit by player bullet!");
    //             // Handle enemy hit (e.g., reduce health, destroy enemy, etc.)
    //         }
    //     }
        // if (bullet.hitbox.intersects(state.midboss.hitbox)) {
        //     console.log("MidBoss hit by player bullet!");
        //     // Handle midboss hit (e.g., reduce health, destroy midboss, etc.)
        // }
        // if (bullet.hitbox.intersects(state.boss.hitbox)) {
        //     console.log("Boss hit by player bullet!");
        //     // Handle boss hit (e.g., reduce health, destroy boss, etc.)
        // }
    // }
}

function updateHitboxes(state: GameState) {
    state.player.hitbox = new HitBox(
        state.player.x,
        state.player.y,
        state.player.hitbox.radius
    );

    for (const loser of state.losers) {
        for (const bullet of loser.bullets) {
            bullet.hitbox = new HitBox(
                bullet.x,
                bullet.y,
                bullet.hitbox.radius
            );
        }
    }
}