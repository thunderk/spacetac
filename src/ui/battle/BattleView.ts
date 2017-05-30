/// <reference path="../BaseView.ts"/>

module TS.SpaceTac.UI {
    // Interactive view of a Battle
    export class BattleView extends BaseView {

        // Displayed battle
        battle: Battle;

        // Interacting player
        player: Player;

        // Layers
        layer_background: Phaser.Group;
        layer_arena: Phaser.Group;
        layer_borders: Phaser.Group;
        layer_overlay: Phaser.Group;
        layer_dialogs: Phaser.Group;
        layer_sheets: Phaser.Group;

        // Battleground container
        arena: Arena;

        // Background image
        background: Phaser.Image | null;

        // Targetting mode (null if we're not in this mode)
        targetting: Targetting | null;

        // Ship list
        ship_list: ShipList;

        // Action bar
        action_bar: ActionBar;

        // Currently hovered ship
        ship_hovered: Ship | null;

        // Ship tooltip
        ship_tooltip: ShipTooltip;

        // Outcome dialog layer
        outcome_layer: Phaser.Group;

        // Character sheet
        character_sheet: CharacterSheet;

        // Subscription to the battle log
        log_processor: LogProcessor;

        // True if player interaction is allowed
        interacting: boolean;

        // Tactical mode toggle
        toggle_tactical_mode: Toggle;

        // Init the view, binding it to a specific battle
        init(player: Player, battle: Battle) {
            super.init();

            this.player = player;
            this.battle = battle;
            this.targetting = null;
            this.ship_hovered = null;
            this.background = null;

            this.battle.timer = this.timer;

            this.toggle_tactical_mode = new Toggle(
                () => this.arena.setTacticalMode(true),
                () => this.arena.setTacticalMode(false)
            );
        }

        // Create view graphics
        create() {
            super.create();

            var game = this.game;
            this.log_processor = new LogProcessor(this);

            // Add layers
            this.layer_background = this.addLayer();
            this.layer_arena = this.addLayer();
            this.layer_borders = this.addLayer();
            this.layer_overlay = this.addLayer();
            this.layer_dialogs = this.addLayer();
            this.layer_sheets = this.addLayer();

            // Background
            this.background = new Phaser.Image(game, 0, 0, "battle-background", 0);
            this.layer_background.add(this.background);

            // Add arena (local map)
            this.arena = new Arena(this);
            this.layer_arena.add(this.arena);

            // Add UI elements
            this.action_bar = new ActionBar(this);
            this.ship_list = new ShipList(this);
            this.ship_tooltip = new ShipTooltip(this);
            this.outcome_layer = new Phaser.Group(this.game);
            this.layer_dialogs.add(this.outcome_layer);
            this.character_sheet = new CharacterSheet(this, -this.getWidth());
            this.layer_sheets.add(this.character_sheet);

            // "Battle" animation
            this.displayFightMessage();

            // BGM
            this.gameui.audio.startMusic("full-on");

            // Key mapping
            this.inputs.bind("t", "Show tactical view", () => this.toggle_tactical_mode.switch(3000));
            this.inputs.bindCheat("w", "Win current battle", () => {
                iforeach(this.battle.iships(), ship => {
                    if (ship.fleet.player != this.player) {
                        ship.setDead();
                    }
                });
                this.battle.endBattle(this.player.fleet);
            });
            this.inputs.bindCheat("x", "Lose current battle", () => {
                iforeach(this.battle.iships(), ship => {
                    if (ship.fleet.player == this.player) {
                        ship.setDead();
                    }
                });
                this.battle.endBattle(first(this.battle.fleets, fleet => fleet.player != this.player));
            });
            this.inputs.bindCheat("a", "Use AI to play", () => {
                if (this.interacting && this.battle.playing_ship) {
                    this.setInteractionEnabled(false);
                    this.action_bar.setShip(new Ship());
                    this.battle.playAI(new TacticalAI(this.battle.playing_ship));
                }
            });

            // Start processing the log
            this.log_processor.start();
        }

