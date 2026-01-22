interface Stage {
    background: string;
    player: string;
    player_bullet: string;
    boss: string;
    bomb_count: number;
    bomb_freq: number;
    boss_pattern: {
        phase_one: {
            easy: string;
            medium: string;
            hard: string;
        };
        phase_two: {
            easy: string;
            medium: string;
            hard: string;
        };
    };
    spellcards: {
        easy: string[];
        medium: string[];
        hard: string[];
    };
    // add more stuff as needed
}

async function loadStage(path: string): Promise<Stage> {
    return await fetch(path).then((response) => response.json()).catch((error) => {
        console.error(error);
        throw error;
    });
}

