module TK.SpaceTac.UI {
    /**
     * Base class for all game views
     */
    export class BaseView extends Phaser.Scene {
        // Link to the root UI
        gameui!: MainUI

        // Message notifications
        messages_layer!: UIContainer
        messages!: Messages

        // Audio system
        audio!: Audio

        // Input and key bindings
        inputs!: InputManager

        // Animations
        animations!: Animations
        particles!: UIParticles

        // Timing
        timer!: Timer

        // Tooltip
        tooltip_layer!: UIContainer
        tooltip!: Tooltip

        // Layers
        layers!: UIContainer

        // Modal dialogs
        dialogs_layer!: UIContainer
        dialogs_opened: UIDialog[] = []

        // Verbose debug output
        debug = false

        // Get the size of display
        getWidth(): number {
            return 1920;
        }
        getHeight(): number {
            return 1080;
        }
        getMidWidth(): number {
            return 960;
        }
        getMidHeight(): number {
            return 540;
        }

        init(data: object) {
            console.log(`Starting scene ${classname(this)}`);

            this.gameui = <MainUI>this.sys.game;
            this.timer = new Timer(this.gameui.isTesting);
            this.animations = new Animations(this.tweens);
            this.particles = new UIParticles(this);
            this.inputs = new InputManager(this);
            this.audio = new Audio(this);
            this.debug = this.gameui.debug;

            this.input.setDefaultCursor("url(cursors/standard.cur), pointer");

            this.events.once("shutdown", () => this.shutdown());
        }

        shutdown() {
            console.log(`Shutting down scene ${classname(this)}`);

            this.inputs.destroy();
            this.audio.stopMusic();
            this.timer.cancelAll(true);
        }

        create() {
            // Layers
            this.layers = new UIContainer(this);
            this.add.existing(this.layers);
            this.layers.setName("View layers");
            this.dialogs_layer = new UIContainer(this);
            this.dialogs_layer.setName("Dialogs layer");
            this.add.existing(this.dialogs_layer);
            this.tooltip_layer = new UIContainer(this);
            this.tooltip_layer.setName("Tooltip layer");
            this.add.existing(this.tooltip_layer);
            this.tooltip = new Tooltip(this);
            this.messages_layer = new UIContainer(this);
            this.messages_layer.setName("Messages layer");
            this.add.existing(this.messages_layer);
            this.messages = new Messages(this);
            this.dialogs_opened = [];

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
            this.scene.start('router');
        }

        /**
         * Get or create a layer in the view, by its name
         */
        getLayer(name: string): UIContainer {
            let layer = this.layers.getByName(name);
            if (layer && layer instanceof UIContainer) {
                return layer;
            } else {
                let layer = new UIContainer(this);
                layer.setName(name);
                this.layers.add(layer);
                return layer;
            }
        }

        /**
         * Get proportional locations on screen
         */
        getScaling(): number {
            return this.gameui.scaling;
        }
        getX(propx: number, scaled = true): number {
            return propx * 1920 * (scaled ? this.getScaling() : 1);
        }
        getY(propy: number, scaled = true): number {
            return propy * 1080 * (scaled ? this.getScaling() : 1);
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
        showOptions(credits = false): void {
            new OptionsDialog(this, credits);
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
            let pos = this.input.activePointer.position;
            return pos.x >= area.x && pos.x < area.x + area.width && pos.y >= area.y && pos.y < area.y + area.height;
        }

        /**
         * Get a new image from an atlas name
         */
        newImage(name: string, x = 0, y = 0): UIImage {
            let info = this.getImageInfo(name);
            let result = this.add.image(x, y, info.key, info.frame);
            result.name = name;
            return result;
        }

        /**
         * Update an image from an atlas name
         */
        changeImage(image: UIImage, name: string): void {
            let info = this.getImageInfo(name);
            image.setName(name);
            image.setTexture(info.key, info.frame);
        }

        /**
         * Get an image from atlases
         */
        getImageInfo(name: string): { key: string, frame: number | string, exists: boolean } {
            if (this.textures.exists(name)) {
                return { key: name, frame: 0, exists: true };
            } else {
                for (let j = 1; j <= 3; j++) {
                    let i = 1;
                    while (this.textures.exists(`atlas${j}-${i}`)) {
                        let frames = this.textures.get(`atlas${j}-${i}`).getFrameNames();
                        let frame = first(frames, frame => AssetLoading.getKey(frame) == `data-stage${j}-image-${name}`);
                        if (frame) {
                            return { key: `atlas${j}-${i}`, frame: frame, exists: true };
                        }
                        i++;
                    }
                }
                return { key: `-missing-${name}`, frame: 0, exists: false };
            }
        }

        /**
         * Returns the first image found in atlases
         */
        getFirstImage(...names: string[]): string {
            return first(names, name => this.getImageInfo(name).key.substr(0, 9) != '-missing-') || names[names.length - 1];
        }

        /**
         * Check if the scene is paused
         */
        isPaused(): boolean {
            return this.time.paused;
        }
    }
}
