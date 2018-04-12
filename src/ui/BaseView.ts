module TK.SpaceTac.UI {
    /**
     * Base class for all game views
     */
    export class BaseView extends Phaser.State {
        // Link to the root UI
        gameui!: MainUI

        // Message notifications
        messages!: Messages

        // Input and key bindings
        inputs!: InputManager

        // Animations
        animations!: Animations

        // Timing
        timer!: Timer

        // Tooltip
        tooltip_layer!: Phaser.Group
        tooltip!: Tooltip

        // Layers
        layers!: Phaser.Group

        // Modal dialogs
        dialogs_layer!: Phaser.Group
        dialogs_opened: UIDialog[] = []

        // Verbose debug output
        readonly debug = false

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
            this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
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

            super.create();
        }

        shutdown() {
            this.audio.stopMusic();

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
         * Get or create a layer in the view, by its name
         */
        getLayer(name: string): Phaser.Group {
            let layer = <Phaser.Group>this.layers.getByName(name);
            if (!layer) {
                layer = this.add.group(this.layers, name);
            }
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
            let pos = this.input.mousePointer.position;
            return pos.x >= area.x && pos.x < area.x + area.width && pos.y >= area.y && pos.y < area.y + area.height;
        }

        /**
         * Create a simple text
         */
        newText(content: string, x = 0, y = 0, size = 16, color = "#ffffff", shadow = true, bold = false, center = true, vcenter = center, width = 0): Phaser.Text {
            let style = { font: `${bold ? "bold " : ""}${size}pt SpaceTac`, fill: color, align: center ? "center" : "left" };
            let text = new Phaser.Text(this.game, x, y, content, style);
            text.anchor.set(center ? 0.5 : 0, vcenter ? 0.5 : 0);
            if (width) {
                text.wordWrap = true;
                text.wordWrapWidth = width;
            }
            if (shadow) {
                text.setShadow(3, 4, "rgba(0,0,0,0.6)", 6);
            }
            return text;
        }

        /**
         * Get a new image from an atlas name
         */
        newImage(name: string, x = 0, y = 0): Phaser.Image {
            let info = this.getImageInfo(name);
            let result = this.game.add.image(x, y, info.key, info.frame);
            result.name = name;
            return result;
        }

        /**
         * Get a new button from an atlas name
         */
        newButton(name: string, x = 0, y = 0, onclick?: Function): Phaser.Button {
            let info = this.getImageInfo(name);
            let button = new Phaser.Button(this.game, x, y, info.key, onclick || nop, null, info.frame, info.frame);
            let clickable = bool(onclick);
            button.input.useHandCursor = clickable;
            if (clickable) {
                UIComponent.setButtonSound(button);
            }
            return button;
        }

        /**
         * Update an image from an atlas name
         */
        changeImage(image: Phaser.Image | Phaser.Button, name: string): void {
            let info = this.getImageInfo(name);
            image.name = name;
            if (image instanceof Phaser.Button) {
                image.loadTexture(info.key);
                image.setFrames(info.frame, info.frame);
            } else {
                image.loadTexture(info.key, info.frame);
            }
        }

        /**
         * Get an image from atlases
         */
        getImageInfo(name: string): { key: string, frame: number, exists: boolean } {
            // TODO Cache
            if (this.game.cache.checkImageKey(name)) {
                return { key: name, frame: 0, exists: true };
            } else {
                for (let j = 1; j <= 3; j++) {
                    let i = 1;
                    while (this.game.cache.checkImageKey(`atlas${j}-${i}`)) {
                        let data = this.game.cache.getFrameData(`atlas${j}-${i}`);
                        let frames = data.getFrames();
                        let frame = first(frames, frame => AssetLoading.getKey(frame.name) == `data-stage${j}-image-${name}`);
                        if (frame) {
                            return { key: `atlas${j}-${i}`, frame: frame.index, exists: true };
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
    }
}
