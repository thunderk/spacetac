module TK.SpaceTac.UI.Specs {
    testing("ActionTooltip", test => {
        let testgame = setupEmptyView(test);

        test.case("displays action information", check => {
            let tooltip = new Tooltip(testgame.view);
            let ship = new Ship();
            TestTools.setShipModel(ship, 100, 0, 10);

            let action1 = ship.actions.addCustom(new MoveAction("Thruster"));
            let action2 = ship.actions.addCustom(new TriggerAction("Superweapon", { effects: [new DamageEffect(12)], power: 2, range: 50 }));
            let action3 = ship.actions.addCustom(new EndTurnAction());

            ActionTooltip.fill(tooltip.getBuilder(), ship, action1, 0);
            checkText(check, tooltip.container.content.list[1], "Use Thruster");
            checkText(check, tooltip.container.content.list[2], "Cost: 1 power per 0km");
            checkText(check, tooltip.container.content.list[3], "Move: 0km per power point (safety: 120km)");
            checkText(check, tooltip.container.content.list[4], "[ 1 ]");

            tooltip.hide();
            ActionTooltip.fill(tooltip.getBuilder(), ship, action2, 1);
            checkText(check, tooltip.container.content.list[1], "Fire Superweapon");
            checkText(check, tooltip.container.content.list[2], "Cost: 2 power");
            checkText(check, tooltip.container.content.list[3], "Fire (power 2, range 50km):\n• do 12 damage on target");
            checkText(check, tooltip.container.content.list[4], "[ 2 ]");

            tooltip.hide();
            ActionTooltip.fill(tooltip.getBuilder(), ship, action3, 2);
            checkText(check, tooltip.container.content.list[1], "End turn");
            checkText(check, tooltip.container.content.list[2], "End the current ship's turn.\nWill also generate power and cool down equipments.");
            checkText(check, tooltip.container.content.list[3], "[ space ]");
        });
    });
}
