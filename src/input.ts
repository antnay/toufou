import { InputState } from './stageloader';

export function createInput(): InputState {
    const input: InputState = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
        bomb: false,
    };

    window.addEventListener("keydown", (e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        switch (key) {
            case "w":
            case "ArrowUp":
                e.preventDefault();
                input.up = true; break;
            case "s":
            case "ArrowDown":
                e.preventDefault();
                input.down = true; break;
            case "a":
            case "ArrowLeft":
                e.preventDefault();
                input.left = true; break;
            case "d":
            case "ArrowRight":
                e.preventDefault();
                input.right = true; break;
            case " ":
                e.preventDefault();
                input.shoot = true; break;
            case "Enter":
                e.preventDefault();
                input.bomb = true; break;
        }
    });
    
    window.addEventListener("keyup", (e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        switch (key) {
            case "w":
            case "ArrowUp":
                input.up = false; break;
            case "s":
            case "ArrowDown":
                input.down = false; break;
            case "a":
            case "ArrowLeft":
                input.left = false; break;
            case "d":
            case "ArrowRight":
                input.right = false; break;
            case " ":
                input.shoot = false; break;
            case "Enter":
                input.bomb = false; break;
        }
    });

    return input;

}