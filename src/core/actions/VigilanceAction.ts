/// <reference path="ToggleAction.ts"/>

module TK.SpaceTac {
    /** 
     * Configuration of a vigilance action
     */
    export interface VigilanceActionConfig {
        // Maximal number of trespassing ships before deactivating (0 for unlimited)
        intruder_count: number
        // Effects to be applied on ships entering the area
        intruder_effects: BaseEffect[]
    }

    /**
     * Action to watch the ship surroundings, and trigger specific effects on any ship that enters the area
     */
    export class VigilanceAction extends ToggleAction implements VigilanceActionConfig {
        intruder_count = 1;
        intruder_effects: BaseEffect[] = [];

        constructor(name: string, toggle_config?: Partial<ToggleActionConfig>, vigilance_config?: Partial<VigilanceActionConfig>, code?: string) {
            super(name, toggle_config, code);

            if (vigilance_config) {
                this.configureVigilance(vigilance_config);
            }
        }

        /**
         * Configure the deployed drone
         */
        configureVigilance(config: Partial<VigilanceActionConfig>): void {
            copyfields(config, this);
            this.effects = [new VigilanceEffect(this)];
        }

        getVerb(ship: Ship): string {
            return ship.actions.isToggled(this) ? "Stop" : "Watch with";
        }

        getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            // Do not apply effects, only register the VigilanceEffect on the ships already in the area
            let result = super.getSpecificDiffs(ship, battle, target, false);
            return result;
        }

        getEffectsDescription(): string {
            let desc = `Watch a ${this.radius}km area (power usage ${this.power})`;

            let suffix: string;
            if (this.intruder_count == 0) {
                suffix = `for all incoming ${BaseAction.getFilterDesc(this.filter)}`;
            } else if (this.intruder_count == 1) {
                suffix = `for the first incoming ${BaseAction.getFilterDesc(this.filter, false)}`;
            } else {
                suffix = `for the first ${this.intruder_count} incoming ${BaseAction.getFilterDesc(this.filter)}`;
            }

            let effects = this.intruder_effects.map(effect => {
                return "• " + effect.getDescription() + " " + suffix;
            });

            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}
