module TK.SpaceTac.Specs {
    testing("ArenaLocation", test => {
        test.case("gets distance and angle between two locations", check => {
            check.nears(arenaDistance({ x: 0, y: 0 }, { x: 1, y: 1 }), Math.sqrt(2));
            check.nears(arenaAngle({ x: 0, y: 0 }, { x: 1, y: 1 }), Math.PI / 4);
        })

        test.case("gets an angular distance", check => {
            check.equals(angularDistance(0.5, 1.5), 1.0);
            check.nears(angularDistance(0.5, 1.5 + Math.PI * 6), 1.0);
            check.same(angularDistance(0.5, -0.5), -1.0);
            check.nears(angularDistance(0.5, -0.3 - Math.PI * 4), -0.8);
        })

        test.case("converts between degrees and radians", check => {
            check.nears(degrees(Math.PI / 2), 90);
            check.nears(radians(45), Math.PI / 4);
        });
    });
}
