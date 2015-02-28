module SpaceTac.View {
    "use strict";

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

        // Background image
        background: Phaser.Image;

        // Targetting mode (null if we're not in this mode)
        targetting: Targetting;

        // Card to display current playing ship
        card_playing: ShipCard;

        // Card to display hovered ship
        card_hovered: ShipCard;

        // Ship list
        ship_list: ShipList;

        // Action bar
        action_bar: ActionBar;

        // Currently hovered ship
        ship_hovered: Game.Ship;

        // Subscription to the battle log
        log_processor: LogProcessor;

        // True if player interaction is allowed
        interacting: boolean;

        // Indicator of interaction disabled
        icon_waiting: Phaser.Image;

        // Listener for space key presses
        private space_key: Phaser.Key;

        // Lines used to highlight hovered ship
        private line_hover_left: Phaser.Graphics;
        private line_hover_right: Phaser.Graphics;

        // Init the view, binding it to a specific battle
        init(player: Game.Player, battle: Game.Battle) {
            this.player = player;
            this.battle = battle;
            this.targetting = null;
            this.ship_hovered = null;
            this.log_processor = null;
            this.background = null;
            this.space_key = null;
            this.line_hover_left = null;
            this.line_hover_right = null;
        }

        // Create view graphics
        create() {
            var battleview = this;
            var game = this.game;

            // Background
            game.stage.backgroundColor = 0x000000;
            this.background = new Phaser.Image(game, 0, 0, "battle-background", 0);
            game.add.existing(this.background);

            // Add arena (local map)
            this.arena = new Arena(battleview);
            game.add.existing(this.arena);

            // Add UI layer
            this.ui = new UIGroup(game);
            game.add.existing(this.ui);

            // Add UI elements
            this.action_bar = new ActionBar(this);
            this.ship_list = new ShipList(this);
            this.card_playing = new ShipCard(this, 1066, 130);
            this.card_hovered = new ShipCard(this, 1066, 424);

            this.icon_waiting = new Phaser.Image(this.game, 640, 50, "battle-waiting", 0);
            this.icon_waiting.anchor.set(0.5, 0.5);
            this.icon_waiting.scale.set(0.5, 0.5);
            game.add.existing(this.icon_waiting);
            game.tweens.create(this.icon_waiting).to({"angle": 360}, 3000).repeat(-1).start();

            this.line_hover_left = new Phaser.Graphics(this.game, 0, 0);
            this.line_hover_left.visible = false;
            game.add.existing(this.line_hover_left);
            this.line_hover_right = new Phaser.Graphics(this.game, 0, 0);
            this.line_hover_right.visible = false;
            game.add.existing(this.line_hover_right);

            // Start processing the battle log
            this.log_processor = new LogProcessor(this);

            // Handle space bar to end turn
            this.space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.space_key.onUp.add(this.onSpaceKeyPressed, this);
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

            if (this.line_hover_left) {
                this.line_hover_left.destroy();
                this.line_hover_left = null;
            }

            if (this.line_hover_right) {
                this.line_hover_right.destroy();
                this.line_hover_right = null;
            }

            if (this.space_key) {
                this.space_key.onUp.remove(this.onSpaceKeyPressed, this);
                this.space_key = null;
            }

            this.battle = null;
        }

        // Listener for space key events
        onSpaceKeyPressed(): void {
            if (this.battle.playing_ship && this.battle.playing_ship.getPlayer() === this.player) {
                this.battle.advanceToNextShip();
            }
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
            this.card_hovered.setShip(ship === this.card_playing.ship ? null : ship);
            this.arena.setShipHovered(ship);
            this.ship_list.setHovered(ship);
            if (this.targetting) {
                if (ship) {
                    this.targetting.setTargetShip(ship);
                } else {
                    this.targetting.unsetTarget();
                }
            }
            this.updateHoverLines();
        }

        // Update the hover lines
        updateHoverLines(): void {
            // TODO Simplify this
            if (this.ship_hovered) {
                var listitem = this.ship_list.findItem(this.ship_hovered);
                var sprite = this.arena.findShipSprite(this.ship_hovered);

                if (listitem && sprite) {
                    var listitemhover = listitem.layer_hover;
                    var spritehover = sprite.hover;
                    var start = listitemhover.toGlobal(new PIXI.Point(listitemhover.width, listitemhover.height / 2));
                    var end = spritehover.toGlobal(new PIXI.Point(-spritehover.width / 2, 0));

                    this.line_hover_left.clear();
                    this.line_hover_left.lineStyle(2, 0xC7834A, 0.7);
                    this.line_hover_left.moveTo(start.x, start.y);
                    this.line_hover_left.lineTo(end.x, end.y);

                    var card = this.ship_hovered === this.battle.playing_ship ? this.card_playing : this.card_hovered;
                    start = spritehover.toGlobal(new PIXI.Point(spritehover.width / 2, 0));
                    end = card.toGlobal(new PIXI.Point(0, card.height / 2));

                    this.line_hover_right.clear();
                    this.line_hover_right.lineStyle(2, 0xC7834A, 0.7);
                    this.line_hover_right.moveTo(start.x, start.y);
                    this.line_hover_right.lineTo(end.x, end.y);

                    Animation.fadeIn(this.game, this.line_hover_left, 200);
                    Animation.fadeIn(this.game, this.line_hover_right, 200);
                } else {
                    Animation.fadeOut(this.game, this.line_hover_left, 200);
                    Animation.fadeOut(this.game, this.line_hover_right, 200);
                }
            } else {
                Animation.fadeOut(this.game, this.line_hover_left, 200);
                Animation.fadeOut(this.game, this.line_hover_right, 200);
            }
        }

        // Enable or disable the global player interaction
        //  Disable interaction when it is the AI turn, or when the current ship can't play
        setInteractionEnabled(enabled: boolean): void {
            this.exitTargettingMode();
            this.interacting = enabled;

            Animation.setVisibility(this.game, this.icon_waiting, !this.interacting, 100);
        }

        // Enter targetting mode
        //  While in this mode, the Targetting object will receive hover and click events, and handle them
        enterTargettingMode(): Targetting {
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
    }
}
