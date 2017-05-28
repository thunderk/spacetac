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
        tooltip_layer: Phaser.Group;
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
            // Phaser config
            this.game.stage.backgroundColor = 0x000000;
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.input.maxPointers = 1;

            // Tools
            this.animations = new Animations(this.game.tweens);
            this.inputs = new InputManager(this);

            // Layers
            this.layers = this.add.group();
            this.tooltip_layer = this.add.group();
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

        /**
         * Add a new layer in the view
         */
        addLayer(): Phaser.Group {
            let layer = this.add.group(this.layers);
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
            let connection = this.getConnection();
            connection.publish(session, session.getDescription())
                .then(() => this.messages.addMessage("Auto-saved to cloud"))
                .catch(console.error)
            //.catch(() => this.messages.addMessage("Error saving game to cloud"));
        }

        /**
         * Toggle fullscreen mode.
         * 
         * Returns true if the result is fullscreen
         */
        toggleFullscreen(active: boolean | null = null): boolean {
            if (active === false || (active !== true && this.game.scale.isFullScreen)) {
                this.scale.stopFullScreen();
                this.setStorage("fullscreen", "false");
                return false;
            } else {
                this.scale.startFullScreen(true);
                this.setStorage("fullscreen", "true");
                return true;
            }
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
