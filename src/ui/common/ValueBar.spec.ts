module TK.SpaceTac.UI.Specs {
    testing("ValueBar", test => {
        let testgame = setupEmptyView(test);

        test.case("computes proportional value", check => {
            var bar = new ValueBar(testgame.view, "default", ValueBarOrientation.EAST);
            check.equals(bar.getProportionalValue(), 0);

            bar.setValue(20, 100);
            check.nears(bar.getProportionalValue(), 0.2);

            bar.setValue(40);
            check.nears(bar.getProportionalValue(), 0.4);

            bar.setValue(0, 0);
            check.equals(bar.getProportionalValue(), 0);
        });
    });
}
