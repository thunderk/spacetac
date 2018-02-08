/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ActionTooltip", test => {
        let testgame = setupEmptyView(test);

        test.case("displays action information", check => {
            let tooltip = new Tooltip(testgame.view);
            let ship = new Ship();
            TestTools.setShipModel(ship, 100, 0, 10);

            let action1 = new MoveAction("Thruster");
            let action2 = new TriggerAction("Superweapon", { effects: [new DamageEffect(12)], power: 2, range: 50 });
            let action3 = new EndTurnAction();

            ActionTooltip.fill(tooltip.getBuilder(), ship, action1, 0);
            checkText(check, (<any>tooltip).container.content.children[1], "Use Thruster");
            checkText(check, (<any>tooltip).container.content.children[2], "Cost: 1 power per 0km");
            checkText(check, (<any>tooltip).container.content.children[3], "Move: 0km per power point (safety: 120km)");
            checkText(check, (<any>tooltip).container.content.children[4], "[ 1 ]");

            tooltip.hide();
            ActionTooltip.fill(tooltip.getBuilder(), ship, action2, 1);
            checkText(check, (<any>tooltip).container.content.children[1], "Fire Superweapon");
            checkText(check, (<any>tooltip).container.content.children[2], "Cost: 2 power");
            checkText(check, (<any>tooltip).container.content.children[3], "Fire (power 2, range 50km):\n• do 12 damage on target");
            checkText(check, (<any>tooltip).container.content.children[4], "[ 2 ]");

            tooltip.hide();
            ActionTooltip.fill(tooltip.getBuilder(), ship, action3, 2);
            checkText(check, (<any>tooltip).container.content.children[1], "End turn");
            checkText(check, (<any>tooltip).container.content.children[2], "End the current ship's turn.\nWill also generate power and cool down equipments.");
            checkText(check, (<any>tooltip).container.content.children[3], "[ space ]");
        });
    });
}
