import { initState } from "./state";
import { run } from "./gameloop";
import { createInput } from './input';
import { initOverlay } from "./overlay";
import { initUI, GG, WIN } from "./ui";

function main() {
    initOverlay();
    const panel = document.getElementById("stat-panel");
    if (panel) (panel as HTMLElement).style.display = "none";

    initUI({
        start: async () => {
            if (panel) (panel as HTMLElement).style.display = "";
            const state = await initState();
            const input = createInput();
            run(state, input, GG, WIN);
        },
        backToMenu: () => {
            if (panel) (panel as HTMLElement).style.display = "none";
        },
    });
}

main();