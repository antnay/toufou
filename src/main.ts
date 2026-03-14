import { initState } from "./state";
import { run, RunControls } from "./gameloop";
import { createInput } from './input';
import { initOverlay } from "./overlay";
import { initUI, GG, WIN } from "./ui";
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

function main() {
    initOverlay();
    const panel = document.getElementById("stat-panel");
    if (panel) (panel as HTMLElement).style.display = "none";

    const pauseLayer = document.getElementById("pause-layer") as HTMLElement | null;
    const btnResume = document.getElementById("btn-resume") as HTMLButtonElement | null;
    const btnPauseMainMenu = document.getElementById("btn-pause-main-menu") as HTMLButtonElement | null;

    let currentRun: RunControls | null = null;

    const setPauseVisible = (visible: boolean) => {
        if (!pauseLayer) return;
        pauseLayer.style.display = visible ? "flex" : "none";
    };

    const showMainMenu = () => {
        const uiLayer = document.getElementById('ui-layer');
        const title = document.getElementById('title');
        const subtitle = document.getElementById('subtitle');
        const stagesContainer = document.getElementById('stages-container');
        const btnLeaderboard = document.getElementById('btn-leaderboard');
        if (uiLayer) uiLayer.classList.add('menu-visible');
        if (title) (title as HTMLElement).style.display = '';
        if (subtitle) (subtitle as HTMLElement).style.display = '';
        if (stagesContainer) (stagesContainer as HTMLElement).style.display = 'flex';
        if (btnLeaderboard) (btnLeaderboard as HTMLElement).style.display = 'block';
    };

    btnResume?.addEventListener("click", () => {
        currentRun?.resume();
    });

    btnPauseMainMenu?.addEventListener("click", () => {
        currentRun?.stop();
        currentRun = null;
        setPauseVisible(false);
        if (panel) (panel as HTMLElement).style.display = "none";
        showMainMenu();
    });

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
            setPauseVisible(false);
            currentRun?.stop();
            const stagePath = `stages/${stageName}`;
            const state = await initState(stagePath);
            const input = createInput();
            currentRun = run(state, input, GG, WIN, {
                onPauseChange: (paused) => {
                    setPauseVisible(paused);
                },
            });
        },
        backToMenu: () => {
            currentRun?.stop();
            currentRun = null;
            setPauseVisible(false);
            if (panel) (panel as HTMLElement).style.display = "none";
        },
    });
}

main();