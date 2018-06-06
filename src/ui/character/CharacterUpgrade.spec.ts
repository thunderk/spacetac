/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("CharacterUpgrade", test => {
        let testgame = setupEmptyView(test);

        test.acase("fills tooltip content", async check => {
            let ship = new Ship();
            let upgrade: ShipUpgrade = {
                code: "Test Upgrade",
                description: "A super ship upgrade",
                effects: [
                    new AttributeEffect("hull_capacity", 10),
                    new AttributeEffect("shield_capacity", 5),
                ]
            };

            let display = new CharacterUpgrade(ship, upgrade, 3);
            let tooltip = new TooltipContainer(testgame.view);
            let builder = new TooltipBuilder(tooltip);
            display.fillTooltip(builder);
            check.equals(collectTexts(tooltip.content), [
                "Test Upgrade",
                "Permanent effects:",
                "• hull capacity +10",
                "• shield capacity +5",
                "A super ship upgrade",
            ]);

            upgrade.effects = [];
            upgrade.actions = [new TriggerAction("Test action", {
                range: 50,
                effects: [new DamageEffect(10)]
            })];

            builder.clear();
            display.fillTooltip(builder);
            check.equals(collectTexts(tooltip.content), [
                "Test Upgrade",
                "Fire (power 1, range 50km):",
                "• do 10 damage on target",
                "A super ship upgrade",
            ]);
        })

        test.acase("gets an appropriate icon", async check => {
            let ship = new Ship();
            let upgrade: ShipUpgrade = {
                code: "Test Upgrade",
                effects: [
                    new AttributeEffect("hull_capacity", 10),
                    new AttributeEffect("shield_capacity", 5),
                ]
            };
            let display = new CharacterUpgrade(ship, upgrade, 3);
            check.equals(display.getIcon(), "attribute-hull_capacity");

            upgrade.effects = [];
            upgrade.actions = [new BaseAction("Test Action")];
            check.equals(display.getIcon(), "action-testaction");

            upgrade.actions = [];
            check.equals(display.getIcon(), "common-transparent");

            upgrade.effects = [new DamageEffect(10)];
            check.equals(display.getIcon(), "common-transparent");

            upgrade.effects = [
                new DamageEffect(10),
                new AttributeMultiplyEffect("evasion", 2)
            ];
            check.equals(display.getIcon(), "attribute-evasion");
        })
    })
}
