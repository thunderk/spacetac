module TS.SpaceTac.UI.Specs {
    describe("ActiveMissionsDisplay", function () {
        let testgame = setupEmptyView();

        it("displays active missions", function () {
            let view = testgame.baseview;
            let missions = new ActiveMissions();
            let display = new ActiveMissionsDisplay(view, missions);

            let container = <Phaser.Group>(<any>display).container;
            expect(container.children.length).toBe(0);

            missions.secondary.push(new Mission([
                new MissionPart("Get back to base")
            ]));

            display.update();
            expect(container.children.length).toBe(2);
            expect(container.children[0] instanceof Phaser.Image).toBe(true);
            checkText(container.children[1], "Get back to base");
        });
    });
}
