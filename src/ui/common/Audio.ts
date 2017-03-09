module TS.SpaceTac.UI {
    // Utility functions for sounds
    export class Audio {

        private game: MainUI;

        private music: Phaser.Sound | null;

        constructor(game: MainUI) {
            this.game = game;
            this.music = null;
        }

        // Check if the sound system is up and running
        isActive(): boolean {
            return !this.game.headless && this.game.sound.context;
        }

        // Play a ponctual sound
        playOnce(key: string): void {
            if (this.isActive()) {
                this.game.sound.play(key);
            }
        }

        // Start a background music
        startMusic(key: string): void {
            key = "music-" + key;
            if (this.isActive()) {
                if (this.music && this.music.key !== key) {
                    this.stopMusic();
                }
                if (!this.music) {
                    this.music = this.game.sound.play(key, 1, true);
                }
            }
        }

        // Stop currently playing background music
        stopMusic(): void {
            if (this.isActive()) {
                if (this.music) {
                    this.music.stop();
                    this.music = null;
                }
            }
        }

        // Toggle the mute status of the sound system
        toggleMute(): void {
            if (this.isActive()) {
                if (this.game.sound.volume > 0) {
                    this.game.sound.volume = 0;
                } else {
                    this.game.sound.volume = 1;
                }
            }
        }
    }
}
