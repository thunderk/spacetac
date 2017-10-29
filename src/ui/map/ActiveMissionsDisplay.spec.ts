module TK.SpaceTac.UI.Specs {
    testing("ActiveMissionsDisplay", test => {
        let testgame = setupEmptyView(test);

        test.case("displays active missions", check => {
            let view = testgame.view;
            let missions = new ActiveMissions();
            let display = new ActiveMissionsDisplay(view, missions);

            let container = <Phaser.Group>(<any>display).container;
            check.equals(container.children.length, 0);

            let mission = new Mission(new Universe(), new Fleet());
            mission.addPart(new MissionPart(mission, "Get back to base"));
            missions.secondary = [mission];

            display.checkUpdate();
            check.equals(container.children.length, 2);
            check.equals(container.children[0] instanceof Phaser.Image, true);
            checkText(check, container.children[1], "Get back to base");
        });
    });
}
