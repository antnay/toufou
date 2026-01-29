import { GameState } from "./state";
import { InputState } from "./state";

export function run(state: GameState, input: InputState) {
    function loop() {
        update(state, input);
        draw(state);
        requestAnimationFrame(loop);
    }
    loop();
}

function update(state: GameState, input: InputState) {

}

function draw(state: GameState) {

}
