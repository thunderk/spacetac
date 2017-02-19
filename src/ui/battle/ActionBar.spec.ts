/// <reference path="../TestGame.ts"/>

module TS.SpaceTac.UI.Specs {
    describe("ActionBar", () => {
        inbattleview_it("lists available actions for selected ship", (battleview: BattleView) => {
            var bar = battleview.action_bar;

            // Ship not owned by current battleview player
            var ship = new Ship();
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(0);

            // Ship with no equipment (only endturn action)
            battleview.player = ship.getPlayer();
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(1);
            expect(bar.action_icons[0].action.code).toEqual("endturn");

            // Add an engine, with move action
            ship.addSlot(SlotType.Engine).attach((new Equipments.ConventionalEngine()).generate());
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(2);
            expect(bar.action_icons[0].action.code).toEqual("move");

            // Add a weapon, with fire action
            ship.addSlot(SlotType.Weapon).attach((new Equipments.GatlingGun()).generate());
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(3);
            expect(bar.action_icons[1].action.code).toEqual("fire-gatlinggun");
        });

        inbattleview_it("mark actions that would become unavailable after use", (battleview: BattleView) => {
            var bar = battleview.action_bar;
            var ship = new Ship();
            ship.arena_x = 1;
            ship.arena_y = 8;
            var engine = (new Equipments.ConventionalEngine()).generate();
            engine.ap_usage = 8;
            engine.distance = 4;
            ship.addSlot(SlotType.Engine).attach(engine);
            var weapon1 = (new Equipments.GatlingGun()).generate();
            weapon1.ap_usage = 3;
            ship.addSlot(SlotType.Weapon).attach(weapon1);
            var weapon2 = (new Equipments.GatlingGun()).generate();
            weapon2.ap_usage = 5;
            ship.addSlot(SlotType.Weapon).attach(weapon2);
            battleview.battle.playing_ship = ship;
            battleview.player = ship.getPlayer();

            ship.setAttribute("power_capacity", 10);
            ship.setValue("power", 9);
            bar.setShip(ship);

            expect(bar.action_icons.length).toBe(4);

            var checkFading = (fading: number[], available: number[]) => {
                fading.forEach((index: number) => {
                    var icon = bar.action_icons[index];
                    expect(icon.fading || !icon.active).toBe(true);
                });
                available.forEach((index: number) => {
                    var icon = bar.action_icons[index];
                    expect(icon.fading).toBe(false);
                });
            };

            // Weapon 1 leaves all choices open
            bar.action_icons[1].processClick();
            checkFading([], [0, 1, 2, 3]);
            bar.actionEnded();

            // Weapon 2 can't be fired twice
            bar.action_icons[2].processClick();
            checkFading([2], [0, 1, 3]);
            bar.actionEnded();

            // Not enough AP for both weapons
            ship.setValue("power", 7);
            bar.action_icons[2].processClick();
            checkFading([1, 2], [0, 3]);
            bar.actionEnded();

            // Not enough AP to move
            ship.setValue("power", 3);
            bar.action_icons[1].processClick();
            checkFading([0, 1, 2], [3]);
            bar.actionEnded();

            // Dynamic AP usage for move actions
            ship.setValue("power", 6);
            bar.action_icons[0].processClick();
            checkFading([], [0, 1, 2, 3]);
            bar.action_icons[0].processHover(Target.newFromLocation(2, 8));
            checkFading([2], [0, 1, 3]);
            bar.action_icons[0].processHover(Target.newFromLocation(3, 8));
            checkFading([1, 2], [0, 3]);
            bar.action_icons[0].processHover(Target.newFromLocation(4, 8));
            checkFading([0, 1, 2], [3]);
            bar.action_icons[0].processHover(Target.newFromLocation(5, 8));
            checkFading([0, 1, 2], [3]);
            bar.actionEnded();
        });

        inbattleview_it("updates power points display", battleview => {
            let bar = battleview.action_bar;

            function check(available = 0, using = 0, used = 0) {
                expect(bar.power.children.length).toBe(available + using + used);
                bar.power.children.forEach((child, idx) => {
                    let img = <Phaser.Image>child;
                    if (idx < available) {
                        expect(img.name).toEqual("battle-power-available");
                    } else if (idx < available + using) {
                        expect(img.name).toEqual("battle-power-using");
                    } else {
                        expect(img.name).toEqual("battle-power-used");
                    }
                });
            }

            // not owned ship
            let ship = new Ship();
            TestTools.setShipAP(ship, 8);
            bar.setShip(ship);
            check();

            // owned ship
            ship.fleet = battleview.player.fleet;
            bar.setShip(ship);
            check(8);

            // used points
            ship.setValue("power", 6);
            check(6, 0, 2);

            // using points
            bar.updatePower(5);
            check(1, 5, 2);

            // decrease
            ship.setAttribute("power_capacity", 3);
            check(3);
        });
    });
}
