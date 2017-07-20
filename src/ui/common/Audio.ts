module TS.SpaceTac.UI {
    // Utility functions for sounds
    export class Audio {
        private game: MainUI
        private music: Phaser.Sound | null = null
        private music_volume = 1
        private music_playing_volume = 1

        constructor(game: MainUI) {
            this.game = game;
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
        startMusic(key: string, volume = 1): void {
            key = "music-" + key;
            if (this.isActive()) {
                this.stopMusic();
                if (!this.music) {
                    this.music_playing_volume = volume;
                    this.music = this.game.sound.play(key, volume * this.music_volume, true);
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

        /**
         * Get the main volume (0-1)
         */
        getMainVolume(): number {
            if (this.isActive()) {
                return this.game.sound.volume;
            } else {
                return 0;
            }
        }

        /**
         * Set the main volume (0-1)
         */
        setMainVolume(value: number) {
            if (this.isActive()) {
                this.game.sound.volume = clamp(value, 0, 1);
            }
        }

        /**
         * Get the music volume (0-1)
         */
        getMusicVolume(): number {
            return this.music_volume;
        }

        /**
         * Set the music volume (0-1)
         */
        setMusicVolume(value: number) {
            this.music_volume = value;
            if (this.isActive()) {
                if (this.music) {
                    this.music.volume = value * this.music_playing_volume;
                }
            }
        }
    }
}
