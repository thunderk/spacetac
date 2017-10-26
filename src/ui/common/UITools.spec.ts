module TK.SpaceTac.UI.Specs {
    testing("UITools", test => {
        testing("in UI", test => {
            let testgame = setupEmptyView();

            test.case("destroys children", check => {
                let parent = testgame.view.add.group();
                let child1 = testgame.view.add.graphics(0, 0, parent);
                let child2 = testgame.view.add.image(0, 0, "", 0, parent);
                let child3 = testgame.view.add.button(0, 0, "", undefined, undefined, undefined, undefined, undefined, undefined, parent);
                let child4 = testgame.view.add.text(0, 0, "", {}, parent);
                check.equals(parent.children.length, 4);

                destroyChildren(parent, 1, 2);
                check.equals(parent.children.length, 2);

                destroyChildren(parent);
                check.equals(parent.children.length, 0);
            });

            test.case("keeps objects inside bounds", check => {
                let image = testgame.view.add.graphics(150, 100);
                image.beginFill(0xff0000);
                image.drawEllipse(50, 25, 50, 25);
                image.endFill();

                UITools.keepInside(image, { x: 0, y: 0, width: 200, height: 200 });

                check.equals(image.x, 100);
                check.equals(image.y, 100);
            });
        });

        test.case("normalizes angles", check => {
            check.equals(UITools.normalizeAngle(0), 0);
            check.nears(UITools.normalizeAngle(0.1), 0.1);
            check.nears(UITools.normalizeAngle(Math.PI), Math.PI);
            check.nears(UITools.normalizeAngle(Math.PI + 0.5), -Math.PI + 0.5);
            check.nears(UITools.normalizeAngle(-Math.PI), Math.PI);
            check.nears(UITools.normalizeAngle(-Math.PI - 0.5), Math.PI - 0.5);
        });

        test.case("spaces items evenly", check => {
            check.equals(UITools.evenlySpace(100, 20, 0), []);
            check.equals(UITools.evenlySpace(100, 20, 1), [50]);
            check.equals(UITools.evenlySpace(100, 20, 2), [25, 75]);
            check.equals(UITools.evenlySpace(100, 20, 5), [10, 30, 50, 70, 90]);
            check.equals(UITools.evenlySpace(100, 20, 6), [10, 26, 42, 58, 74, 90]);
        });
    });
}
