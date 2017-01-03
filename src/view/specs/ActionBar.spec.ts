/// <reference path="TestGame.ts"/>

module SpaceTac.View.Specs {
    describe("ActionBar", () => {
        inbattleview_it("lists available actions for selected ship", (battleview: BattleView) => {
            var bar = battleview.action_bar;

            // Ship not owned by current battleview player
            var ship = new Game.Ship();
            bar.setShip(ship);
            expect(bar.actions.length).toBe(0);

            // Ship with no equipment (only endturn action)
            battleview.player = ship.getPlayer();
            bar.setShip(ship);
            expect(bar.actions.length).toBe(1);
            expect(bar.actions[0].action.code).toEqual("endturn");

            // Add an engine, with move action
            ship.addSlot(Game.SlotType.Engine).attach((new Game.Equipments.ConventionalEngine()).generate());
            bar.setShip(ship);
            expect(bar.actions.length).toBe(2);
            expect(bar.actions[0].action.code).toEqual("move");

            // Add a weapon, with fire action
            ship.addSlot(Game.SlotType.Weapon).attach((new Game.Equipments.GatlingGun()).generate());
            bar.setShip(ship);
            expect(bar.actions.length).toBe(3);
            expect(bar.actions[1].action.code).toEqual("fire-gatlinggun");
        });

        inbattleview_it("mark actions that would become unavailable after use", (battleview: BattleView) => {
            var bar = battleview.action_bar;
            var ship = new Game.Ship();
            ship.arena_x = 1;
            ship.arena_y = 8;
            var engine = (new Game.Equipments.ConventionalEngine()).generate();
            engine.ap_usage = 8;
            engine.distance = 4;
            ship.addSlot(Game.SlotType.Engine).attach(engine);
            var weapon1 = (new Game.Equipments.GatlingGun()).generate();
            weapon1.ap_usage = 3;
            ship.addSlot(Game.SlotType.Weapon).attach(weapon1);
            var weapon2 = (new Game.Equipments.GatlingGun()).generate();
            weapon2.ap_usage = 5;
            ship.addSlot(Game.SlotType.Weapon).attach(weapon2);
            battleview.battle.playing_ship = ship;
            battleview.player = ship.getPlayer();

            ship.ap_current.setMaximal(10);
            ship.ap_current.set(9);
            bar.setShip(ship);

            expect(bar.actions.length).toBe(4);

            var checkFading = (fading: number[], available: number[]) => {
                fading.forEach((index: number) => {
                    var icon = bar.actions[index];
                    expect(icon.fading).toBe(true);
                });
                available.forEach((index: number) => {
                    var icon = bar.actions[index];
                    expect(icon.fading).toBe(false);
                });
            };

            // Weapon 1 leaves all choices open
            bar.actions[1].processClick();
            checkFading([], [0, 1, 2, 3]);

            // Weapon 2 can't be fired twice
            bar.actions[2].processClick();
            checkFading([2], [0, 1, 3]);

            // Not enough AP for both weapons
            ship.ap_current.set(7);
            bar.actions[2].processClick();
            checkFading([1, 2], [0, 3]);

            // Not enough AP to move
            ship.ap_current.set(3);
            bar.actions[1].processClick();
            checkFading([0, 1, 2], [3]);

            // Dynamic AP usage for move actions
            ship.ap_current.set(6);
            bar.actions[0].processClick();
            checkFading([], [0, 1, 2, 3]);
            bar.actions[0].processHover(Game.Target.newFromLocation(2, 8));
            checkFading([2], [0, 1, 3]);
            bar.actions[0].processHover(Game.Target.newFromLocation(3, 8));
            checkFading([1, 2], [0, 3]);
            bar.actions[0].processHover(Game.Target.newFromLocation(4, 8));
            checkFading([0, 1, 2], [3]);
            bar.actions[0].processHover(Game.Target.newFromLocation(5, 8));
            checkFading([0, 1, 2], [3]);
        });
    });
}
