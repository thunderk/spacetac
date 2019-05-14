module TK.SpaceTac.UI {
    class AudioSettings {
        main_volume = 1
        music_volume = 1
    }

    /**
     * Utility functions to play sounds and musics
     */
    export class Audio {
        private static SETTINGS = new AudioSettings()
        private music: Phaser.Sound.BaseSound | undefined
        private music_playing_volume = 1

        constructor(private game: MainUI) {
        }

        /**
         * Check if the sound system is active, and return a manager to operate with it
         */
        private getManager(): Phaser.Sound.BaseSoundManager | null {
            return this.game.sound;
        }

        /**
         * Check if an audio key is present in cache
         */
        hasCache(key: string): boolean {
            return this.game.cache.audio.has(key);
        }

        /**
         * Play a single sound effect (fire-and-forget)
         */
        playOnce(key: string, speed = 1): void {
            if (speed != 1) {
                // TODO
                return;
            }

            let manager = this.getManager();
            if (manager) {
                if (this.hasCache(key)) {
                    manager.play(key);
                } else {
                    console.warn("Missing sound", key);
                }
            }
        }

        /**
         * Start a background music in repeat
         */
        startMusic(key: string, volume = 1): void {
            let manager = this.getManager();
            if (manager) {
                this.stopMusic();

                if (!this.music) {
                    key = "music-" + key;
                    if (this.hasCache(key)) {
                        this.music_playing_volume = volume;
                        this.music = manager.add(key, {
                            volume: volume * Audio.SETTINGS.music_volume,
                            loop: true
                        });
                        this.music.play();
                    } else {
                        console.warn("Missing music", key);
                    }
                }
            }
        }

        /**
         * Stop currently playing background music
         */
        stopMusic(): void {
            let music = this.music;
            if (music) {
                music.stop();
                music.destroy();
                this.music = undefined;
            }
        }

        /**
         * Get the main volume (0-1)
         */
        getMainVolume(): number {
            return Audio.SETTINGS.main_volume;
        }

        /**
         * Set the main volume (0-1)
         */
        setMainVolume(value: number) {
            Audio.SETTINGS.main_volume = clamp(value, 0, 1);

            let manager = this.getManager();
            if (manager) {
                manager.volume = Audio.SETTINGS.main_volume;
            }
        }

        /**
         * Get the music volume (0-1)
         */
        getMusicVolume(): number {
            return Audio.SETTINGS.music_volume;
        }

        /**
         * Set the music volume (0-1)
         */
        setMusicVolume(value: number) {
            Audio.SETTINGS.music_volume = clamp(value, 0, 1);

            let music = this.music;
            if (music) {
                // TODO Set music volume
                if (Audio.SETTINGS.music_volume) {
                    music.resume();
                } else {
                    music.pause();
                }
            }
        }
    }
}
