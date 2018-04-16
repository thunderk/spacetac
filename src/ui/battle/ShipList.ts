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
        container: Phaser.Image

        // List of ship items
        items: ShipListItem[]

        // Hovered ship
        hovered: ShipListItem | null

        // Info button
        info_button: Phaser.Button

        constructor(view: BaseView, battle: Battle, player: Player, tactical_mode: Toggle, ship_buttons: IShipButton, parent?: UIContainer, x = 0, y = 0) {
            let builder = new UIBuilder(view, parent);
            this.container = builder.image("battle-shiplist-background", x, y);

            this.view = view;
            // TODO Should use an UI game state, not the actual game state
            this.battle = battle;
            this.player = player;
            this.ship_buttons = ship_buttons;

            this.items = [];
            this.hovered = null;

            let info = view.getImageInfo("battle-shiplist-info-button");
            this.info_button = new Phaser.Button(view.game, 0, 0, info.key, undefined, undefined, info.frame, info.frame);
            this.view.inputs.setHoverClick(this.info_button,
                () => tactical_mode.manipulate("shiplist")(true),
                () => tactical_mode.manipulate("shiplist")(false),
                () => null);
            this.container.addChild(this.info_button);

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
            this.refresh(animate);
        }

        /**
         * Bind to a log processor, to watch for events
         */
        bindToLog(log: LogProcessor): void {
            log.watchForShipChange(ship => {
                return {
                    foreground: async (animate) => {
                        this.refresh(animate)
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
            this.container.addChild(result);
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
        refresh(animate = true): void {
            this.items.forEach(item => {
                if (item.ship.alive) {
                    let position = this.battle.getPlayOrder(item.ship);
                    if (position < 0) {
                        item.visible = false;
                    } else {
                        if (position == 0) {
                            item.moveTo(-14, 962, animate ? 1000 : 0);
                        } else {
                            item.moveTo(2, 942 - position * 99, animate ? 1000 : 0);
                        }
                        item.visible = true;
                        this.container.setChildIndex(item, position);
                    }
                } else {
                    item.moveTo(200, item.y, animate ? 1000 : 0);
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
