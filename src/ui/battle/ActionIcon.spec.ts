/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ActionIcon", test => {
        let testgame = setupBattleview(test);

        test.case("displays power usage", check => {
            let bar = testgame.view.action_bar;
            let ship = new Ship();
            let action = new BaseAction("something");
            let icon = new ActionIcon(bar, ship, action, 0);
            check.same(icon.power_bg.visible, false, "initial state");

            icon.refresh();
            check.same(icon.power_bg.visible, false, "no change");

            let cost = 3;
            check.patch(action, "getPowerUsage", () => cost);
            icon.refresh();
            check.in("power cost = 3", check => {
                check.equals(icon.power_bg.visible, true);
                check.equals(icon.power_text.text, "3\n-");
            });
            cost = -2;
            icon.refresh();
            check.in("power cost = -2", check => {
                check.equals(icon.power_bg.visible, true);
                check.equals(icon.power_text.text, "2\n+");
            });
        })

        test.case("displays disabled and fading states", check => {
            let bar = testgame.view.action_bar;
            let ship = new Ship();
            TestTools.setShipModel(ship, 100, 0, 5);
            let action = TestTools.addWeapon(ship, 50, 3);
            let icon = new ActionIcon(bar, ship, action, 0);

            check.equals(icon.container.name, "battle-actionbar-frame-enabled", "5/5");
            check.equals(icon.power_bg.name, "battle-actionbar-consumption-enabled", "5/5");
            check.same(icon.power_bg.visible, true, "5/5");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-enabled", "5/5");

            icon.refresh(null, 1);
            check.equals(icon.container.name, "battle-actionbar-frame-enabled", "4/5");
            check.equals(icon.power_bg.name, "battle-actionbar-consumption-enabled", "4/5");
            check.same(icon.power_bg.visible, true, "4/5");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-enabled", "4/5");

            icon.refresh(null, 4);
            check.equals(icon.container.name, "battle-actionbar-frame-fading", "1/5");
            check.equals(icon.power_bg.name, "battle-actionbar-consumption-enabled", "1/5");
            check.same(icon.power_bg.visible, true, "1/5");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-enabled", "1/5");

            ship.setValue("power", 2);
            icon.refresh();
            check.equals(icon.container.name, "battle-actionbar-frame-disabled", "2/2");
            check.equals(icon.power_bg.name, "battle-actionbar-consumption-disabled", "2/2");
            check.same(icon.power_bg.visible, true, "2/2");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-disabled", "2/2");

            icon.refresh(null, 6);
            check.equals(icon.container.name, "battle-actionbar-frame-disabled", "0/2");
            check.equals(icon.power_bg.name, "battle-actionbar-consumption-disabled", "0/2");
            check.same(icon.power_bg.visible, true, "0/2");
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-disabled", "0/2");
        })

        test.case("displays toggle state", check => {
            let bar = testgame.view.action_bar;
            let ship = new Ship();
            TestTools.setShipModel(ship, 100, 0, 5);
            let action = new ToggleAction("toggle", { power: 2 });
            ship.actions.addCustom(action);
            let icon = new ActionIcon(bar, ship, action, 0);

            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-enabled", "initial");
            check.equals(icon.power_bg.name, "battle-actionbar-consumption-enabled", "initial");
            check.equals(icon.img_cooldown.name, "battle-actionbar-sticky-untoggled", "initial");
            check.same(icon.img_cooldown.visible, true, "initial");

            ship.actions.toggle(action, true);
            icon.refresh();
            check.equals(icon.img_bottom.name, "battle-actionbar-bottom-toggled", "initial");
            check.equals(icon.power_bg.name, "battle-actionbar-consumption-toggled", "initial");
            check.equals(icon.img_cooldown.name, "battle-actionbar-sticky-toggled", "initial");
            check.same(icon.img_cooldown.visible, true, "initial");
        })

        test.case("displays overheat/cooldown", check => {
            let bar = testgame.view.action_bar;
            let ship = new Ship();
            let action = new TriggerAction("weapon");

            action.configureCooldown(1, 3);
            TestTools.setShipModel(ship, 100, 0, 5, 1, [action]);
            let icon = new ActionIcon(bar, ship, action, 0);
            check.same(icon.img_cooldown.visible, false, "initial");
            check.equals(icon.img_cooldown.name, "battle-actionbar-sticky-untoggled", "initial");
            check.same(icon.img_cooldown_group.length, 1, "initial");

            icon.refresh(action);
            check.same(icon.img_cooldown.visible, true, "overheat");
            check.equals(icon.img_cooldown.name, "battle-actionbar-sticky-overheat", "overheat");
            check.same(icon.img_cooldown_group.length, 4, "overheat");

            action.configureCooldown(1, 12);
            TestTools.setShipModel(ship, 100, 0, 5, 1, [action]);
            icon.refresh(action);
            check.same(icon.img_cooldown.visible, true, "superheat");
            check.equals(icon.img_cooldown.name, "battle-actionbar-sticky-overheat", "superheat");
            check.same(icon.img_cooldown_group.length, 6, "superheat");

            action.configureCooldown(1, 4);
            TestTools.setShipModel(ship, 100, 0, 5, 1, [action]);
            ship.actions.getCooldown(action).use();
            icon.refresh(action);
            check.same(icon.img_cooldown.visible, true, "cooling");
            check.equals(icon.img_cooldown.name, "battle-actionbar-sticky-disabled", "cooling");
            check.same(icon.img_cooldown_group.length, 5, "cooling");
        })

        test.case("displays currently targetting", check => {
            testgame.view.animations.setImmediate();

            let bar = testgame.view.action_bar;
            let ship = new Ship();
            TestTools.setShipModel(ship, 100, 0, 5);
            let action = TestTools.addWeapon(ship, 50, 3);
            let icon = new ActionIcon(bar, ship, action, 0);
            check.same(icon.img_targetting.visible, false, "initial");

            icon.refresh(action);
            check.same(icon.img_targetting.visible, true, "selected");

            icon.refresh(new BaseAction("other"));
            check.same(icon.img_targetting.visible, false, "other");
        })
    });
}
