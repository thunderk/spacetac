/// <reference path="../BaseView.ts"/>

module TK.SpaceTac.UI {
    /**
     * View to configure the initial characters in the fleet
     */
    export class FleetCreationView extends BaseView {
        built_fleet!: Fleet
        infinite_shop!: Shop
        character_sheet!: CharacterSheet

        create() {
            super.create();

            let models = ShipModel.getRandomModels(2);

            this.built_fleet = new Fleet();
            this.built_fleet.addShip(new Ship(null, MissionGenerator.generateCharacterName(), models[0]));
            this.built_fleet.addShip(new Ship(null, MissionGenerator.generateCharacterName(), models[1]));
            this.built_fleet.credits = this.built_fleet.ships.length * 1000;

            this.character_sheet = new CharacterSheet(this, CharacterSheetMode.CREATION, () => this.validateFleet());
            this.character_sheet.show(this.built_fleet.ships[0], false);
            this.character_sheet.moveToLayer(this.getLayer("characters"));
        }

        /**
         * Validate the configured fleet and move on
         */
        async validateFleet() {
            let confirmed = await UIConfirmDialog.ask(this, "Do you confirm these initial fleet settings ?");
            if (confirmed) {
                this.session.setCampaignFleet(this.built_fleet, this.session.hasUniverse());
                this.backToRouter();
            }
        }
    }
}
