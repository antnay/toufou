import { initState } from "./state";
import { run } from "./gameloop";
import { createInput } from './input';

async function main() {
    const state = await initState();
    const input = createInput();
    run(state, input);
}

main();