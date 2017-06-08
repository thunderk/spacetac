module TS.SpaceTac.UI {
    class GameOption<T> {
        code: string
        current: T
        getter: () => T
        setter: (value: T) => any

        constructor(code: string, getter: () => T, setter: (value: T) => any) {
            this.code = code;
            this.getter = getter;
            this.setter = setter;
            this.current = getter();
        }

        set(value: T) {
            this.setter(value);
            this.current = this.getter();
        }
    }

    /**
     * Object to store and maintain game-wide options
     * 
     * Options are kept on the browser storage when possible
     */
    export class GameOptions {
        booleans: { [code: string]: GameOption<boolean> }
        numbers: { [code: string]: GameOption<number> }

        constructor(parent: MainUI) {
            this.booleans = {
                fullscreen: new GameOption("fullscreen", () => parent.isFullscreen(), value => parent.toggleFullscreen(value)),
            }
            this.numbers = {
                mainvolume: new GameOption("mainvolume", () => parent.audio.getMainVolume(), value => parent.audio.setMainVolume(value)),
                musicvolume: new GameOption("musicvolume", () => parent.audio.getMusicVolume(), value => parent.audio.setMusicVolume(value)),
            }
        }

        /**
         * Get the current value of a boolean option
         */
        getBooleanValue(code: string, default_value = false): boolean {
            let option = this.booleans[code];
            if (option) {
                return option.current;
            } else {
                return default_value;
            }
        }

        /**
         * Set the current value of a boolean option
         */
        setBooleanValue(code: string, value: boolean): boolean {
            let option = this.booleans[code];
            if (option) {
                option.set(value);
                return true;
            } else {
                return false;
            }
        }

        /**
         * Toggle a boolean value between true and false
         */
        toggleBoolean(code: string): boolean {
            this.setBooleanValue(code, !this.getBooleanValue(code));
            return this.getBooleanValue(code);
        }

        /**
         * Get the current value of a number option
         */
        getNumberValue(code: string, default_value = 0): number {
            let option = this.numbers[code];
            if (option) {
                return option.current;
            } else {
                return default_value;
            }
        }

        /**
         * Set the current value of a number option
         */
        setNumberValue(code: string, value: number): boolean {
            let option = this.numbers[code];
            if (option) {
                option.set(value);
                return true;
            } else {
                return false;
            }
        }
    }
}
