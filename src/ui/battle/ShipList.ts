module TK.SpaceTac.UI {
    /**
     * Side bar with all playing ships, sorted by play order
     */
    export class ShipList {
        // Link to the parent view
        view: BaseView

        // Current battle
        battle: Battle

        // Current player
        player: Player

        // Interface for acting as ship button
        ship_buttons: IShipButton

        // Container
        container: UIContainer

        // List of ship items
        items: ShipListItem[]

        // Hovered ship
        hovered: ShipListItem | null

        // Info button
        info_button: UIButton

        constructor(view: BaseView, battle: Battle, player: Player, tactical_mode: Toggle, ship_buttons: IShipButton, parent?: UIContainer, x = 0, y = 0) {
            let builder = new UIBuilder(view, parent);
            this.container = builder.container("shiplist", x, y);

            builder = builder.in(this.container);
            builder.image("battle-shiplist-background", 0, 0);

            this.view = view;
            this.battle = battle;
            this.player = player;
            this.ship_buttons = ship_buttons;

            this.items = [];
            this.hovered = null;

            // FIXME
            this.info_button = builder.button("battle-shiplist-info-button", 0, 0, () => null, "Tactical display", on => tactical_mode.manipulate("shiplist")(on));

            this.setShipsFromBattle(battle);
        }

        /**
         * Clear all ship cards
         */
        clearAll(): void {
            this.items.forEach(ship => ship.destroy());
            this.items = [];
        }

        /**
         * Rebuild the ship list from an ongoing battle
         */
        setShipsFromBattle(battle: Battle, animate = true): void {
            this.clearAll();
            iforeach(battle.iships(true), ship => this.addShip(ship));
            this.refresh(animate ? 1 : 0);
        }

        /**
         * Bind to a log processor, to watch for events
         */
        bindToLog(log: LogProcessor): void {
            log.watchForShipChange(ship => {
                return {
                    foreground: async (speed: number) => {
                        this.refresh(speed);
                    }
                }
            });

            log.register(diff => {
                if (diff instanceof ShipDamageDiff) {
                    return {
                        background: async () => {
                            let item = this.findItem(diff.ship_id);
                            if (item) {
                                item.setDamageHit();
                            }
                        }
                    }
                } else {
                    return {};
                }
            })
        }

        /**
         * Add a ship card
         */
        addShip(ship: Ship): ShipListItem {
            var owned = ship.isPlayedBy(this.player);
            var result = new ShipListItem(this, 200, this.container.height / 2, ship, owned, this.ship_buttons);
            this.items.push(result);
            this.container.add(result);
            return result;
        }

        /**
         * Find the item (card) that displays a given ship
         */
        findItem(ship: Ship | RObjectId | null): ShipListItem | null {
            return first(this.items, item => item.ship.is(ship));
        }

        /**
         * Update the locations of all items
         */
        refresh(speed = 1): void {
            let duration = speed ? 1000 / speed : 0;
            this.items.forEach(item => {
                if (item.ship.alive) {
                    let position = this.battle.getPlayOrder(item.ship);
                    if (position < 0) {
                        item.visible = false;
                    } else {
                        if (position == 0) {
                            item.moveAt(-14, 962, duration);
                        } else {
                            item.moveAt(2, 942 - position * 99, duration);
                        }
                        item.visible = true;
                        item.setZ(99 - position);
                    }
                } else {
                    item.setZ(100);
                    item.moveAt(200, item.y, duration);
                }
            });
        }

        /**
         * Set the currently hovered ship
         */
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
