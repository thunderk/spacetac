/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ActionTooltip", test => {
        let testgame = setupEmptyView(test);

        test.case("displays action information", check => {
            let tooltip = new Tooltip(testgame.view);
            let ship = new Ship();
            TestTools.setShipAP(ship, 10);

            let action1 = new MoveAction(new Equipment());
            nn(action1.equipment).name = "Engine";
            check.patch(action1, "getVerb", () => "Move");
            let action2 = new TriggerAction(new Equipment(), [new DamageEffect(12)], 2, 50, 0);
            nn(action2.equipment).name = "Weapon";
            check.patch(action2, "getVerb", () => "Fire");
            let action3 = new EndTurnAction();
            check.patch(action3, "getVerb", () => "End turn");

            ActionTooltip.fill(tooltip.getFiller(), ship, action1, 0);
            checkText(check, (<any>tooltip).container.content.children[1], "Engine");
            checkText(check, (<any>tooltip).container.content.children[2], "Cost: 1 power per 0km");
            checkText(check, (<any>tooltip).container.content.children[3], "Move: 0km per power point (safety: 120km)");
            checkText(check, (<any>tooltip).container.content.children[4], "[ 1 ]");

            tooltip.hide();
            ActionTooltip.fill(tooltip.getFiller(), ship, action2, 1);
            checkText(check, (<any>tooltip).container.content.children[1], "Weapon");
            checkText(check, (<any>tooltip).container.content.children[2], "Cost: 2 power");
            checkText(check, (<any>tooltip).container.content.children[3], "Fire (power usage 2, max range 50km):\n• do 12 damage on target");
            checkText(check, (<any>tooltip).container.content.children[4], "[ 2 ]");

            tooltip.hide();
            ActionTooltip.fill(tooltip.getFiller(), ship, action3, 2);
            checkText(check, (<any>tooltip).container.content.children[1], "End turn");
            checkText(check, (<any>tooltip).container.content.children[2], "End the current ship's turn.\nWill also generate power and cool down equipments.");
            checkText(check, (<any>tooltip).container.content.children[3], "[ space ]");
        });
    });
}
