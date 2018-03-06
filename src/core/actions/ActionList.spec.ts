module TK.SpaceTac.Specs {
    testing("ActionList", test => {
        test.case("lists actions from ship", check => {
            let actions = new ActionList();
            check.equals(actions.listAll(), [EndTurnAction.SINGLETON]);

            let model = new ShipModel();
            let ship = new Ship(null, null, model);
            actions.updateFromShip(ship);
            check.equals(actions.listAll(), [EndTurnAction.SINGLETON]);

            let action1 = new BaseAction("test1");
            let action2 = new BaseAction("test2");
            let mock = check.patch(model, "getActions", () => [action1, action2]);
            ship.level.forceLevel(3);
            actions.updateFromShip(ship);
            check.equals(actions.listAll(), [action1, action2, EndTurnAction.SINGLETON]);
            check.called(mock, [[3, []]]);

            let up1: ShipUpgrade = { code: "up1" };
            let up2: ShipUpgrade = { code: "up2" };
            check.patch(model, "getLevelUpgrades", () => [up1, up2]);
            ship.level.activateUpgrade(up1, true);
            actions.updateFromShip(ship);
            check.equals(actions.listAll(), [action1, action2, EndTurnAction.SINGLETON]);
            check.called(mock, [[3, ["up1"]]]);
        })

        test.case("lists toggled actions", check => {
            let actions = new ActionList();
            check.equals(actions.listToggled(), [], "init");

            let action1 = new ToggleAction("test1");
            let action2 = new ToggleAction("test2");
            (<any>actions).from_model = [new BaseAction(), action1, action2];
            check.equals(actions.listToggled(), [], "actions added but not toggled");

            actions.toggle(action1, true);
            check.equals(actions.listToggled(), [action1], "action1 is toggled");

            actions.toggle(new ToggleAction("test3"), true);
            check.equals(actions.listToggled(), [action1], "action3 cannot be toggled");
        })
    })
}
