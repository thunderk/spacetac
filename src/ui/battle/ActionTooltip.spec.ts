/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    describe("ActionTooltip", function () {
        let testgame = setupEmptyView();

        it("displays action information", () => {
            let tooltip = new Tooltip(testgame.view);
            let ship = new Ship();
            TestTools.setShipAP(ship, 10);

            let action1 = new MoveAction(new Equipment());
            nn(action1.equipment).name = "Engine";
            action1.name = "Move";
            let action2 = new TriggerAction(new Equipment(), [new DamageEffect(12)], 2, 50, 0);
            nn(action2.equipment).name = "Weapon";
            action2.name = "Fire";
            let action3 = new EndTurnAction();
            action3.name = "End turn";

            ActionTooltip.fill(tooltip.getFiller(), ship, action1, 0);
            checkText((<any>tooltip).container.content.children[1], "Engine");
            checkText((<any>tooltip).container.content.children[2], "Cost: 1 power per 0km");
            checkText((<any>tooltip).container.content.children[3], "Move: 0km per power point (safety: 120km)");
            checkText((<any>tooltip).container.content.children[4], "[ 1 ]");

            tooltip.hide();
            ActionTooltip.fill(tooltip.getFiller(), ship, action2, 1);
            checkText((<any>tooltip).container.content.children[1], "Weapon");
            checkText((<any>tooltip).container.content.children[2], "Cost: 2 power");
            checkText((<any>tooltip).container.content.children[3], "Fire (power usage 2, max range 50km):\n• do 12 damage on target");
            checkText((<any>tooltip).container.content.children[4], "[ 2 ]");

            tooltip.hide();
            ActionTooltip.fill(tooltip.getFiller(), ship, action3, 2);
            checkText((<any>tooltip).container.content.children[1], "End turn");
            checkText((<any>tooltip).container.content.children[2], "End the current ship's turn.\nWill also generate power and cool down equipments.");
            checkText((<any>tooltip).container.content.children[3], "[ space ]");
        });
    });
}
