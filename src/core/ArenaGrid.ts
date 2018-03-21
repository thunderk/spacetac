module TK.SpaceTac {
    /**
     * Abstract grid for the arena where the battle takes place
     * 
     * The grid is used to snap arena coordinates for ships and targets
     */
    export interface IArenaGrid {
        snap(loc: IArenaLocation): IArenaLocation;
    }

    /**
     * Hexagonal unbounded arena grid
     * 
     * This grid is composed of regular hexagons where all vertices are at a same distance "unit" of the hexagon center
     */
    export class HexagonalArenaGrid implements IArenaGrid {
        private yunit: number;

        constructor(private unit: number, private yfactor = Math.sqrt(0.75)) {
            this.yunit = unit * yfactor;
        }

        snap(loc: IArenaLocation): IArenaLocation {
            let yr = Math.round(loc.y / this.yunit);
            let xr: number;
            if (yr % 2 == 0) {
                xr = Math.round(loc.x / this.unit);
            } else {
                xr = Math.round((loc.x - 0.5 * this.unit) / this.unit) + 0.5;
            }
            return new ArenaLocation((xr * this.unit) || 0, (yr * this.yunit) || 0);
        }
    }
}
