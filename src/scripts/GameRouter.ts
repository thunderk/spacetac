/// <reference path="definitions/phaser.d.ts"/>

module SpaceTac {
    "use strict";

    // Router between game views
    export class GameRouter extends Phaser.Game {
        // Currently playing universe
        universe: Game.Universe;

        constructor() {
            super(1280, 720, Phaser.AUTO, '-space-tac');

            this.universe = this.newGame();

            this.state.add('boot', View.Boot);
            this.state.add('preload', View.Preload);
            this.state.add('main', View.Main);
            this.state.add('battle', View.BattleView);

            this.state.start('boot');
        }

        // Start a new game
        newGame(): Game.Universe {
            // Currently create a quick battle
            var universe = new Game.Universe();
            universe.startQuickBattle();
            return universe;
        }

        // Save current game in local browser storage
        saveGame(): boolean {
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem("spacetac-savegame", this.universe.saveToString());
                console.log("Game saved");
                return true;
            } else {
                console.error("localStorage not available");
            }
        }

        // Load current game from local browser storage
        loadGame(): boolean {
            if (typeof(Storage) !== "undefined") {
                var loaded = localStorage.getItem("spacetac-savegame");
                if (loaded) {
                    this.universe = Game.Universe.loadFromString(loaded);
                    this.state.start('main');
                    console.log("Game loaded");
                    return true;
                } else {
                    console.error("No saved game found");
                    return false;
                }
            } else {
                console.error("localStorage not available");
            }
        }
    }
}
