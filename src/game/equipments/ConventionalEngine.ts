/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Game.Equipments {
    // Equipment: Conventional Engine
    export class ConventionalEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Conventional Engine");

            this.min_level = new IntegerRange(1, 1);
            this.distance = new Range(100, 100);
            this.ap_usage = new IntegerRange(1);

            this.addPermanentAttributeMaxEffect(AttributeCode.Initiative, 1);
        }

        protected getActionForEquipment(equipment: Equipment): BaseAction {
            return new MoveAction(equipment);
        }
    }
}
