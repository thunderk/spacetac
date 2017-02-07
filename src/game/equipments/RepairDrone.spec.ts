module TS.SpaceTac.Game.Equipments {
    describe("RepairDrone", function () {
        it("generates a drone that may repair ships hull", function () {
            let template = new RepairDrone();

            let equipment = template.generateFixed(0);
            expect(equipment.target_effects).toEqual([new ValueEffect("hull", 10)]);
        });
    });
}
