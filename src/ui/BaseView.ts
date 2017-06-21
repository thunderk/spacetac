module TS.SpaceTac.UI {
    /**
     * Base class for all game views
     */
    export class BaseView extends Phaser.State {
        // Link to the root UI
        gameui: MainUI

        // Message notifications
        messages: Messages

        // Input and key bindings
        inputs: InputManager

        // Animations
        animations: Animations

        // Timing
        timer: Timer

        // Tooltip
        tooltip_layer: Phaser.Group
        tooltip: Tooltip

        // Layers
        layers: Phaser.Group

        // Modal dialogs
        dialogs_layer: Phaser.Group

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
            // Phaser config
            this.game.stage.backgroundColor = 0x000000;
            this.game.stage.disableVisibilityChange = this.gameui.headless;
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.input.maxPointers = 1;

            // Tools
            this.animations = new Animations(this.game.tweens);
            this.inputs = new InputManager(this);

            // Layers
            this.layers = this.add.group(undefined, "View layers");
            this.dialogs_layer = this.add.group(undefined, "Dialogs layer");
            this.tooltip_layer = this.add.group(undefined, "Tooltip layer");
            this.tooltip = new Tooltip(this);
            this.messages = new Messages(this);

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

        get audio() {
            return this.gameui.audio;
        }
        get options() {
            return this.gameui.options;
        }
        get session() {
            return this.gameui.session;
        }

        /**
         * Go back to the router state
         */
        backToRouter() {
            this.game.state.start('router');
        }

        /**
         * Add a new layer in the view
         */
        addLayer(name: string): Phaser.Group {
            let layer = this.add.group(this.layers, name);
            return layer;
        }

        /**
         * Get a network connection to the backend server
         */
        getConnection(): Multi.Connection {
            let device_id = this.gameui.getDeviceId();
            if (device_id) {
                return new Multi.Connection(device_id, new Multi.ParseRemoteStorage());
            } else {
                // TODO Should warn the user !
                return new Multi.Connection("fake", new Multi.FakeRemoteStorage());
            }
        }

        /**
         * Auto-save current session to cloud
         * 
         * This may be called at key points during the gameplay
         */
        autoSave(): void {
            let session = this.gameui.session;
            if (session.primary) {
                let connection = this.getConnection();
                connection.publish(session, session.getDescription())
                    .then(() => this.messages.addMessage("Auto-saved to cloud"))
                    .catch(console.error)
                //.catch(() => this.messages.addMessage("Error saving game to cloud"));
            }
        }

        /**
         * Open options dialog
         */
        showOptions(): void {
            let dialog = new OptionsDialog(this);
        }

        /**
         * Set a value in localStorage, if available
         */
        setStorage(key: string, value: string): void {
            if (typeof localStorage != "undefined") {
                localStorage.setItem("spacetac-" + key, value);
            }
        }

        /**
         * Get a value from localStorage
         */
        getStorage(key: string): string | null {
            if (typeof localStorage != "undefined") {
                return localStorage.getItem("spacetac-" + key);
            } else {
                return null;
            }
        }

        /**
         * Check if the mouse is inside a given area
         */
        isMouseInside(area: IBounded): boolean {
            let pos = this.input.mousePointer.position;
            return pos.x >= area.x && pos.x < area.x + area.width && pos.y >= area.y && pos.y < area.y + area.height;
        }

        /**
         * Get the first image found in cache
         */
        getImage(...keys: string[]): string {
            let found = first(keys, key => this.game.cache.checkImageKey(key));
            return found ? found : "default";
        }
    }
}
