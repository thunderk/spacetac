/// <reference path="../TestGame.ts"/>

module TS.SpaceTac.UI.Specs {
    describe("BattleView", function () {
        let testgame = setupBattleview();

        it("forwards events in targetting mode", function () {
            let battleview = testgame.battleview;
            expect(battleview.targetting).toBeNull();

            battleview.cursorInSpace(5, 5);

            expect(battleview.targetting).toBeNull();

            // Enter targetting mode
            var result = nn(battleview.enterTargettingMode());

            expect(battleview.targetting).toBeTruthy();
            expect(result).toBe(nn(battleview.targetting));

            // Collect targetting events
            var hovered: (Target | null)[] = [];
            var clicked: Target[] = [];
            result.targetHovered.add((target: Target) => {
                hovered.push(target);
            });
            result.targetSelected.add((target: Target) => {
                clicked.push(target);
            });

            // Forward selection in space
            battleview.cursorInSpace(8, 4);

            expect(battleview.ship_hovered).toBeNull();
            expect(nn(battleview.targetting).target_corrected).toEqual(Target.newFromLocation(8, 4));

            // Process a click on space
            battleview.cursorClicked();

            // Forward ship hovering
            battleview.cursorOnShip(battleview.battle.play_order[0]);

            expect(battleview.ship_hovered).toEqual(battleview.battle.play_order[0]);
            expect(nn(battleview.targetting).target_corrected).toEqual(Target.newFromShip(battleview.battle.play_order[0]));

            // Don't leave a ship we're not hovering
            battleview.cursorOffShip(battleview.battle.play_order[1]);

            expect(battleview.ship_hovered).toEqual(battleview.battle.play_order[0]);
            expect(nn(battleview.targetting).target_corrected).toEqual(Target.newFromShip(battleview.battle.play_order[0]));

            // Don't move in space while on ship
            battleview.cursorInSpace(1, 3);

            expect(battleview.ship_hovered).toEqual(battleview.battle.play_order[0]);
            expect(nn(battleview.targetting).target_corrected).toEqual(Target.newFromShip(battleview.battle.play_order[0]));

            // Process a click on ship
            battleview.cursorClicked();

            // Leave the ship
            battleview.cursorOffShip(battleview.battle.play_order[0]);

            expect(battleview.ship_hovered).toBeNull();
            expect(nn(battleview.targetting).target_corrected).toBeNull();

            // Quit targetting
            battleview.exitTargettingMode();

            expect(battleview.targetting).toBeNull();

            // Events process normally
            battleview.cursorInSpace(8, 4);
            expect(battleview.ship_hovered).toBeNull();
            battleview.cursorOnShip(battleview.battle.play_order[0]);
            expect(battleview.ship_hovered).toEqual(battleview.battle.play_order[0]);

            // Quit twice don't do anything
            battleview.exitTargettingMode();

            // Check collected targetting events
            expect(hovered).toEqual([
                Target.newFromLocation(8, 4),
                Target.newFromShip(battleview.battle.play_order[0]),
                null
            ]);
            expect(clicked).toEqual([
                Target.newFromLocation(8, 4),
                Target.newFromShip(battleview.battle.play_order[0]),
            ]);
        });
    });
}
