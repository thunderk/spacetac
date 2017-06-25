module TS.SpaceTac.UI.Specs {
    describe("Animations", () => {
        let testgame = setupEmptyView();

        it("shows and hides objects", function () {
            let obj = { visible: false, alpha: 0.5 };

            expect(testgame.baseview.animations.simulate(obj, 'alpha')).toEqual([]);

            testgame.baseview.animations.show(obj);

            expect(obj.visible).toBe(true);
            expect(obj.alpha).toBe(0);
            expect(testgame.baseview.animations.simulate(obj, 'alpha')).toEqual([0, 0.25, 0.5, 0.75, 1]);

            obj.alpha = 1;
            testgame.baseview.animations.hide(obj);

            expect(obj.visible).toBe(true);
            expect(obj.alpha).toBe(1);
            expect(testgame.baseview.animations.simulate(obj, 'alpha')).toEqual([1, 0.75, 0.5, 0.25, 0]);

            obj.alpha = 0.2;
            testgame.baseview.animations.setVisible(obj, true, 1000, 0.6);

            expect(obj.visible).toBe(true);
            expect(obj.alpha).toBe(0.2);
            expect(testgame.baseview.animations.simulate(obj, 'alpha')).toEqual([0.2, 0.3, 0.4, 0.5, 0.6]);

            obj.alpha = 0.6;
            testgame.baseview.animations.setVisible(obj, false, 1000, 0.6, 0.2);

            expect(obj.visible).toBe(true);
            expect(obj.alpha).toBe(0.6);
            expect(testgame.baseview.animations.simulate(obj, 'alpha')).toEqual([0.6, 0.5, 0.4, 0.3, 0.2]);
        });

        it("blocks input while object is hidden", function () {
            let obj = { visible: true, alpha: 1, input: { enabled: true }, changeStateFrame: jasmine.createSpy("changeStateFrame"), freezeFrames: false };

            testgame.baseview.animations.setVisible(obj, false, 0);
            expect(obj.visible).toBe(false);
            expect(obj.alpha).toBe(0);
            expect(obj.input.enabled).toBe(false);
            expect(obj.changeStateFrame).toHaveBeenCalledWith("Out");
            expect(obj.freezeFrames).toBe(true);

            testgame.baseview.animations.setVisible(obj, true, 0);
            expect(obj.visible).toBe(true);
            expect(obj.alpha).toBe(1);
            expect(obj.input.enabled).toBe(true);
            expect(obj.changeStateFrame).toHaveBeenCalledTimes(1);
            expect(obj.freezeFrames).toBe(false);
        });

        it("animates rotation", function () {
            let obj = { rotation: -Math.PI * 2.5 };
            let tween = testgame.ui.tweens.create(obj);
            let result = Animations.rotationTween(tween, Math.PI * 0.25, 1, Phaser.Easing.Linear.None);
            expect(result).toEqual(750);
            expect(tween.generateData(4)).toEqual([
                { rotation: -Math.PI * 0.25 },
                { rotation: 0 },
                { rotation: Math.PI * 0.25 },
            ]);
        });
    });
}
