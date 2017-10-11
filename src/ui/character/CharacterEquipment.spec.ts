module TK.SpaceTac.UI.Specs {
    describe("CharacterEquipment", function () {
        let testgame = setupEmptyView();

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
            addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): boolean {
                if (this.x < 150) {
                    if (!test) {
                        this.inside = equipment;
                    }
                    return true;
                } else {
                    return false;
                }
            }
            removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): boolean {
                if (this.inside === equipment) {
                    if (!test) {
                        this.inside = null;
                    }
                    return true;
                } else {
                    return false;
                }
            }
        }

        it("handles drag-and-drop to move equipment", function () {
            let view = testgame.view;
            let sheet = new CharacterSheet(view);
            sheet.show(new Ship());
            let refresh = spyOn(sheet, "refresh").and.stub();

            let container1 = new FakeContainer("container1", 0);
            let container2 = new FakeContainer("container2", 100);
            let container3 = new FakeContainer("container3", 200);
            let equipment = new CharacterEquipment(sheet, new Equipment(), container1);
            container1.inside = equipment;
            equipment.setupDragDrop();
            spyOn(sheet, "iEquipmentContainers").and.returnValue(iarray([container1, container2, container3]));

            expect(equipment.inputEnabled).toBe(true, "Input should be enabled");
            expect(equipment.input.draggable).toBe(true, "Equipment should be draggable");
            expect(equipment.container).toBe(container1);
            expect(equipment.x).toBe(0);
            expect(equipment.scale.x).toBe(0.25);

            // drop on nothing
            expect(equipment.alpha).toBe(1);
            equipment.events.onDragStart.dispatch();
            expect(equipment.alpha).toBe(0.8);
            equipment.x = 812;
            equipment.events.onDragStop.dispatch();
            expect(equipment.container).toBe(container1);
            expect(equipment.x).toBe(0);
            expect(refresh).toHaveBeenCalledTimes(0);

            // drop on accepting destination
            equipment.events.onDragStart.dispatch();
            equipment.x = 100;
            equipment.events.onDragStop.dispatch();
            expect(equipment.container).toBe(container2);
            expect(equipment.x).toBe(100);
            expect(container1.inside).toBeNull();
            expect(container2.inside).toBe(equipment);
            expect(refresh).toHaveBeenCalledTimes(1);

            // drop on refusing destination
            equipment.events.onDragStart.dispatch();
            equipment.x = 200;
            equipment.events.onDragStop.dispatch();
            expect(equipment.container).toBe(container2);
            expect(equipment.x).toBe(100);
            expect(container2.inside).toBe(equipment);
            expect(container3.inside).toBe(null);
            expect(refresh).toHaveBeenCalledTimes(1);

            // broken destination, should return to source
            let log = spyOn(console, "error").and.stub();
            spyOn(container3, "addEquipment").and.returnValues(true, false, true, false);
            equipment.events.onDragStart.dispatch();
            equipment.x = 200;
            equipment.events.onDragStop.dispatch();
            expect(equipment.container).toBe(container2);
            expect(equipment.x).toBe(100);
            expect(refresh).toHaveBeenCalledTimes(1);
            expect(log).toHaveBeenCalledWith('Destination container refused to accept equipment', equipment, container2, container3);

            // broken destination and source, item is lost !
            spyOn(container2, "addEquipment").and.returnValue(false);
            equipment.events.onDragStart.dispatch();
            equipment.x = 200;
            equipment.events.onDragStop.dispatch();
            expect(equipment.container).toBe(container3);
            expect(equipment.x).toBe(200);
            expect(refresh).toHaveBeenCalledTimes(2);
            expect(log).toHaveBeenCalledWith('Equipment lost in bad exchange !', equipment, container2, container3);
        });
    });
}
