import type { Polygon } from "@/model/Polygon";
import type { IPolygonConverter } from "./IPolygonConverter";

export class PolygonCenterer implements IPolygonConverter {

    private boundingBoxWidth: number;
    private boundingBoxHeight: number;

    constructor(boundingBoxWidth: number, boundingBoxHeight: number) {
        this.boundingBoxWidth = boundingBoxWidth;
        this.boundingBoxHeight = boundingBoxHeight;
    }

    convert(toConvert: Polygon[]): void {
        if (toConvert.length === 0)
            return;

        let valueFound = false;
        let maxX = -Infinity;
        let maxY = -Infinity;
        let minX = Infinity;
        let minY = Infinity;
        for (const poly of toConvert) {
            for (const point of poly.getVertices()) {
                if (point.x > maxX) maxX = point.x;
                if (point.y > maxY) maxY = point.y;
                if (point.x < minX) minX = point.x;
                if (point.y < minY) minY = point.y;
                valueFound = true;
            }
        }

        if (!valueFound)
            return;

        const emptyBoundingSpaceX = (this.boundingBoxWidth - maxX) + minX;
        const emptyBoundingSpaceY = (this.boundingBoxHeight - maxY) + minY;
        const desiredOffsetX = emptyBoundingSpaceX / 2.0;
        const desiredOffsetY = emptyBoundingSpaceY / 2.0;
        const additionalOffsetX = desiredOffsetX - minX;
        const additionalOffsetY = desiredOffsetY - minY;

        for (const poly of toConvert) {
            for (const point of poly.getVertices()) {
                point.x += additionalOffsetX;
                point.y +=additionalOffsetY
            }
        }
    }
}