/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    describe("ActionIcon", function () {
        let testgame = setupBattleview();

        it("displays power usage", function () {
            let bar = testgame.battleview.action_bar;
            let ship = new Ship();
            let action = new BaseAction("something", "Do something");
            let icon = new ActionIcon(bar, ship, action, 0);
            expect(icon.img_power.visible).toBe(false, "initial state");

            icon.refresh();
            expect(icon.img_power.visible).toBe(false, "no change");

            spyOn(action, "getActionPointsUsage").and.returnValue(3);
            icon.refresh();
            expect(icon.img_power.visible).toBe(true);
            expect(icon.text_power.text).toBe("3");
        })

        it("displays disabled and fading states", function () {
            let bar = testgame.battleview.action_bar;
            let ship = new Ship();
            TestTools.setShipAP(ship, 5);
            let action = nn(TestTools.addWeapon(ship, 50, 3).action);
            let icon = new ActionIcon(bar, ship, action, 0);

            expect(icon.container.name).toBe("battle-actionbar-frame-enabled", "5/5");
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-enabled", "5/5");
            expect(icon.img_power.visible).toBe(true, "5/5");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-enabled", "5/5");

            icon.refresh(null, 1);
            expect(icon.container.name).toBe("battle-actionbar-frame-enabled", "4/5");
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-enabled", "4/5");
            expect(icon.img_power.visible).toBe(true, "4/5");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-enabled", "4/5");

            icon.refresh(null, 4);
            expect(icon.container.name).toBe("battle-actionbar-frame-fading", "1/5");
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-enabled", "1/5");
            expect(icon.img_power.visible).toBe(true, "1/5");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-enabled", "1/5");

            ship.setValue("power", 2);
            icon.refresh();
            expect(icon.container.name).toBe("battle-actionbar-frame-disabled", "2/2");
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-disabled", "2/2");
            expect(icon.img_power.visible).toBe(true, "2/2");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-disabled", "2/2");

            icon.refresh(null, 6);
            expect(icon.container.name).toBe("battle-actionbar-frame-disabled", "0/2");
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-disabled", "0/2");
            expect(icon.img_power.visible).toBe(true, "0/2");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-disabled", "0/2");
        })

        it("displays toggle state", function () {
            let bar = testgame.battleview.action_bar;
            let ship = new Ship();
            TestTools.setShipAP(ship, 5);
            let equipment = new Equipment(SlotType.Weapon);
            ship.addSlot(SlotType.Weapon).attach(equipment);
            let action = new ToggleAction(equipment, 2);
            equipment.action = action;
            let icon = new ActionIcon(bar, ship, action, 0);

            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-enabled", "initial");
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-enabled", "initial");
            expect(icon.img_sticky.name).toBe("battle-actionbar-sticky-untoggled", "initial");
            expect(icon.img_sticky.visible).toBe(true, "initial");

            action.activated = true;
            icon.refresh();
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-toggled", "initial");
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-toggled", "initial");
            expect(icon.img_sticky.name).toBe("battle-actionbar-sticky-toggled", "initial");
            expect(icon.img_sticky.visible).toBe(true, "initial");
        })

        it("displays overheat/cooldown", function () {
            let bar = testgame.battleview.action_bar;
            let ship = new Ship();
            TestTools.setShipAP(ship, 5);
            let action = nn(TestTools.addWeapon(ship, 50, 3).action);
            action.cooldown.configure(1, 3);
            let icon = new ActionIcon(bar, ship, action, 0);
            expect(icon.img_sticky.visible).toBe(false, "initial");
            expect(icon.img_sticky.name).toBe("battle-actionbar-sticky-untoggled", "initial");
            expect(icon.img_sticky.children.length).toBe(0, "initial");

            icon.refresh(action);
            expect(icon.img_sticky.visible).toBe(true, "overheat");
            expect(icon.img_sticky.name).toBe("battle-actionbar-sticky-overheat", "overheat");
            expect(icon.img_sticky.children.length).toBe(3, "overheat");

            action.cooldown.configure(1, 12);
            icon.refresh(action);
            expect(icon.img_sticky.visible).toBe(true, "superheat");
            expect(icon.img_sticky.name).toBe("battle-actionbar-sticky-overheat", "superheat");
            expect(icon.img_sticky.children.length).toBe(5, "superheat");

            action.cooldown.configure(1, 4);
            action.cooldown.use();
            icon.refresh(action);
            expect(icon.img_sticky.visible).toBe(true, "cooling");
            expect(icon.img_sticky.name).toBe("battle-actionbar-sticky-disabled", "cooling");
            expect(icon.img_sticky.children.length).toBe(4, "cooling");
        })

        it("displays currently targetting", function () {
            testgame.battleview.animations.setImmediate();

            let bar = testgame.battleview.action_bar;
            let ship = new Ship();
            TestTools.setShipAP(ship, 5);
            let action = nn(TestTools.addWeapon(ship, 50, 3).action);
            let icon = new ActionIcon(bar, ship, action, 0);
            expect(icon.img_targetting.visible).toBe(false, "initial");

            icon.refresh(action);
            expect(icon.img_targetting.visible).toBe(true, "selected");

            icon.refresh(new BaseAction("other", "Other action"));
            expect(icon.img_targetting.visible).toBe(false, "other");
        })
    });
}
