module TK.SpaceTac.Specs {
    describe("ArenaLocation", () => {
        it("gets distance and angle between two locations", function () {
            expect(arenaDistance({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.sqrt(2), 8);
            expect(arenaAngle({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.PI / 4, 8);
        })

        it("gets an angular distance", function () {
            expect(angularDistance(0.5, 1.5)).toBe(1.0);
            expect(angularDistance(0.5, 1.5 + Math.PI * 6)).toBeCloseTo(1.0, 0.000001);
            expect(angularDistance(0.5, -0.5)).toBe(-1.0);
            expect(angularDistance(0.5, -0.3 - Math.PI * 4)).toBeCloseTo(-0.8, 0.000001);
        })
    });
}
