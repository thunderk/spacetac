const Pool = require('process-pool').default;

const pool = new Pool({ processLimit: 8 });
const work = pool.prepare(function () {
    const App = require("./app").TK.SpaceTac;

    async function doOneBattle(i) {
        let ai1 = new App.TacticalAI();
        let ai2 = new App.TacticalAI();

        // Prepare battle
        let battle = App.Battle.newQuickRandom(true, 1, 2 + i % 4);
        battle.fleets.forEach((fleet, findex) => {
            fleet.ships.forEach((ship, sindex) => {
                ship.name = `F${findex + 1}S${sindex + 1} (${ship.model.name})`;
            });
        });

        // Run battle
        while (!battle.ended && battle.cycle < 100) {
            let playing = battle.playing_ship;
            if (playing) {
                let ai = (playing.fleet == battle.fleets[0]) ? ai1 : ai2;
                ai.ship = playing;
                await ai.play();
            }
        }

        // Collect results
        if (battle.outcome && battle.outcome.winner) {
            let results = {};
            battle.fleets.forEach(fleet => {
                fleet.ships.forEach(ship => {
                    let name = `Level ${ship.level.get()} ${ship.model.name}`;
                    results[name] = (results[name] || 0) + (ship.fleet === battle.outcome.winner ? 1 : 0);
                });
            });
            return results;
        } else {
            return {};
        }
    }

    return (i) => doOneBattle(i);
});

let played = {};
let winned = {};
let works = Array.from({ length: 1000 }, (v, i) => i).map(i => {
    return work(i).then(result => {
        Object.keys(result).forEach(model => {
            if (result[model]) {
                winned[model] = (winned[model] || 0) + 1;
            }
            played[model] = (played[model] || 0) + 1;
        });

        console.warn("------------------------------------------------");
        console.warn(`--- Results after battle ${i}`);
        Object.keys(played).sort().forEach(model => {
            let factor = (winned[model] || 0) / played[model];
            console.warn(`${model} ${Math.round(factor * 100)}%`);
        });
        console.warn("------------------------------------------------");
    });
});

Promise.all(works).then(() => process.exit(0));
