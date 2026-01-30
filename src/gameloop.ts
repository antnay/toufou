import { GameState } from "./state";
import { Director } from "./director";
import { InputState } from './stageloader';
import { updateOverlay } from "./overlay";

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
    }
    if (input.right) {
        state.player.x += state.player.speed;
    }
    if (input.up) {
        state.player.y -= state.player.speed;
    }
    if (input.down) {
        state.player.y += state.player.speed;
    }
    director.update(state);
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
            state.stage.player.animation.scale
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

    // TODO: Draw bullets

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
}
