module SpaceTac.View.Specs {
    describe("Targetting", () => {
        it("broadcasts hovering and selection events", () => {
            var targetting = new Targetting(null);

            var hovered: Game.Target[] = [];
            var selected: Game.Target[] = [];
            targetting.targetHovered.add((target: Game.Target) => {
                hovered.push(target);
            });
            targetting.targetSelected.add((target: Game.Target) => {
                selected.push(target);
            });

            targetting.setTargetSpace(1, 2);
            expect(hovered).toEqual([Game.Target.newFromLocation(1, 2)]);
            expect(selected).toEqual([]);

            targetting.validate();
            expect(hovered).toEqual([Game.Target.newFromLocation(1, 2)]);
            expect(selected).toEqual([Game.Target.newFromLocation(1, 2)]);
        });

        inbattleview_it("displays action point indicators", (battleview) => {
            let source = new Phaser.Group(battleview.game, battleview.arena);
            source.position.set(0, 0);

            let init_children = battleview.arena.children.length;

            let targetting = new Targetting(battleview);

            targetting.setSource(source);
            targetting.setTargetSpace(200, 100);
            targetting.update();
            targetting.updateApIndicators();

            expect(targetting.ap_indicators.length).toBe(0);
            expect(battleview.arena.children.length).toBe(init_children + 3);

            targetting.setApIndicatorsInterval(Math.sqrt(5) * 20);

            expect(targetting.ap_indicators.length).toBe(5);
            expect(battleview.arena.children.length).toBe(init_children + 3 + 5);
            expect(targetting.ap_indicators[0].position.x).toBe(0);
            expect(targetting.ap_indicators[0].position.y).toBe(0);
            expect(targetting.ap_indicators[1].position.x).toBeCloseTo(40);
            expect(targetting.ap_indicators[1].position.y).toBeCloseTo(20);
            expect(targetting.ap_indicators[2].position.x).toBeCloseTo(80);
            expect(targetting.ap_indicators[2].position.y).toBeCloseTo(40);
            expect(targetting.ap_indicators[3].position.x).toBeCloseTo(120);
            expect(targetting.ap_indicators[3].position.y).toBeCloseTo(60);
            expect(targetting.ap_indicators[4].position.x).toBeCloseTo(160);
            expect(targetting.ap_indicators[4].position.y).toBeCloseTo(80);

            targetting.setApIndicatorsInterval(1000);
            expect(targetting.ap_indicators.length).toBe(1);
            expect(battleview.arena.children.length).toBe(init_children + 3 + 1);

            targetting.setApIndicatorsInterval(1);
            expect(targetting.ap_indicators.length).toBe(224);
            expect(battleview.arena.children.length).toBe(init_children + 3 + 224);

            targetting.destroy();

            expect(battleview.arena.children.length).toBe(init_children);
        });
    });
}
