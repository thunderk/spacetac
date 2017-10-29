module TK.SpaceTac.UI.Specs {
    testing("CharacterEquipment", test => {
        let testgame = setupEmptyView(test);

        class FakeContainer implements CharacterEquipmentContainer {
            name: string;
            x: number;
            inside: CharacterEquipment | null;
            constructor(name: string, x: number) {
                this.name = name;
                this.x = x;
                this.inside = null;
            }
            jasmineToString() {
                return this.name;
            }
            isInside(x: number, y: number): boolean {
                return x == this.x;
            }
            getEquipmentAnchor(): { x: number, y: number, scale: number, alpha: number } {
                return { x: this.x, y: 0, scale: 0.5, alpha: 1 };
            }
            getPriceOffset(): number {
                return 12;
            }
            addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
                if (this.x < 150) {
                    if (!test) {
                        this.inside = equipment;
                    }
                    return { success: true, info: "" };
                } else {
                    return { success: false, info: "" };
                }
            }
            removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
                if (this.inside === equipment) {
                    if (!test) {
                        this.inside = null;
                    }
                    return { success: true, info: "" };
                } else {
                    return { success: false, info: "" };
                }
            }
        }

        function createBasicCase(positions: number[]): [CharacterSheet, CharacterEquipment, FakeContainer[], Mock] {
            let view = testgame.view;
            let sheet = new CharacterSheet(view);
            sheet.show(new Ship());
            let refresh = test.check.patch(sheet, "refresh", null);

            let containers = positions.map((x, idx) => new FakeContainer(`container${idx + 1}`, x));
            let equipment = new CharacterEquipment(sheet, new Equipment(), containers[0]);
            containers[0].inside = equipment;
            equipment.setupDragDrop();
            test.check.patch(sheet, "iEquipmentContainers", () => iarray(containers));

            return [sheet, equipment, containers, refresh];
        }

        test.case("handles drag-and-drop to move equipment", check => {
            let [sheet, equipment, [container1, container2, container3], refresh] = createBasicCase([0, 100, 200]);

            check.same(equipment.inputEnabled, true, "Input should be enabled");
            check.same(equipment.input.draggable, true, "Equipment should be draggable");
            check.same(equipment.container, container1);
            check.equals(equipment.x, 0);
            check.equals(equipment.scale.x, 0.25);

            // drop on nothing
            check.equals(equipment.alpha, 1);
            equipment.events.onDragStart.dispatch();
            check.equals(equipment.alpha, 0.8);
            equipment.x = 812;
            equipment.events.onDragStop.dispatch();
            check.same(equipment.container, container1);
            check.equals(equipment.x, 0);
            check.called(refresh, 0);

            // drop on accepting destination
            equipment.events.onDragStart.dispatch();
            equipment.x = 100;
            equipment.events.onDragStop.dispatch();
            check.same(equipment.container, container2);
            check.equals(equipment.x, 100);
            check.equals(container1.inside, null);
            check.same(container2.inside, equipment);
            check.called(refresh, 1);

            // drop on refusing destination
            equipment.events.onDragStart.dispatch();
            equipment.x = 200;
            equipment.events.onDragStop.dispatch();
            check.same(equipment.container, container2);
            check.equals(equipment.x, 100);
            check.same(container2.inside, equipment);
            check.equals(container3.inside, null);
            check.called(refresh, 0);

            // broken destination, should return to source
            let log = check.patch(console, "error", null);
            check.patch(container3, "addEquipment", (equ: any, src: any, test: boolean) => { return { success: test } });
            equipment.events.onDragStart.dispatch();
            equipment.x = 200;
            equipment.events.onDragStop.dispatch();
            check.same(equipment.container, container2);
            check.equals(equipment.x, 100);
            check.called(refresh, 0);
            check.called(log, [
                ['Destination container refused to accept equipment', equipment, container2, container3]
            ]);

            // broken destination and source, item is lost !
            check.patch(container2, "addEquipment", (equ: any, src: any, test: boolean) => { return { success: test } });
            equipment.events.onDragStart.dispatch();
            equipment.x = 200;
            equipment.events.onDragStop.dispatch();
            check.same(equipment.container, container3);
            check.equals(equipment.x, 200);
            check.called(refresh, 1);
            check.called(log, [
                ['Destination container refused to accept equipment', equipment, container2, container3],
                ['Equipment lost in bad exchange!', equipment, container2, container3]
            ]);
        });

        test.case("defines the sheet's action message", check => {
            let [sheet, equipment, [container1, container2], refresh] = createBasicCase([0, 1]);

            check.patch(container1, "removeEquipment", iterator([
                { success: true, info: "detach" },
                { success: false, info: "detach", error: "cannot detach" },
                { success: true, info: "detach" },
                { success: false, info: "detach", error: "cannot detach" }
            ]))
            check.patch(container2, "addEquipment", iterator([
                { success: true, info: "attach" },
                { success: true, info: "attach" },
                { success: false, info: "attach", error: "cannot attach" },
                { success: false, info: "attach", error: "cannot attach" }
            ]))

            check.equals(sheet.action_message.text, "");
            equipment.events.onDragStart.dispatch();
            check.equals(sheet.action_message.text, "");
            equipment.x = 1;
            equipment.events.onDragUpdate.dispatch();
            check.equals(sheet.action_message.text, "Detach, attach");
            equipment.events.onDragUpdate.dispatch();
            check.equals(sheet.action_message.text, "Detach, attach (cannot detach)");
            equipment.events.onDragUpdate.dispatch();
            check.equals(sheet.action_message.text, "Detach, attach (cannot attach)");
            equipment.events.onDragUpdate.dispatch();
            check.equals(sheet.action_message.text, "Detach, attach (cannot detach)");
        });
    });
}
