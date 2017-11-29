/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ActionIcon", test => {
        let testgame = setupBattleview(test);

        test.case("displays power usage", check => {
            let bar = testgame.view.action_bar;
            let ship = new Ship();
            let action = new BaseAction("something");
            let icon = new ActionIcon(bar, ship, action, 0);
            check.same(icon.img_power.visible, false, "initial state");

            icon.refresh();
            check.same(icon.img_power.visible, false, "no change");

            check.patch(action, "getActionPointsUsage", () => 3);
            icon.refresh();
            check.equals(icon.img_power.visible, true);
            check.equals(icon.text_power.text, "3");
        })

        test.case("displays disabled and fading states", check => {
            let bar = testgame.view.action_bar;
            let ship = new Ship();
            TestTools.setShipAP(ship, 5);
            let action = nn(TestTools.addWeapon(ship, 50, 3).action);
            let icon = new ActionIcon(bar, ship, action, 0);

            check.equals(icon.container.name, "battle-actionbar-frame-enabled", "5/5");
            check.equals(icon.img_power.name, "battle-actionbar-consumption-enabled", "5/5");
            check.same(icon.img_power.visible, true, "5/5");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-enabled", "5/5");

            icon.refresh(null, 1);
            check.equals(icon.container.name, "battle-actionbar-frame-enabled", "4/5");
            check.equals(icon.img_power.name, "battle-actionbar-consumption-enabled", "4/5");
            check.same(icon.img_power.visible, true, "4/5");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-enabled", "4/5");

            icon.refresh(null, 4);
            check.equals(icon.container.name, "battle-actionbar-frame-fading", "1/5");
            check.equals(icon.img_power.name, "battle-actionbar-consumption-enabled", "1/5");
            check.same(icon.img_power.visible, true, "1/5");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-enabled", "1/5");

            ship.setValue("power", 2);
            icon.refresh();
            check.equals(icon.container.name, "battle-actionbar-frame-disabled", "2/2");
            check.equals(icon.img_power.name, "battle-actionbar-consumption-disabled", "2/2");
            check.same(icon.img_power.visible, true, "2/2");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-disabled", "2/2");

            icon.refresh(null, 6);
            check.equals(icon.container.name, "battle-actionbar-frame-disabled", "0/2");
            check.equals(icon.img_power.name, "battle-actionbar-consumption-disabled", "0/2");
            check.same(icon.img_power.visible, true, "0/2");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-disabled", "0/2");
        })

        test.case("displays toggle state", check => {
            let bar = testgame.view.action_bar;
            let ship = new Ship();
            TestTools.setShipAP(ship, 5);
            let equipment = new Equipment(SlotType.Weapon);
            ship.addSlot(SlotType.Weapon).attach(equipment);
            let action = new ToggleAction(equipment, 2);
            equipment.action = action;
            let icon = new ActionIcon(bar, ship, action, 0);

            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-enabled", "initial");
            check.equals(icon.img_power.name, "battle-actionbar-consumption-enabled", "initial");
            check.equals(icon.img_sticky.name, "battle-actionbar-sticky-untoggled", "initial");
            check.same(icon.img_sticky.visible, true, "initial");

            action.activated = true;
            icon.refresh();
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-toggled", "initial");
            check.equals(icon.img_power.name, "battle-actionbar-consumption-toggled", "initial");
            check.equals(icon.img_sticky.name, "battle-actionbar-sticky-toggled", "initial");
            check.same(icon.img_sticky.visible, true, "initial");
        })

        test.case("displays overheat/cooldown", check => {
            let bar = testgame.view.action_bar;
            let ship = new Ship();
            TestTools.setShipAP(ship, 5);
            let action = nn(TestTools.addWeapon(ship, 50, 3).action);
            action.cooldown.configure(1, 3);
            let icon = new ActionIcon(bar, ship, action, 0);
            check.same(icon.img_sticky.visible, false, "initial");
            check.equals(icon.img_sticky.name, "battle-actionbar-sticky-untoggled", "initial");
            check.same(icon.img_sticky.children.length, 0, "initial");

            icon.refresh(action);
            check.same(icon.img_sticky.visible, true, "overheat");
            check.equals(icon.img_sticky.name, "battle-actionbar-sticky-overheat", "overheat");
            check.same(icon.img_sticky.children.length, 3, "overheat");

            action.cooldown.configure(1, 12);
            icon.refresh(action);
            check.same(icon.img_sticky.visible, true, "superheat");
            check.equals(icon.img_sticky.name, "battle-actionbar-sticky-overheat", "superheat");
            check.same(icon.img_sticky.children.length, 5, "superheat");

            action.cooldown.configure(1, 4);
            action.cooldown.use();
            icon.refresh(action);
            check.same(icon.img_sticky.visible, true, "cooling");
            check.equals(icon.img_sticky.name, "battle-actionbar-sticky-disabled", "cooling");
            check.same(icon.img_sticky.children.length, 4, "cooling");
        })

        test.case("displays currently targetting", check => {
            testgame.view.animations.setImmediate();

            let bar = testgame.view.action_bar;
            let ship = new Ship();
            TestTools.setShipAP(ship, 5);
            let action = nn(TestTools.addWeapon(ship, 50, 3).action);
            let icon = new ActionIcon(bar, ship, action, 0);
            check.same(icon.img_targetting.visible, false, "initial");

            icon.refresh(action);
            check.same(icon.img_targetting.visible, true, "selected");

            icon.refresh(new BaseAction("other"));
            check.same(icon.img_targetting.visible, false, "other");
        })
    });
}
