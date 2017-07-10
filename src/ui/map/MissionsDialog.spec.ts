module TS.SpaceTac.UI.Specs {
    describe("MissionsDialog", function () {
        let testgame = setupEmptyView();

        function checkTexts(dialog: MissionsDialog, expected: string[]) {
            let i = 0;
            let container = <Phaser.Group>(<any>dialog).container;
            container.children.forEach(child => {
                if (child instanceof Phaser.Text) {
                    expect(child.text).toEqual(expected[i++]);
                }
            });
            expect(i).toEqual(expected.length);
        }

        it("displays active and proposed missions", function () {
            let universe = new Universe();
            let player = new Player();
            let shop = new Shop();
            let shop_missions: Mission[] = [];
            spyOn(shop, "getMissions").and.callFake(() => shop_missions);

            let missions = new MissionsDialog(testgame.baseview, shop, player);
            checkTexts(missions, []);

            let mission = new Mission(universe);
            mission.title = "Save the universe!";
            mission.setDifficulty(MissionDifficulty.hard, 1);
            mission.reward = 15000;
            shop_missions.push(mission);
            missions.refresh();
            checkTexts(missions, ["Proposed jobs", "Save the universe!", "Hard - Reward: 15000 zotys"]);

            mission = new Mission(universe);
            mission.title = "Do not do evil";
            mission.setDifficulty(MissionDifficulty.easy, 1);
            mission.reward = new Equipment();
            mission.reward.name = "Boy Scout Cap";
            shop_missions.push(mission);
            missions.refresh();
            checkTexts(missions, ["Proposed jobs", "Save the universe!", "Hard - Reward: 15000 zotys", "Do not do evil", "Easy - Reward: Boy Scout Cap Mk1"]);

            mission = new Mission(universe);
            mission.title = "Collect some money";
            mission.setDifficulty(MissionDifficulty.normal, 1);
            player.missions.addSecondary(mission, player.fleet);
            missions.refresh();
            checkTexts(missions, ["Active jobs", "Collect some money", "Normal - Reward: -",
                "Proposed jobs", "Save the universe!", "Hard - Reward: 15000 zotys", "Do not do evil", "Easy - Reward: Boy Scout Cap Mk1"]);

            mission = new Mission(universe, undefined, true);
            mission.title = "Kill the villain";
            mission.setDifficulty(MissionDifficulty.hard, 1);
            player.missions.main = mission;
            missions.refresh();
            checkTexts(missions, ["Active jobs", "Collect some money", "Normal - Reward: -",
                "Proposed jobs", "Save the universe!", "Hard - Reward: 15000 zotys", "Do not do evil", "Easy - Reward: Boy Scout Cap Mk1"]);
        });
    });
}
