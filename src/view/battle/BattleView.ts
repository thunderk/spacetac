/// <reference path="../BaseView.ts"/>

module SpaceTac.View {
    // Interactive view of a Battle
    export class BattleView extends BaseView {

        // Displayed battle
        battle: Game.Battle;

        // Interacting player
        player: Game.Player;

        // UI container
        ui: Phaser.Group;

        // Battleground container
        arena: Arena;

        // Background image
        background: Phaser.Image;

        // Targetting mode (null if we're not in this mode)
        targetting: Targetting;

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

        // Lines used to highlight hovered ship
        private line_hover_left: Phaser.Graphics;

        // Init the view, binding it to a specific battle
        init(player: Game.Player, battle: Game.Battle) {
            super.init();

            this.player = player;
            this.battle = battle;
            this.targetting = null;
            this.ship_hovered = null;
            this.log_processor = null;
            this.background = null;
            this.line_hover_left = null;
        }

        // Create view graphics
        create() {
            super.create();

            var game = this.game;

            // Background
            game.stage.backgroundColor = 0x000000;
            this.background = new Phaser.Image(game, 0, 0, "battle-background", 0);
            game.add.existing(this.background);

            // Add arena (local map)
            this.arena = new Arena(this);
            game.add.existing(this.arena);

            // Add UI layer
            this.ui = new Phaser.Group(game);
            game.add.existing(this.ui);

            // Add UI elements
            this.action_bar = new ActionBar(this);
            this.ship_list = new ShipList(this);

            this.icon_waiting = new Phaser.Image(this.game, this.getWidth() / 2, 50, "battle-waiting", 0);
            this.icon_waiting.anchor.set(0.5, 0.5);
            this.icon_waiting.scale.set(0.5, 0.5);
            game.add.existing(this.icon_waiting);
            game.tweens.create(this.icon_waiting).to({"angle": 360}, 3000).repeat(-1).start();

            this.line_hover_left = new Phaser.Graphics(this.game, 0, 0);
            this.line_hover_left.visible = false;
            game.add.existing(this.line_hover_left);

            // Start processing the battle log
            this.log_processor = new LogProcessor(this);

            // "Battle" animation
            this.displayFightMessage();

            // BGM
            this.gameui.audio.startMusic("full-on");

            // Key mapping
            this.inputs.bind(Phaser.Keyboard.SPACEBAR, "End turn", this.onSpaceKeyPressed);
            this.inputs.bindCheat(Phaser.Keyboard.W, "Win current battle", () => {
                this.battle.endBattle(this.player.fleet);
            });
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

            if (this.line_hover_left) {
                this.line_hover_left.destroy();
                this.line_hover_left = null;
            }

            this.battle = null;

            super.shutdown();
        }

        // Display an animated "BATTLE" text in the center of the view
        displayFightMessage(): void {
            var text = this.game.add.text(this.getMidWidth(), this.getMidHeight(), "BATTLE !",
                {align: "center", font: "bold 42px Arial", fill: "#EE2233"});
            text.anchor.set(0.5, 0.5);
            this.game.tweens.create(text.scale).to({x: 3, y: 3}).start();
            var text_anim = this.game.tweens.create(text).to({alpha: 0});
            text_anim.onComplete.addOnce(() => {
                text.destroy();
            });
            text_anim.start();
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
                    var start = listitemhover.toGlobal(new PIXI.Point(listitemhover.width / 2, 0));
                    var end = spritehover.toGlobal(new PIXI.Point(-spritehover.width / 2, 0));

                    this.line_hover_left.clear();
                    this.line_hover_left.lineStyle(2, 0xC7834A, 0.7);
                    this.line_hover_left.moveTo(start.x, start.y);
                    this.line_hover_left.lineTo(end.x, end.y);

                    Animation.fadeIn(this.game, this.line_hover_left, 200);
                } else {
                    Animation.fadeOut(this.game, this.line_hover_left, 200);
                }
            } else {
                Animation.fadeOut(this.game, this.line_hover_left, 200);
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
