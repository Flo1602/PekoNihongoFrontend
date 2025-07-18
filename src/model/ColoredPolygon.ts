import type { Color } from "./Color";
import type { Point } from "./Point";
import { Polygon } from "./Polygon";

export class ColoredPolygon extends Polygon {
  private colors: Color[];

    constructor(vertices: Point[], colors: Color[]) {
        super(vertices);
        this.colors = colors;
    }

    public getColors(): Color[] {
        return this.colors;
    }
}