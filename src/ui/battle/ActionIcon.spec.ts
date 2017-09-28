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

            expect(icon.img_power.name).toBe("battle-actionbar-consumption-enabled", "5/5");
            expect(icon.img_power.visible).toBe(true, "5/5");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-enabled", "5/5");

            icon.refresh(null, 1);
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-enabled", "4/5");
            expect(icon.img_power.visible).toBe(true, "4/5");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-enabled", "4/5");

            icon.refresh(null, 4);
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-fading", "1/5");
            expect(icon.img_power.visible).toBe(true, "1/5");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-enabled", "1/5");

            ship.setValue("power", 2);
            icon.refresh();
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-disabled", "2/2");
            expect(icon.img_power.visible).toBe(true, "2/2");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-disabled", "2/2");

            icon.refresh(null, 6);
            expect(icon.img_power.name).toBe("battle-actionbar-consumption-disabled", "0/2");
            expect(icon.img_power.visible).toBe(true, "0/2");
            expect(icon.img_bottom.name).toBe("battle-actionbar-bottom-disabled", "0/2");
        })

        it("displays toggle state", function () {

        })

        it("displays overheat/cooldown", function () {

        })

        it("displays currently targetting", function () {

        })
    });
}
