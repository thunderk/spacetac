module TS.SpaceTac.UI.Specs {
    describe("Animation", () => {
        let testgame = setupEmptyView();

        it("animates rotation", function () {
            let obj = { rotation: -Math.PI * 2.5 };
            let tween = testgame.ui.tweens.create(obj);
            let result = Animation.rotationTween(tween, Math.PI * 0.25, 1, Phaser.Easing.Linear.None);
            expect(result).toEqual(750);
            expect(tween.generateData(4)).toEqual([
                { rotation: -Math.PI * 0.25 },
                { rotation: 0 },
                { rotation: Math.PI * 0.25 },
            ]);
        });
    });
}
