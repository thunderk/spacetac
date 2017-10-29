module TK.SpaceTac.UI.Specs {
    testing("Animations", test => {
        let testgame = setupEmptyView(test);

        test.case("shows and hides objects", check => {
            let obj = { visible: false, alpha: 0.5 };

            check.equals(testgame.view.animations.simulate(obj, 'alpha'), []);

            testgame.view.animations.show(obj);

            check.equals(obj.visible, true);
            check.equals(obj.alpha, 0);
            check.equals(testgame.view.animations.simulate(obj, 'alpha'), [0, 0.25, 0.5, 0.75, 1]);

            obj.alpha = 1;
            testgame.view.animations.hide(obj);

            check.equals(obj.visible, true);
            check.equals(obj.alpha, 1);
            check.equals(testgame.view.animations.simulate(obj, 'alpha'), [1, 0.75, 0.5, 0.25, 0]);

            obj.alpha = 0.2;
            testgame.view.animations.setVisible(obj, true, 1000, 0.6);

            check.equals(obj.visible, true);
            check.equals(obj.alpha, 0.2);
            check.equals(testgame.view.animations.simulate(obj, 'alpha'), [0.2, 0.3, 0.4, 0.5, 0.6]);

            obj.alpha = 0.6;
            testgame.view.animations.setVisible(obj, false, 1000, 0.6, 0.2);

            check.equals(obj.visible, true);
            check.equals(obj.alpha, 0.6);
            check.equals(testgame.view.animations.simulate(obj, 'alpha'), [0.6, 0.5, 0.4, 0.3, 0.2]);
        });

        test.case("blocks input while object is hidden", check => {
            let changeStateFrame = check.mockfunc("changeStateFrame");
            let obj = { visible: true, alpha: 1, input: { enabled: true }, changeStateFrame: changeStateFrame.func, freezeFrames: false };

            testgame.view.animations.setVisible(obj, false, 0);
            check.equals(obj.visible, false);
            check.equals(obj.alpha, 0);
            check.equals(obj.input.enabled, false);
            check.called(changeStateFrame, [["Out"]])
            check.equals(obj.freezeFrames, true);

            testgame.view.animations.setVisible(obj, true, 0);
            check.equals(obj.visible, true);
            check.equals(obj.alpha, 1);
            check.equals(obj.input.enabled, true);
            check.called(changeStateFrame, 0);
            check.equals(obj.freezeFrames, false);
        });

        test.case("animates rotation", check => {
            let obj = { rotation: -Math.PI * 2.5 };
            let tween = testgame.ui.tweens.create(obj);
            let result = Animations.rotationTween(tween, Math.PI * 0.25, 1, Phaser.Easing.Linear.None);
            check.equals(result, 750);
            check.equals(tween.generateData(4), [
                { rotation: -Math.PI * 0.25 },
                { rotation: 0 },
                { rotation: Math.PI * 0.25 },
            ]);
        });
    });
}
