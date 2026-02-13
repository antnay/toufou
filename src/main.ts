import { initState } from "./state";
import { run } from "./gameloop";
import { createInput } from './input';
import { initOverlay } from "./overlay";
import { initUI } from "./ui";

async function main() {
    const state = await initState();
    initUI();
    initOverlay();
    const input = createInput();
    run(state, input);
}

main();