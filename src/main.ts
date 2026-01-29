import { initState } from "./state";
import { createInput } from "./ui";
import { run } from "./gameloop";

async function main() {
    const state = await initState();
    const input = createInput();
    run(state, input);
}

main();