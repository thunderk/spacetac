module TK.SpaceTac.UI.Specs {
    testing("UIBuilder", test => {
        let testgame = setupEmptyView(test);

        function get(path: (number | string)[]): [string, any] {
            let spath = `[${path.join(" -> ")}]`;
            let component: Phaser.GameObjects.GameObject | Phaser.Scene | null = testgame.view;
            path.forEach(idx => {
                if (component instanceof Phaser.Scene) {
                    component = (typeof idx == "number") ? component.children.list[idx] : component.children.getByName(idx);
                } else if (component instanceof Phaser.GameObjects.Container) {
                    component = (typeof idx == "number") ? component.list[idx] : component.getByName(idx);
                } else {
                    component = null;
                }
                if (!component) {
                    throw new Error(`Path not found: ${spath} (${idx} part)`);
                }
            });
            return [spath, component];
        }

        function checkcomp<T extends Phaser.GameObjects.GameObject>(path: (number | string)[], ctype?: { new(...args: any[]): T }, name?: string, attrs?: Partial<T>): T {
            let [spath, component] = get(path);

            if (typeof ctype != "undefined") {
                test.check.same(component instanceof ctype, true, `${spath} is not of good type`);
            }
            if (typeof name != "undefined") {
                test.check.equals(component.name, name, spath);
            }
            if (typeof attrs != "undefined") {
                iteritems(<any>attrs, (key, value) => {
                    test.check.equals(component[key], value, spath);
                });
            }

            return component;
        }

        function checktext(path: (number | string)[], attrs?: Partial<UIText>, style?: Partial<Phaser.GameObjects.Text.TextStyle>): UIText {
            let text = checkcomp(path, UIText, "", attrs);

            if (typeof style != "undefined") {
                iteritems(<any>style, (key, value) => {
                    test.check.equals((<any>text.style)[key], value, `text style ${key}`);
                });
            }

            return text;
        }

        test.case("can work on view layers", check => {
            let builder = new UIBuilder(testgame.view, "tl1");
            builder.container("tg1");
            checkcomp(["View layers", "tl1", 0], UIContainer, "tg1");

            builder = new UIBuilder(testgame.view, "tl2");
            builder.container("tg2");
            checkcomp(["View layers", "tl2", 0], UIContainer, "tg2");

            builder = new UIBuilder(testgame.view, "tl1");
            builder.container("tg3");
            checkcomp(["View layers", "tl1", 0], UIContainer, "tg1");
            checkcomp(["View layers", "tl1", 1], UIContainer, "tg3");

            builder = new UIBuilder(testgame.view);
            builder.container("tg4");
            checkcomp(["View layers", "base", 0], UIContainer, "tg4");

            builder = new UIBuilder(testgame.view);
            builder.container("tg5");
            checkcomp(["View layers", "base", 0], UIContainer, "tg4");
            checkcomp(["View layers", "base", 1], UIContainer, "tg5");

            check.equals(testgame.view.layers.list.map((child: any) => child.name), ["tl1", "tl2", "base"]);
        })

        test.case("creates component inside the parent container", check => {
            let builder = new UIBuilder(testgame.view, testgame.view.getLayer("testlayer"));
            let group = builder.container("test1");
            checkcomp(["View layers", "testlayer", 0], UIContainer, "test1");

            builder = new UIBuilder(testgame.view, group);
            builder.text("test2");
            checkcomp(["View layers", "testlayer", 0, 0], UIText, "", { text: "test2", parentContainer: group });

            builder = new UIBuilder(testgame.view, "anothertestlayer");
            builder.text("test3");
            checkcomp(["View layers", "anothertestlayer", 0], UIText, "", { text: "test3" });
        })

        test.case("can clear a container", check => {
            let builder = new UIBuilder(testgame.view);
            builder.container("group1", 50, 30);
            builder.text("text1");
            let [spath, container] = get(["View layers", "base"]);
            if (check.instance(container, UIContainer, "is a container")) {
                check.equals(container.list.length, 2);
                builder.clear();
                check.equals(container.list.length, 0);
            }
        })

        test.case("can create containers", check => {
            let builder = new UIBuilder(testgame.view);
            builder.container("group1", 50, 30);
            checkcomp(["View layers", "base", 0], UIContainer, "group1", { x: 50, y: 30 });
        })

        test.case("can create texts", check => {
            let builder = new UIBuilder(testgame.view);
            builder.text("Test content", 12, 41);
            checktext(["View layers", "base", 0], { text: "Test content", x: 12, y: 41 });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { size: 61 });
            checktext(["View layers", "base", 0], undefined, { fontFamily: "16pt SpaceTac" });
            checktext(["View layers", "base", 1], undefined, { fontFamily: "61pt SpaceTac" });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { color: "#252627" });
            checktext(["View layers", "base", 0], undefined, { color: "#ffffff" });
            checktext(["View layers", "base", 1], undefined, { color: "#252627" });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { shadow: true });
            checktext(["View layers", "base", 0], undefined, { shadowColor: "#000", shadowFill: false, shadowStroke: false });
            checktext(["View layers", "base", 1], undefined, { shadowColor: "rgba(0,0,0,0.6)", shadowFill: true, shadowOffsetX: 3, shadowOffsetY: 4, shadowBlur: 3, shadowStroke: true });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { stroke_width: 2, stroke_color: "#ff0000" });
            checktext(["View layers", "base", 0], undefined, { stroke: "#fff", strokeThickness: 0 });
            checktext(["View layers", "base", 1], undefined, { stroke: "#ff0000", strokeThickness: 2 });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { bold: true });
            checktext(["View layers", "base", 0], undefined, { fontFamily: "16pt SpaceTac" });
            checktext(["View layers", "base", 1], undefined, { fontFamily: "bold 16pt SpaceTac" });

            builder.clear();
            builder.text("", 0, 0, {});
            builder.text("", 0, 0, { center: false });
            builder.text("", 0, 0, { vcenter: false });
            builder.text("", 0, 0, { center: false, vcenter: false });
            checktext(["View layers", "base", 0], { originX: 0.5, originY: 0.5 }, { align: "center" });
            checktext(["View layers", "base", 1], { originX: 0, originY: 0.5 }, { align: "left" });
            checktext(["View layers", "base", 2], { originX: 0.5, originY: 0 }, { align: "center" });
            checktext(["View layers", "base", 3], { originX: 0, originY: 0 }, { align: "left" });

            builder.clear();
            builder.text("", 0, 0, { width: 0 });
            builder.text("", 0, 0, { width: 1100 });
            checktext(["View layers", "base", 0], undefined, <any>{ wordWrapWidth: null });
            checktext(["View layers", "base", 1], undefined, <any>{ wordWrapWidth: 1100 });
        })

        test.case("can create images", check => {
            let builder = new UIBuilder(testgame.view);
            builder.image("test-image", 100, 50);
            checkcomp(["View layers", "base", 0], UIImage, "test-image", { x: 100, y: 50 });

            check.patch(testgame.view, "getFirstImage", (...images: string[]) => images[1]);
            builder.image(["test-image1", "test-image2", "test-image3"]);
            checkcomp(["View layers", "base", 1], UIImage, "test-image2");
        })

        test.case("can create buttons", check => {
            let builder = new UIBuilder(testgame.view);
            let a = 1;
            let button1 = builder.button("test-image1", 100, 50, () => a += 1);
            checkcomp(["View layers", "base", 0], UIButton, "test-image1", { x: 100, y: 50 });
            let button2 = builder.button("test-image2", 20, 10);
            checkcomp(["View layers", "base", 1], UIButton, "test-image2", { x: 20, y: 10 });

            check.equals(a, 1);
            testClick(button1);
            check.equals(a, 2);
            testClick(button2);
            check.equals(a, 2);
            testClick(button1);
            check.equals(a, 3);
        })

        test.case("creates sub-builders, preserving text style", check => {
            let base_style = new UITextStyle();
            base_style.width = 123;
            let builder = new UIBuilder(testgame.view, undefined, base_style);
            builder.text("Test 1");

            let group = builder.container("testgroup");
            let subbuilder = builder.in(group);
            subbuilder.text("Test 2");

            checktext(["View layers", "base", 0], { text: "Test 1" }, <any>{ wordWrapWidth: 123 });
            checktext(["View layers", "base", 1, 0], { text: "Test 2" }, <any>{ wordWrapWidth: 123 });
        })

        test.case("allows to alter text style", check => {
            let builder = new UIBuilder(testgame.view);
            builder.text("t1");
            builder.styled({ bold: true }).text("t2");
            builder.text("t3");
            builder.text("t4", undefined, undefined, { bold: true });

            checktext(["View layers", "base", 0], { text: "t1" }, { fontFamily: "16pt SpaceTac" });
            checktext(["View layers", "base", 1], { text: "t2" }, { fontFamily: "bold 16pt SpaceTac" });
            checktext(["View layers", "base", 2], { text: "t3" }, { fontFamily: "16pt SpaceTac" });
            checktext(["View layers", "base", 3], { text: "t4" }, { fontFamily: "bold 16pt SpaceTac" });
        })

        test.case("allows to change text or image content", check => {
            let builder = new UIBuilder(testgame.view);
            let text = builder.text("test-text");
            let image = builder.image("test-image");

            checkcomp(["View layers", "base", 0], UIText, "", { text: "test-text" });
            checkcomp(["View layers", "base", 1], UIImage, "test-image");

            builder.change(text, "test-mod-text");
            builder.change(image, "test-mod-image");

            checkcomp(["View layers", "base", 0], UIText, "", { text: "test-mod-text" });
            checkcomp(["View layers", "base", 1], UIImage, "test-mod-image");
        })

        test.case("distributes children along an axis", check => {
            let builder = new UIBuilder(testgame.view);
            builder = builder.in(builder.container("test"));

            let c1 = builder.text("");
            let c2 = builder.button("test");
            let c3 = builder.container("test");

            check.equals(c1.x, 0);
            check.equals(c1.y, 0);
            check.equals(c2.x, 0);
            check.equals(c2.y, 0);
            check.equals(c3.x, 0);
            check.equals(c3.y, 0);

            check.patch(UITools, "getBounds", (obj: any) => {
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
