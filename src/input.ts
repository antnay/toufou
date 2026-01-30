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
        switch (e.key) {
            case "w":
                input.up = true; break;
            case "s":
                input.down = true; break;
            case "a":
                input.left = true; break;
            case "d":
                input.right = true; break;
            case "space":
                input.shoot = true; break;
            case "enter":
                input.bomb = true; break;
        }
    });

    window.addEventListener("keyup", (e) => {
        switch (e.key) {
            case "w":
                input.up = false; break;
            case "s":
                input.down = false; break;
            case "a":
                input.left = false; break;
            case "d":
                input.right = false; break;
            case "space":
                input.shoot = false; break;
            case "enter":
                input.bomb = false; break;
        }
    });

    return input;

}