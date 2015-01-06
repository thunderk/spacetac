module SpaceTac.View {
    // Interactive view of a Battle
    export class BattleView extends Phaser.State {

        // Displayed battle
        battle: Game.Battle;

        // Interacting player
        player: Game.Player;

        // UI container
        ui: UIGroup;

        // Battleground container
        arena: Arena;

        // Targetting mode (null if we're not in this mode)
        targetting: Targetting;

        // Card to display current playing ship
        card_playing: ShipCard;

        // Card to display hovered ship
        card_hovered: ShipCard;

        // Action bar
        action_bar: ActionBar;

        // Currently hovered ship
        ship_hovered: Game.Ship;

        // Subscription to the battle log
        log_processor: LogProcessor;

        // Init the view, binding it to a specific battle
        init(player, battle) {
            this.player = player;
            this.battle = battle;
            this.targetting = null;
            this.ship_hovered = null;
            this.log_processor = null;
        }

        // Create view graphics
        create() {
            var battleview = this;
            var game = this.game;
            var player = this.player;

            game.stage.backgroundColor = 0x000000;

            // Add arena (local map)
            this.arena = new Arena(battleview);
            game.add.existing(this.arena);

            // Add UI layer
            this.ui = new UIGroup(game);
            game.add.existing(this.ui);

            // Add UI elements
            this.action_bar = new ActionBar(this);
            this.card_playing = new ShipCard(this, 500, 0);
            this.card_hovered = new ShipCard(this, 500, 300);

            // Add ship buttons to UI
            this.battle.play_order.forEach(function (ship: Game.Ship, rank: number) {
                new ShipListItem(battleview, 0, rank * 50, ship, ship.getPlayer() === player);
            });

            // Start processing the battle log
            this.log_processor = new LogProcessor(this);
        }

        // Leaving the view, we unbind the battle
        shutdown() {
            this.exitTargettingMode();

            if (this.log_processor) {
                this.log_processor.destroy();
                this.log_processor = null;
            }

            if (this.ui) {
                this.ui.destroy();
                this.ui = null;
            }

            if (this.arena) {
                this.arena.destroy();
                this.arena = null;
            }

            if (this.card_playing) {
                this.card_playing.destroy();
                this.card_playing = null;
            }

            if (this.card_hovered) {
                this.card_hovered.destroy();
                this.card_hovered = null;
            }

            this.battle = null;
        }

        // Method called when cursor starts hovering over a ship (or its icon)
        cursorOnShip(ship: Game.Ship): void {
            this.setShipHovered(ship);
        }

        // Method called when cursor stops hovering over a ship (or its icon)
        cursorOffShip(ship: Game.Ship): void {
            if (this.ship_hovered === ship) {
                this.setShipHovered(null);
            }
        }

        // Method called when cursor moves in space
        cursorInSpace(x: number, y: number): void {
            if (!this.ship_hovered) {
                console.log("In space", x, y);
                if (this.targetting) {
                    this.targetting.setTargetSpace(x, y);
                }
            }
        }

        // Method called when cursor has been clicked (in space or on a ship)
        cursorClicked(): void {
            if (this.targetting) {
                this.targetting.validate();
            }
        }

        // Set the currently hovered ship
        setShipHovered(ship: Game.Ship): void {
            this.ship_hovered = ship;
            this.card_hovered.setShip(ship);
            if (this.targetting && ship) {
                this.targetting.setTargetShip(ship);
            }
        }

        // Enter targetting mode
        //  While in this mode, the Targetting object will receive hover and click events, and handle them
        enterTargettingMode(): Targetting {
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
    }
}
