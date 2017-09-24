module TK.SpaceTac.UI.Specs {
    describe("ActiveMissionsDisplay", function () {
        let testgame = setupEmptyView();

        it("displays active missions", function () {
            let view = testgame.baseview;
            let missions = new ActiveMissions();
            let display = new ActiveMissionsDisplay(view, missions);

            let container = <Phaser.Group>(<any>display).container;
            expect(container.children.length).toBe(0);

            let mission = new Mission(new Universe(), new Fleet());
            mission.addPart(new MissionPart(mission, "Get back to base"));
            missions.secondary = [mission];

            display.checkUpdate();
            expect(container.children.length).toBe(2);
            expect(container.children[0] instanceof Phaser.Image).toBe(true);
            checkText(container.children[1], "Get back to base");
        });
    });
}
