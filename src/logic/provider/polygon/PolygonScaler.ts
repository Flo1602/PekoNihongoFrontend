import type { Polygon } from "@/model/Polygon";
import type { IPolygonConverter } from "./IPolygonConverter";

export class PolygonScaler implements IPolygonConverter {
    private readonly scaleFactor: number;

    constructor(scaleFactor: number) {
        this.scaleFactor = scaleFactor;
    }

    convert(toConvert: Polygon[]): void {
        for (const polygon of toConvert) {
            this.scalePolygon(polygon);
        }
    }

    private scalePolygon(polygon: Polygon): void {
        for (const vertex of polygon.getVertices()) {
            vertex.x *= this.scaleFactor;
            vertex.y *= this.scaleFactor;
        }
    }
}