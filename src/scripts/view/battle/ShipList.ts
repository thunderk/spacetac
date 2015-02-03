module SpaceTac.View {
    "use strict";

    // Bar with all playing ships, by play order
    export class ShipList extends Phaser.Group {
        // Link to the parent battleview
        battleview: BattleView;

        // List of ship items
        ships: ShipListItem[];

        // Playing ship
        playing: ShipListItem;

        // Create an empty action bar
        constructor(battleview: BattleView) {
            this.battleview = battleview;
            this.ships = [];
            this.playing = null;

            super(battleview.game, battleview.ui);
            battleview.ui.add(this);

            if (battleview.battle) {
                this.setShipsFromBattle(battleview.battle);
            }
            this.update();
        }

        // Update the bar status (and position)
        update() {
            super.update();

            this.y = 76;
        }

        // Clear the action icons
        clearAll(): void {
            this.ships.forEach((ship: ShipListItem) => {
                ship.destroy();
            });
            this.ships = [];
        }

        // Set the ship list from a battle
        setShipsFromBattle(battle: Game.Battle): void {
            this.clearAll();
            battle.play_order.forEach((ship: Game.Ship) => {
                this.addShip(ship);
            }, this);
        }

        // Add a ship icon
        addShip(ship: Game.Ship): ShipListItem {
            var owned = ship.getPlayer() === this.battleview.player;
            var result = new ShipListItem(this, 0, this.ships.length * 80, ship, owned);
            this.ships.push(result);
            this.add(result);
            return result;
        }

        // Find an item for a ship
        //  Returns null if not found
        findItem(ship: Game.Ship): ShipListItem {
            var found: ShipListItem = null;
            this.ships.forEach((item: ShipListItem) => {
                if (item.ship === ship) {
                    found = item;
                }
            });
            return found;
        }

        // Set the currently playing ship
        setPlaying(ship: Game.Ship): void {
            if (this.playing) {
                this.playing.setPlaying(false);
            }
            this.playing = this.findItem(ship);
            if (this.playing) {
                this.playing.setPlaying(true);
            }
        }
    }
}
