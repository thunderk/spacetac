/// <reference path="../BaseView.ts"/>

module TS.SpaceTac.UI {
    // Interactive view of a Battle
    export class BattleView extends BaseView {
        // Displayed battle
        battle: Battle

        // Interacting player
        player: Player

        // Multiplayer sharing
        multi: MultiBattle

        // Layers
        layer_background: Phaser.Group
        layer_arena: Phaser.Group
        layer_borders: Phaser.Group
        layer_overlay: Phaser.Group
        layer_dialogs: Phaser.Group
        layer_sheets: Phaser.Group

        // Battleground container
        arena: Arena

        // Background image
        background: Phaser.Image | null

        // Targetting mode (null if we're not in this mode)
        targetting: Targetting

        // Ship list
        ship_list: ShipList

        // Action bar
        action_bar: ActionBar

        // Currently hovered ship
        ship_hovered: Ship | null

        // Ship tooltip
        ship_tooltip: ShipTooltip

        // Character sheet
        character_sheet: CharacterSheet

        // Subscription to the battle log
        log_processor: LogProcessor

        // True if player interaction is allowed
        interacting: boolean

        // Tactical mode toggle
        toggle_tactical_mode: Toggle

        // Toggle for the splash screen display
        splash = true

        // Init the view, binding it to a specific battle
        init(player: Player, battle: Battle) {
            super.init();

            this.player = player;
            this.battle = battle;
            this.ship_hovered = null;
            this.background = null;
            this.multi = new MultiBattle();

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
            this.layer_background = this.addLayer("background");
            this.layer_arena = this.addLayer("arena");
            this.layer_borders = this.addLayer("borders");
            this.layer_overlay = this.addLayer("overlay");
            this.layer_dialogs = this.addLayer("dialogs");
            this.layer_sheets = this.addLayer("character_sheet");

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
            this.character_sheet = new CharacterSheet(this, -this.getWidth());
            this.layer_sheets.add(this.character_sheet);

            // Targetting info
            this.targetting = new Targetting(this, this.action_bar, this.toggle_tactical_mode);
            this.targetting.moveToLayer(this.arena.layer_targetting);

            // BGM
            this.gameui.audio.startMusic("mechanolith", 0.2);

            // Key mapping
            this.inputs.bind("t", "Show tactical view", () => this.toggle_tactical_mode.manipulate("keyboard")(3000));
            this.inputs.bindCheat("w", "Win current battle", () => this.battle.cheats.win());
            this.inputs.bindCheat("x", "Lose current battle", () => this.battle.cheats.lose());
            this.inputs.bindCheat("a", "Use AI to play", () => this.playAI());

            // "Battle" animation, then start processing the log
            if (this.splash) {
                this.showSplash().then(() => {
                    this.log_processor.start();
                });
            } else {
                this.log_processor.start();
            }

            // If we are on a remote session, start the exchange
            if (!this.session.primary && this.gameui.session_token) {
                // TODO handle errors or timeout
                this.multi.setup(this, this.battle, this.gameui.session_token, false);
            }
        }

        /**
         * Make the AI play current ship
         * 
         * If the AI is already playing, do nothing
         */
        playAI(): void {
            if (this.battle.playAI()) {
                if (this.interacting) {
                    this.action_bar.setShip(new Ship());
                }
                this.setInteractionEnabled(false);
            }
        }

        /**
         * Display the splash screen at the start of battle
         */
        showSplash(): Promise<void> {
            let splash = new BattleSplash(this, this.battle.fleets[0], this.battle.fleets[1]);
            splash.moveToLayer(this.layer_overlay);
            return splash.start();
        }

        // Method called when cursor starts hovering over a ship (or its icon)
        cursorOnShip(ship: Ship): void {
            if (!this.targetting.active || ship.alive) {
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
                if (this.targetting.active) {
                    this.targetting.setTarget(Target.newFromLocation(x, y));
                }
            }
        }

        // Method called when cursor has been clicked (in space or on a ship)
        cursorClicked(): void {
            if (this.targetting.active) {
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

            if (this.targetting.active) {
                if (ship) {
                    this.targetting.setTarget(Target.newFromShip(ship));
                } else {
                    this.targetting.setTarget(null);
                }
            }
        }

        // Enable or disable the global player interaction
        //  Disable interaction when it is the AI turn, or when the current ship can't play
        setInteractionEnabled(enabled: boolean): void {
            if (this.session.spectator) {
                enabled = false;
            }

            if (enabled != this.interacting) {
                this.action_bar.setInteractive(enabled);
                this.exitTargettingMode();
                this.interacting = enabled;
            }
        }

        // Enter targetting mode
        //  While in this mode, the Targetting object will receive hover and click events, and handle them
        enterTargettingMode(action: BaseAction): Targetting | null {
            if (!this.interacting) {
                return null;
            }

            this.targetting.setAction(action);
            return this.targetting;
        }

        // Exit targetting mode
        exitTargettingMode(): void {
            this.targetting.setAction(null);
        }

        /**
         * End the battle and show the outcome dialog
         */
        endBattle() {
            if (this.battle.ended) {
                this.setInteractionEnabled(false);

                this.gameui.session.setBattleEnded();

                this.battle.stats.processLog(this.battle.log, this.player.fleet);

                new OutcomeDialog(this, this.player, this.battle.outcome, this.battle.stats);
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
