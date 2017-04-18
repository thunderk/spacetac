module TS.SpaceTac {
    // Base class for effects of actions
    // Effects are typically one shot, but sticky effects can be used to apply effects over a period
    export class BaseEffect {
        // Identifier code for the type of effect
        code: string;

        // Base constructor
        constructor(code: string) {
            this.code = code;
        }

        // Apply ponctually the effect on a given ship
        //  Return true if the effect could be applied
        applyOnShip(ship: Ship): boolean {
            return false;
        }

        // Return true if the effect is beneficial to the ship, false if it's a drawback
        isBeneficial(): boolean {
            return false;
        }

        // Get a full code, that can be used to identify this effect (for example: "attrlimit-aprecovery")
        getFullCode(): string {
            return this.code;
        }

        // Return a human readable description
        getDescription(): string {
            return "unknown effect";
        }
    }
}
