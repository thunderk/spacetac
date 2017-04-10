module TS.SpaceTac.UI {
    /**
     * Base class for all game views
     */
    export class BaseView extends Phaser.State {
        // Link to the root UI
        gameui: MainUI;

        // Message notifications
        messages: Messages;

        // Input and key bindings
        inputs: InputManager;

        // Animations
        animations: Animations;

        // Timing
        timer: Timer;

        // Tooltip
        tooltip: Tooltip;

        // Layers
        layers: Phaser.Group;

        // Get the size of display
        getWidth(): number {
            return this.game.width || 1280;
        }
        getHeight(): number {
            return this.game.height || 720;
        }
        getMidWidth(): number {
            return this.getWidth() / 2;
        }
        getMidHeight(): number {
            return this.getHeight() / 2;
        }

        init(...args: any[]) {
            this.gameui = <MainUI>this.game;
            this.timer = new Timer(this.gameui.headless);
        }

        create() {
            this.game.stage.backgroundColor = 0x000000;

            // View layers
            this.layers = this.add.group();

            // Notifications
            this.messages = new Messages(this);

            // Animations
            this.animations = new Animations(this.game.tweens);

            // Input manager
            this.inputs = new InputManager(this);

            // Tooltip
            this.tooltip = new Tooltip(this);

            // Browser console variable (for debugging purpose)
            if (typeof window != "undefined") {
                let session = this.gameui.session;
                if (session) {
                    (<any>window).universe = session.universe;
                    (<any>window).player = session.player;
                    (<any>window).battle = session.player.getBattle();
                    (<any>window).view = this;
                }
            }

            super.create();
        }

        shutdown() {
            super.shutdown();

            this.timer.cancelAll(true);
        }

        /**
         * Add a new layer in the view
         */
        addLayer(): Phaser.Group {
            let layer = this.add.group(this.layers);
            return layer;
        }
    }
}
