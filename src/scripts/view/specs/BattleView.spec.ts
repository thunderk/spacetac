/// <reference path="../../definitions/jasmine.d.ts"/>
/// <reference path="TestGame.ts"/>
/// <reference path="../battle/BattleView.ts"/>

module SpaceTac.View.Specs {
    "use strict";

    describe("BattleView", () => {
        inbattleview_it("forwards events in targetting mode", (battleview: BattleView) => {
            expect(battleview.targetting).toBeNull();

            battleview.cursorInSpace(5, 5);

            expect(battleview.targetting).toBeNull();

            // Enter targetting mode
            var result = battleview.enterTargettingMode();

            expect(battleview.targetting).toBeTruthy();
            expect(result).toBe(battleview.targetting);

            // Collect targetting events
            var hovered: Game.Target[] = [];
            var clicked: Game.Target[] = [];
            result.targetHovered.add((target: Game.Target) => {
                hovered.push(target);
            });
            result.targetSelected.add((target: Game.Target) => {
                clicked.push(target);
            });

            // Forward selection in space
            battleview.cursorInSpace(8, 4);

            expect(battleview.ship_hovered).toBeNull();
            expect(battleview.targetting.target).toEqual(Game.Target.newFromLocation(8, 4));

            // Process a click on space
            battleview.cursorClicked();

            // Forward ship hovering
            battleview.cursorOnShip(battleview.battle.play_order[0]);

            expect(battleview.ship_hovered).toEqual(battleview.battle.playing_ship);
            expect(battleview.targetting.target).toEqual(Game.Target.newFromShip(battleview.battle.playing_ship));

            // Don't leave a ship we're not hovering
            battleview.cursorOffShip(battleview.battle.play_order[1]);

            expect(battleview.ship_hovered).toEqual(battleview.battle.playing_ship);
            expect(battleview.targetting.target).toEqual(Game.Target.newFromShip(battleview.battle.playing_ship));

            // Don't move in space while on ship
            battleview.cursorInSpace(1, 3);

            expect(battleview.ship_hovered).toEqual(battleview.battle.playing_ship);
            expect(battleview.targetting.target).toEqual(Game.Target.newFromShip(battleview.battle.playing_ship));

            // Process a click on ship
            battleview.cursorClicked();

            // Leave the ship
            battleview.cursorOffShip(battleview.battle.play_order[0]);

            expect(battleview.ship_hovered).toBeNull();
            expect(battleview.targetting.target).toBeNull();

            // Quit targetting
            battleview.exitTargettingMode();

            expect(battleview.targetting).toBeNull();

            // Events process normally
            battleview.cursorInSpace(8, 4);
            expect(battleview.ship_hovered).toBeNull();
            battleview.cursorOnShip(battleview.battle.play_order[0]);
            expect(battleview.ship_hovered).toEqual(battleview.battle.playing_ship);

            // Quit twice don't do anything
            battleview.exitTargettingMode();

            // Check collected targetting events
            expect(hovered).toEqual([
                Game.Target.newFromLocation(8, 4),
                Game.Target.newFromShip(battleview.battle.playing_ship),
                null
            ]);
            expect(clicked).toEqual([
                Game.Target.newFromLocation(8, 4),
                Game.Target.newFromShip(battleview.battle.playing_ship),
            ]);
        });
    });
}
