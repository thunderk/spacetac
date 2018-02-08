module TK.SpaceTac.Specs {
    testing("BattleOutcome", test => {
        test.case("grants experience", check => {
            let fleet1 = new Fleet();
            let ship1a = fleet1.addShip(new Ship());
            ship1a.level.forceLevel(3);
            let ship1b = fleet1.addShip(new Ship());
            ship1b.level.forceLevel(4);
            let fleet2 = new Fleet();
            let ship2a = fleet2.addShip(new Ship());
            ship2a.level.forceLevel(6);
            let ship2b = fleet2.addShip(new Ship());
            ship2b.level.forceLevel(8);
            check.equals(ship1a.level.getExperience(), 300);
            check.equals(ship1b.level.getExperience(), 600);
            check.equals(ship2a.level.getExperience(), 1500);
            check.equals(ship2b.level.getExperience(), 2800);

            // draw
            let outcome = new BattleOutcome(null);
            outcome.grantExperience([fleet1, fleet2]);
            check.equals(ship1a.level.getExperience(), 345);
            check.equals(ship1b.level.getExperience(), 645);
            check.equals(ship2a.level.getExperience(), 1511);
            check.equals(ship2b.level.getExperience(), 2811);

            // win/lose
            outcome = new BattleOutcome(fleet1);
            outcome.grantExperience([fleet1, fleet2]);
            check.equals(ship1a.level.getExperience(), 480);
            check.equals(ship1b.level.getExperience(), 780);
            check.equals(ship2a.level.getExperience(), 1518);
            check.equals(ship2b.level.getExperience(), 2818);
        });
    });
}
