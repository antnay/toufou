// take user input and display the game and overlay

import { InputState } from "./state";

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
  
// Initializes the UI system and hides default HTML elements
export function initUI(): void {
    const title = document.getElementById('title');
    const btn = document.getElementById('btn');
    
    if (title) {
        title.style.display = 'none';
    }
    if (btn) {
        btn.style.display = 'none';
    }
}

// Initialize UI when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
}