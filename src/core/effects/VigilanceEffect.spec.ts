module TK.SpaceTac.Specs {
    testing("VigilanceEffect", test => {
        test.case("applies vigilance effects on intruding ships", check => {
            let battle = new Battle();
            let source = battle.fleets[0].addShip();
            let target = battle.fleets[1].addShip();

            let action = source.actions.addCustom(new VigilanceAction("Reactive Shot"));
            action.configureVigilance({ intruder_effects: [new DamageEffect(1)] });
            let effect = new VigilanceEffect(action);

            let diffs = effect.getOnDiffs(target, source);
            check.equals(diffs, []);

            TestTools.setShipModel(target, 10);

            diffs = effect.getOnDiffs(target, source);
            check.equals(diffs, [
                new VigilanceAppliedDiff(source, action, target),
                new ShipDamageDiff(target, 1, 0),
                new ShipValueDiff(target, "hull", -1)
            ]);
        })
    })
}
