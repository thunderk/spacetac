module TS.SpaceTac.UI {
    // Bar with all playing ships, by play order
    export class ShipList extends Phaser.Image {
        // Link to the parent battleview
        battleview: BattleView;

        // List of ship items
        ships_container: Phaser.Group;
        ships: ShipListItem[];

        // Playing ship
        playing: ShipListItem | null;

        // Hovered ship
        hovered: ShipListItem | null;

        // Info button
        info_button: Phaser.Button;

        // Create an empty action bar
        constructor(battleview: BattleView) {
            super(battleview.game, 0, 133, "battle-shiplist-background");

            this.battleview = battleview;
            this.ships = [];
            this.playing = null;
            this.hovered = null;

            this.info_button = new Phaser.Button(this.game, 0, 0, "battle-shiplist-info-button");
            this.info_button.position.set(0, this.height - this.info_button.height);
            UITools.setHoverClick(this.info_button,
                () => this.battleview.toggle_tactical_mode.start(),
                () => this.battleview.toggle_tactical_mode.stop(),
                () => null);
            this.addChild(this.info_button);

            battleview.layer_borders.add(this);

            if (battleview.battle) {
                this.setShipsFromBattle(battleview.battle);
            }
        }

        // Clear the action icons
        clearAll(): void {
            this.ships.forEach((ship: ShipListItem) => {
                ship.destroy();
            });
            this.ships = [];
        }

        // Set the ship list from a battle
        setShipsFromBattle(battle: Battle): void {
            this.clearAll();
            battle.play_order.forEach((ship: Ship) => {
                this.addShip(ship);
            }, this);
            this.updateItemsLocation();
        }

        // Add a ship icon
        addShip(ship: Ship): ShipListItem {
            var owned = ship.getPlayer() === this.battleview.player;
            var result = new ShipListItem(this, -200, 0, ship, owned);
            this.ships.push(result);
            this.addChild(result);
            return result;
        }

        // Find an item for a ship
        //  Returns null if not found
        findItem(ship: Ship): ShipListItem | null {
            var found: ShipListItem | null = null;
            this.ships.forEach((item: ShipListItem) => {
                if (item.ship === ship) {
                    found = item;
                }
            });
            return found;
        }

        // Find the play position in play_order for a given ship (0 is currently playing)
        findPlayPosition(ship: Ship): number {
            var battle = this.battleview.battle;
            var idx = battle.play_order.indexOf(ship);
            var diff = idx - (battle.playing_ship_index || 0);
            if (diff < 0) {
                diff += battle.play_order.length;
            }
            return diff;
        }

        // Update the locations of all items
        updateItemsLocation(animate: boolean = true): void {
            this.ships.forEach((item: ShipListItem) => {
                var position = this.findPlayPosition(item.ship);
                if (position === 0) {
                    item.moveTo(18, 15 - this.y, animate);
                } else {
                    item.moveTo(0, 33 + position * 99 - this.y, animate);
                }
                this.setChildIndex(item, position);
            });
        }

        // Remove a ship from the list
        markAsDead(ship: Ship): void {
            var item = this.findItem(ship);
            if (item) {
                item.alpha = 0.5;
            }
        }

        // Set the currently playing ship
        setPlaying(ship: Ship | null): void {
            if (ship) {
                this.playing = this.findItem(ship);
            } else {
                this.playing = null;
            }
            this.updateItemsLocation();
        }

        // Set the currently hovered ship
        setHovered(ship: Ship | null): void {
            if (this.hovered) {
                this.hovered.setHovered(false);
                this.hovered = null;
            }
            if (ship) {
                this.hovered = this.findItem(ship);
                if (this.hovered) {
                    this.hovered.setHovered(true);
                }
            }
        }
    }
}