        // Leaving the view, we unbind the battle
        shutdown() {
            this.exitTargettingMode();

            this.log_processor.destroy();

            super.shutdown();
        }

        // Display an animated "BATTLE" text in the center of the view
        displayFightMessage(): void {
            var text = this.game.add.text(this.getMidWidth(), this.getMidHeight(), "BATTLE !",
                { align: "center", font: "bold 42px Arial", fill: "#EE2233" });
            text.anchor.set(0.5, 0.5);
            this.game.tweens.create(text.scale).to({ x: 3, y: 3 }).start();
            var text_anim = this.game.tweens.create(text).to({ alpha: 0 });
            text_anim.onComplete.addOnce(() => {
                text.destroy();
            });
            text_anim.start();
        }

        // Method called when cursor starts hovering over a ship (or its icon)
        cursorOnShip(ship: Ship): void {
            if (!this.targetting || ship.alive) {
                this.setShipHovered(ship);
            }
        }

        // Method called when cursor stops hovering over a ship (or its icon)
        cursorOffShip(ship: Ship): void {
            if (this.ship_hovered === ship) {
                this.setShipHovered(null);
            }
        }

        // Method called when cursor moves in space
        cursorInSpace(x: number, y: number): void {
            if (!this.ship_hovered) {
                if (this.targetting) {
                    this.targetting.setTargetSpace(x, y);
                }
            }
        }

        // Method called when cursor has been clicked (in space or on a ship)
        cursorClicked(): void {
            if (this.targetting) {
                this.targetting.validate();
            } else if (this.ship_hovered && this.ship_hovered.getPlayer() == this.player && this.interacting) {
                this.character_sheet.show(this.ship_hovered);
                this.setShipHovered(null);
            }
        }

        // Set the currently hovered ship
        setShipHovered(ship: Ship | null): void {
            this.ship_hovered = ship;
            this.arena.setShipHovered(ship);
            this.ship_list.setHovered(ship);

            if (ship) {
                this.ship_tooltip.setShip(ship);
            } else {
                this.ship_tooltip.hide();
            }

            if (this.targetting) {
                if (ship) {
                    this.targetting.setTargetShip(ship);
                } else {
                    this.targetting.unsetTarget();
                }
            }
        }

        // Enable or disable the global player interaction
        //  Disable interaction when it is the AI turn, or when the current ship can't play
        setInteractionEnabled(enabled: boolean): void {
            this.action_bar.setInteractive(enabled);
            this.exitTargettingMode();
            this.interacting = enabled;
        }

        // Enter targetting mode
        //  While in this mode, the Targetting object will receive hover and click events, and handle them
        enterTargettingMode(): Targetting | null {
            if (!this.interacting) {
                return null;
            }

            if (this.targetting) {
                this.exitTargettingMode();
            }

            this.targetting = new Targetting(this);
            return this.targetting;
        }

        // Exit targetting mode
        exitTargettingMode(): void {
            if (this.targetting) {
                this.targetting.destroy();
            }
            this.targetting = null;
        }

        /**
         * End the battle and show the outcome dialog
         */
        endBattle() {
            if (this.battle.ended) {
                this.setInteractionEnabled(false);

                this.gameui.session.setBattleEnded();

                this.battle.stats.processLog(this.battle.log, this.player.fleet);

                let dialog = new OutcomeDialog(this, this.player, this.battle.outcome, this.battle.stats);
                dialog.moveToLayer(this.outcome_layer);
            } else {
                console.error("Battle not ended !");
            }
        }

        /**
         * Exit the battle, and go back to map
         */
        exitBattle() {
            this.player.exitBattle();
            this.game.state.start('router');
        }

        /**
         * Revert the battle, and go back to map
         */
        revertBattle() {
            this.player.revertBattle();
            this.game.state.start('router');
        }
    }
}
