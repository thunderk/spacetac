module TK.SpaceTac.Specs {
    describe("ArenaLocation", () => {
        it("gets distance and angle between two locations", () => {
            expect(arenaDistance({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.sqrt(2), 8);
            expect(arenaAngle({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.PI / 4, 8);
        });
    });
}
