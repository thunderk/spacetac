module TK.SpaceTac.Specs {
    function checkLocation(check: TestContext, got: IArenaLocation, expected_x: number, expected_y: number) {
        check.equals(got.x, expected_x, `x differs (${got.x},${got.y}) (${expected_x},${expected_y})`);
        check.equals(got.y, expected_y, `y differs (${got.x},${got.y}) (${expected_x},${expected_y})`);
    }

    testing("HexagonalArenaGrid", test => {
        test.case("snaps coordinates to the nearest grid point, on a biased grid", check => {
            let grid = new HexagonalArenaGrid(4, 0.75);
            checkLocation(check, grid.snap({ x: 0, y: 0 }), 0, 0);
            checkLocation(check, grid.snap({ x: 1, y: 0 }), 0, 0);
            checkLocation(check, grid.snap({ x: 1.9, y: 0 }), 0, 0);
            checkLocation(check, grid.snap({ x: 2.1, y: 0 }), 4, 0);
            checkLocation(check, grid.snap({ x: 1, y: 1 }), 0, 0);
            checkLocation(check, grid.snap({ x: 1, y: 2 }), 2, 3);
            checkLocation(check, grid.snap({ x: -1, y: -1 }), 0, 0);
            checkLocation(check, grid.snap({ x: -2, y: -2 }), -2, -3);
            checkLocation(check, grid.snap({ x: -3, y: -1 }), -4, 0);
            checkLocation(check, grid.snap({ x: 6, y: -5 }), 8, -6);
        });

        test.case("snaps coordinates to the nearest grid point, on a regular grid", check => {
            let grid = new HexagonalArenaGrid(10);
            checkLocation(check, grid.snap({ x: 0, y: 0 }), 0, 0);
            checkLocation(check, grid.snap({ x: 8, y: 0 }), 10, 0);
            checkLocation(check, grid.snap({ x: 1, y: 6 }), 5, 10 * Math.sqrt(0.75));
        });
    });
}
