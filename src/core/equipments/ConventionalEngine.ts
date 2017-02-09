/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    // Equipment: Conventional Engine
    export class ConventionalEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Conventional Engine");

            this.min_level = new IntegerRange(1, 1);
            this.distance = new Range(100, 100);
            this.ap_usage = new IntegerRange(1);

            this.increaseAttribute("initiative", 1);
        }

        protected getActionForEquipment(equipment: Equipment): BaseAction {
            return new MoveAction(equipment);
        }
    }
}
