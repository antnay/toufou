import { initState } from "./state";
import { run } from "./gameloop";
import { createInput } from './input';
import { initOverlay } from "./overlay";
import { initUI, GG, WIN } from "./ui";
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

function main() {
    initOverlay();
    const panel = document.getElementById("stat-panel");
    if (panel) (panel as HTMLElement).style.display = "none";

    const stageModules = import.meta.glob('../public/stages/*.json');
    const stages = Object.keys(stageModules).map(path => {
        const parts = path.split('/');
        return parts[parts.length - 1];
    }).sort((a, b) => {
        if (a === "infinite.json") return 1;
        if (b === "infinite.json") return -1;
        return a.localeCompare(b);
    });

    initUI({
        stages: stages,
        start: async (stageName: string) => {
            if (panel) (panel as HTMLElement).style.display = "";
            const stagePath = `stages/${stageName}`;
            const state = await initState(stagePath);
            const input = createInput();
            run(state, input, GG, WIN);
        },
        backToMenu: () => {
            if (panel) (panel as HTMLElement).style.display = "none";
        },
    });
}

main();