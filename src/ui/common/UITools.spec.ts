module TK.SpaceTac.UI.Specs {
    testing("UITools", test => {
        testing("in UI", test => {
            let testgame = setupEmptyView(test);

            test.case("destroys children", check => {
                let builder = new UIBuilder(testgame.view);
                let parent = builder.container("group");
                let child1 = builder.in(parent).graphics("graphics");
                let child2 = builder.in(parent).image("image");
                let child3 = builder.in(parent).button("button");
                let child4 = builder.in(parent).text("");
                check.equals(parent.length, 4);

                destroyChildren(parent, 1, 2);
                check.equals(parent.length, 2);

                destroyChildren(parent);
                check.equals(parent.length, 0);
            });

            /*test.case("gets the screen boundaries of an object", check => {
                let builder = new UIBuilder(testgame.view);
                let parent = builder.group("group");

                check.in("empty", check => {
                    check.containing(UITools.getBounds(parent), { x: 0, y: 0, width: 0, height: 0 }, "parent");
                });

                let child1 = builder.in(parent).graphics("child1");
                child1.setPosition(10, 20);

                check.in("empty child", check => {
                    check.containing(UITools.getBounds(parent), { x: 0, y: 0, width: 0, height: 0 }, "parent");
                    check.containing(UITools.getBounds(child1), { x: 0, y: 0, width: 0, height: 0 }, "child1");
                });

                child1.addRectangle({ x: 20, y: 30, width: 40, height: 45 }, 0);

                check.in("rectangle child", check => {
                    check.containing(UITools.getBounds(parent), { x: 30, y: 50, width: 40, height: 45 }, "parent");
                    check.containing(UITools.getBounds(child1), { x: 30, y: 50, width: 40, height: 45 }, "child1");
                });

                child1.setScale(0.5, 0.2);

                check.in("scaled child", check => {
                    check.containing(UITools.getBounds(parent), { x: 20, y: 26, width: 20, height: 9 }, "parent");
                    check.containing(UITools.getBounds(child1), { x: 20, y: 26, width: 20, height: 9 }, "child1");
                });

                let child2 = testgame.view.add.graphics(-4, -15);
                child1.addChild(child2);

                check.in("sub child empty", check => {
                    check.containing(UITools.getBounds(parent), { x: 20, y: 26, width: 20, height: 9 }, "parent");
                    check.containing(UITools.getBounds(child1), { x: 20, y: 26, width: 20, height: 9 }, "child1");
                    check.containing(UITools.getBounds(child2), { x: 0, y: 0, width: 0, height: 0 }, "child2");
                });

                child2.drawRect(0, 0, 10, 5);

                check.in("sub child rectangle", check => {
                    check.containing(UITools.getBounds(parent), { x: 8, y: 17, width: 32, height: 18 }, "parent");
                    check.containing(UITools.getBounds(child1), { x: 8, y: 17, width: 32, height: 18 }, "child1");
                    check.containing(UITools.getBounds(child2), { x: 8, y: 17, width: 5, height: 1 }, "child2");
                });

                let child3 = testgame.view.add.graphics(50, 51, parent);

                check.in("second child empty", check => {
                    check.containing(UITools.getBounds(parent), { x: 8, y: 17, width: 42, height: 34 }, "parent");
                    check.containing(UITools.getBounds(child1), { x: 8, y: 17, width: 32, height: 18 }, "child1");
                    check.containing(UITools.getBounds(child2), { x: 8, y: 17, width: 5, height: 1 }, "child2");
                    check.containing(UITools.getBounds(child3), { x: 0, y: 0, width: 0, height: 0 }, "child3");
                });

                child3.drawRect(1, 1, 1, 1);

                check.in("second child pixel", check => {
                    check.containing(UITools.getBounds(parent), { x: 8, y: 17, width: 44, height: 36 }, "parent");
                    check.containing(UITools.getBounds(child1), { x: 8, y: 17, width: 32, height: 18 }, "child1");
                    check.containing(UITools.getBounds(child2), { x: 8, y: 17, width: 5, height: 1 }, "child2");
                    check.containing(UITools.getBounds(child3), { x: 51, y: 52, width: 1, height: 1 }, "child3");
                });
            });

            test.case("keeps objects inside bounds", check => {
                let builder = new UIBuilder(testgame.view);
                let image = builder.graphics("test", 150, 100, true);
                image.beginFill(0xff0000);
                image.drawEllipse(50, 25, 50, 25);
                image.endFill();

                UITools.keepInside(image, { x: 0, y: 0, width: 200, height: 200 });

                check.equals(image.x, 100);
                check.equals(image.y, 100);
            });

            test.case("draws a rectangle background around content", check => {
                let group = testgame.view.add.group();

                let content = testgame.view.add.graphics(0, 0, group);
                content.drawRect(120, 90, 30, 20);

                let background = testgame.view.add.graphics(0, 0);

                let result = UITools.drawBackground(group, background, 3);
                check.equals(result, [36, 26]);

                content.drawCircle(0, 0, 50);
                result = UITools.drawBackground(group, background, 3);
                check.equals(result, [181, 141]);
            });*/
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
