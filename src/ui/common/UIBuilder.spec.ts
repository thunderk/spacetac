module TK.SpaceTac.UI.Specs {
    testing("UIBuilder", test => {
        let testgame = setupEmptyView(test);

        function get(path: (number | string)[]): [string, any] {
            let spath = `[${path.join(" -> ")}]`;
            let component: any = testgame.view.world;
            path.forEach(idx => {
                component = (typeof idx == "number") ? component.children[idx] : component.getByName(idx);
                if (!component) {
                    throw new Error(`Path not found: ${spath}`);
                }
            });
            return [spath, component];
        }

        function checkcomp(path: (number | string)[], ctype?: any, name?: string, attrs?: any): any {
            let [spath, component] = get(path);

            if (typeof ctype != "undefined") {
                test.check.same(component instanceof ctype, true, `${spath} is not of good type`);
            }
            if (typeof name != "undefined") {
                test.check.equals(component.name, name, spath);
            }
            if (typeof attrs != "undefined") {
                iteritems(attrs, (key, value) => {
                    test.check.equals(component[key], value, spath);
                });
            }

            return component;
        }

        test.case("can work on view layers", check => {
            let builder = new UIBuilder(testgame.view, "tl1");
            builder.group("tg1");
            checkcomp(["View layers", "tl1", 0], Phaser.Group, "tg1");

            builder = new UIBuilder(testgame.view, "tl2");
            builder.group("tg2");
            checkcomp(["View layers", "tl2", 0], Phaser.Group, "tg2");

            builder = new UIBuilder(testgame.view, "tl1");
            builder.group("tg3");
            checkcomp(["View layers", "tl1", 0], Phaser.Group, "tg1");
            checkcomp(["View layers", "tl1", 1], Phaser.Group, "tg3");

            builder = new UIBuilder(testgame.view);
            builder.group("tg4");
            checkcomp(["View layers", "base", 0], Phaser.Group, "tg4");

            builder = new UIBuilder(testgame.view);
            builder.group("tg5");
            checkcomp(["View layers", "base", 0], Phaser.Group, "tg4");
            checkcomp(["View layers", "base", 1], Phaser.Group, "tg5");

            check.equals(testgame.view.layers.children.map((child: any) => child.name), ["tl1", "tl2", "base"]);
        })

        test.case("creates component inside the parent container", check => {
            let builder = new UIBuilder(testgame.view, testgame.view.getLayer("testlayer"));
            let group = builder.group("test1");
            checkcomp(["View layers", "testlayer", 0], Phaser.Group, "test1");

            builder = new UIBuilder(testgame.view, group);
            builder.text("test2");
            checkcomp(["View layers", "testlayer", 0, 0], Phaser.Text, "", { text: "test2", parent: group });

            builder = new UIBuilder(testgame.view, "anothertestlayer");
            builder.text("test3");
            checkcomp(["View layers", "anothertestlayer", 0], Phaser.Text, "", { text: "test3" });
        })

        test.case("can clear a container", check => {
            let builder = new UIBuilder(testgame.view);
            builder.group("group1", 50, 30);
            builder.text("text1");
            let [spath, container] = get(["View layers", "base"]);
            check.equals(container.children.length, 2);
            builder.clear();
            check.equals(container.children.length, 0);
        })

        test.case("can create groups", check => {
            let builder = new UIBuilder(testgame.view);
            builder.group("group1", 50, 30);
            checkcomp(["View layers", "base", 0], Phaser.Group, "group1", { x: 50, y: 30 });
        })

        test.case("can create texts", check => {
            let builder = new UIBuilder(testgame.view);
            builder.text("Test content", 12, 41);
            checkcomp(["View layers", "base", 0], Phaser.Text, "", { text: "Test content", x: 12, y: 41 });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { size: 61 });
            checkcomp(["View layers", "base", 0], Phaser.Text, "", { cssFont: "16pt 'SpaceTac'" });
            checkcomp(["View layers", "base", 1], Phaser.Text, "", { cssFont: "61pt 'SpaceTac'" });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { color: "#252627" });
            checkcomp(["View layers", "base", 0], Phaser.Text, "", { fill: "#ffffff" });
            checkcomp(["View layers", "base", 1], Phaser.Text, "", { fill: "#252627" });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { shadow: true });
            checkcomp(["View layers", "base", 0], Phaser.Text, "", { shadowColor: "rgba(0,0,0,0)" });
            checkcomp(["View layers", "base", 1], Phaser.Text, "", { shadowColor: "rgba(0,0,0,0.6)", shadowFill: true, shadowOffsetX: 3, shadowOffsetY: 4, shadowBlur: 3, shadowStroke: true });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { stroke_width: 2, stroke_color: "#ff0000" });
            checkcomp(["View layers", "base", 0], Phaser.Text, "", { stroke: "black", strokeThickness: 0 });
            checkcomp(["View layers", "base", 1], Phaser.Text, "", { stroke: "#ff0000", strokeThickness: 2 });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { bold: true });
            checkcomp(["View layers", "base", 0], Phaser.Text, "", { fontWeight: "normal" });
            checkcomp(["View layers", "base", 1], Phaser.Text, "", { fontWeight: "bold" });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { center: false });
            builder.text("", 0, 0, { vcenter: false });
            builder.text("", 0, 0, { center: false, vcenter: false });
            checkcomp(["View layers", "base", 0], Phaser.Text, "", { anchor: new Phaser.Point(0.5, 0.5), align: "center" });
            checkcomp(["View layers", "base", 1], Phaser.Text, "", { anchor: new Phaser.Point(0, 0.5), align: "left" });
            checkcomp(["View layers", "base", 2], Phaser.Text, "", { anchor: new Phaser.Point(0.5, 0), align: "center" });
            checkcomp(["View layers", "base", 3], Phaser.Text, "", { anchor: new Phaser.Point(0, 0), align: "left" });

            builder.clear();
            builder.text("", 0, 0, { width: 0 });
            builder.text("", 0, 0, { width: 1100 });
            checkcomp(["View layers", "base", 0], Phaser.Text, "", { wordWrap: false });
            checkcomp(["View layers", "base", 1], Phaser.Text, "", { wordWrap: true, wordWrapWidth: 1100 });
        })

        test.case("can create images", check => {
            let builder = new UIBuilder(testgame.view);
            builder.image("test-image", 100, 50);
            checkcomp(["View layers", "base", 0], Phaser.Image, "test-image", { x: 100, y: 50, key: "__missing", inputEnabled: null });

            check.patch(testgame.view, "getFirstImage", (...images: string[]) => images[1]);
            builder.image(["test-image1", "test-image2", "test-image3"]);
            checkcomp(["View layers", "base", 1], Phaser.Image, "test-image2");
        })

        test.case("can create buttons", check => {
            let builder = new UIBuilder(testgame.view);
            let a = 1;
            let button1 = builder.button("test-image1", 100, 50, () => a += 1);
            checkcomp(["View layers", "base", 0], Phaser.Button, "test-image1", { x: 100, y: 50, key: "__missing", inputEnabled: true });
            check.same(button1.input.useHandCursor, true, "button1 should use hand cursor");
            let button2 = builder.button("test-image2", 20, 10);
            checkcomp(["View layers", "base", 1], Phaser.Button, "test-image2", { x: 20, y: 10, key: "__missing", inputEnabled: true });
            check.same(button2.input.useHandCursor, false, "button2 should not use hand cursor");

            check.equals(a, 1);
            testClick(button1);
            check.equals(a, 2);
            testClick(button2);
            check.equals(a, 2);
            testClick(button1);
            check.equals(a, 3);
        })

        test.case("can create toggle buttons", check => {
            let builder = new UIBuilder(testgame.view);

            let mock = check.mockfunc("identity", (x: any) => x);
            let button1 = builder.button("test-image1", 0, 0, undefined, undefined, <any>mock.func);
            let button2 = builder.button("test-image2");

            let result = builder.switch(button2, true);
            check.equals(result, false, "button2");
            check.called(mock, 0);
            testClick(button2);
            check.called(mock, 0);

            check.in("button1 on", check => {
                result = builder.switch(button1, true);
                check.equals(result, true);
                check.called(mock, [[true]]);
            });

            check.in("button1 off", check => {
                result = builder.switch(button1, false);
                check.equals(result, false);
                check.called(mock, [[false]]);
            });

            check.in("button1 first click", check => {
                testClick(button1);
                check.called(mock, [[true]]);
            });

            check.in("button1 second click", check => {
                testClick(button1);
                check.called(mock, [[false]]);
            });
        });

        test.case("can create shaders", check => {
            let builder = new UIBuilder(testgame.view);

            let shader1 = builder.shader("test-shader-1", "test-image-1");
            check.equals(shader1 instanceof Phaser.Image, true);
            check.equals(shader1.name, "test-image-1");
            check.same(shader1.filters.length, 1, "one filter set on shader1");

            let shader2 = builder.shader("test-shader-2", { width: 500, height: 300 });
            check.equals(shader2 instanceof Phaser.Image, true);
            /*check.equals(shader2.width, 500);
            check.equals(shader2.height, 300);*/  // FIXME randomly fail on karma
            check.same(shader2.filters.length, 1, "one filter set on shader2");

            let i = 0;
            let shader3 = builder.shader("test-shader-3", "test-image-3", 50, 30, () => { return { a: i++, b: { x: 1, y: 2 } } });
            check.equals(shader3.x, 50);
            check.equals(shader3.y, 30);
            check.equals(shader3.filters[0].uniforms["a"], { type: '1f', value: 0 }, "uniform a initial");
            check.equals(shader3.filters[0].uniforms["b"], { type: '2f', value: Object({ x: 1, y: 2 }) }, "uniform b initial");
            shader3.update();
            check.equals(shader3.filters[0].uniforms["a"], { type: '1f', value: 1 }, "uniform a updated");
            check.equals(shader3.filters[0].uniforms["b"], { type: '2f', value: Object({ x: 1, y: 2 }) }, "uniform b updated");

            check.same(testgame.view.getLayer("base").children.length, 3, "view layer should have three children");
        })

        test.case("creates sub-builders, preserving text style", check => {
            let base_style = new UITextStyle();
            base_style.width = 123;
            let builder = new UIBuilder(testgame.view, undefined, base_style);
            builder.text("Test 1");

            let group = builder.group("testgroup");
            let subbuilder = builder.in(group);
            subbuilder.text("Test 2");

            checkcomp(["View layers", "base", 0], Phaser.Text, "", { text: "Test 1", wordWrapWidth: 123 });
            checkcomp(["View layers", "base", 1, 0], Phaser.Text, "", { text: "Test 2", wordWrapWidth: 123 });
        })

        test.case("allows to alter text style", check => {
            let builder = new UIBuilder(testgame.view);
            builder.text("t1");
            builder.styled({ bold: true }).text("t2");
            builder.text("t3");
            builder.text("t4", undefined, undefined, { bold: true });

            checkcomp(["View layers", "base", 0], Phaser.Text, "", { text: "t1", fontWeight: "normal" });
            checkcomp(["View layers", "base", 1], Phaser.Text, "", { text: "t2", fontWeight: "bold" });
            checkcomp(["View layers", "base", 2], Phaser.Text, "", { text: "t3", fontWeight: "normal" });
            checkcomp(["View layers", "base", 3], Phaser.Text, "", { text: "t4", fontWeight: "bold" });
        })

        test.case("allows to change text, image or button content", check => {
            let builder = new UIBuilder(testgame.view);
            let text = builder.text("test-text");
            let image = builder.image("test-image");
            let button = builder.button("test-button");

            checkcomp(["View layers", "base", 0], Phaser.Text, "", { text: "test-text" });
            checkcomp(["View layers", "base", 1], Phaser.Image, "test-image");
            checkcomp(["View layers", "base", 2], Phaser.Button, "test-button");

            builder.change(text, "test-mod-text");
            builder.change(image, "test-mod-image");
            builder.change(button, "test-mod-button");

            checkcomp(["View layers", "base", 0], Phaser.Text, "", { text: "test-mod-text" });
            checkcomp(["View layers", "base", 1], Phaser.Image, "test-mod-image");
            checkcomp(["View layers", "base", 2], Phaser.Button, "test-mod-button");
        })

        test.case("distributes children along an axis", check => {
            let builder = new UIBuilder(testgame.view);
            builder = builder.in(builder.group("test"));

            let c1 = builder.text("");
            let c2 = builder.button("test");
            let c3 = builder.group("test");

            check.equals(c1.x, 0);
            check.equals(c1.y, 0);
            check.equals(c2.x, 0);
            check.equals(c2.y, 0);
            check.equals(c3.x, 0);
            check.equals(c3.y, 0);

            check.patch(UITools, "getScreenBounds", (obj: any) => {
                if (obj === c1) {
                    return { x: 0, y: 0, width: 100, height: 51 };
                } else if (obj === c2) {
                    return { x: 0, y: 0, width: 20, height: 7 };
                } else if (obj === c3) {
                    return { x: 0, y: 0, width: 60, height: 11 };
                } else {
                    return { x: 0, y: 0, width: 0, height: 0 };
                }
            });

            builder.distribute("x", 100, 400);

            check.equals(c1.x, 130);
            check.equals(c1.y, 0);
            check.equals(c2.x, 260);
            check.equals(c2.y, 0);
            check.equals(c3.x, 310);
            check.equals(c3.y, 0);

            builder.distribute("y", 60, 180);

            check.equals(c1.x, 130);
            check.equals(c1.y, 73);
            check.equals(c2.x, 260);
            check.equals(c2.y, 137);
            check.equals(c3.x, 310);
            check.equals(c3.y, 156);
        })
    })
}
