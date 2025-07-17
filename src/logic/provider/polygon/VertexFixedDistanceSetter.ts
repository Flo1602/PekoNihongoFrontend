import type { Polygon } from "@/model/Polygon";
import type { IPolygonConverter } from "./IPolygonConverter";
import { calcDistanceBetweenPoints, calculatePolylineLength } from "@/logic/util/PolygonUtil";
import { deleteMiddleElement } from "@/logic/util/ArrayUtil";
import type { Point } from "@/model/Point";

export class VertexFixedDistanceSetter implements IPolygonConverter {
    private readonly fixedDistance: number;
    constructor(fixedDistance: number) {
        this.fixedDistance = fixedDistance;
    }

    public convert(toConvert: Polygon[]): void {
        for (const polygon of toConvert) {
            this.setFixedDistanceBetweenPoints(polygon);
        }
    }

    public setFixedDistanceBetweenPoints(polygon: Polygon): void {
        const totalDistance = calculatePolylineLength(polygon);
        const expectedPointAmount = Math.round(totalDistance / this.fixedDistance);

        if (polygon.getVerticesCount() <= 1) return;

        if (polygon.getVerticesCount() === expectedPointAmount) {
            this.evenlySpacePoints(polygon);
            return;
        }

        const vertices = polygon.getVertices();
        const initialSize = polygon.getVerticesCount();
        if (initialSize > expectedPointAmount) {
            // remove middle elements until we have expected count (minus 1? replicating Java logic)
            for (let i = 0; i < (initialSize - (expectedPointAmount - 1)); i++) {
                deleteMiddleElement(vertices);
                this.evenlySpacePoints(polygon);
            }
        } else {
            // pad with copies of last vertex
            for (let i = 0; i < (expectedPointAmount - initialSize); i++) {
                vertices.push(vertices[polygon.getVerticesCount() - 1]);
                this.evenlySpacePoints(polygon);
            }
        }
    }

    private evenlySpacePoints(polygon: Polygon): void {
        if (polygon.getVerticesCount() < 2)
            return;

        const totalLength = calculatePolylineLength(polygon);
        const targetSpacing = totalLength / (polygon.getVerticesCount() - 1);
        const vertices = polygon.getVertices();
        const segmentLengths = this.calculateSegmentLengths(polygon, vertices);

        const evenlySpaced = this.interpolateVertices(polygon, vertices, targetSpacing, segmentLengths);
        const arr = polygon.getVertices();
        arr.splice(0, arr.length, ...evenlySpaced);
    }

    private interpolateVertices(polygon: Polygon, vertices: Point[], targetSpacing: number, segmentLengths: number[]): Point[] {
        const evenlySpacedPoints: Point[] = [];
        evenlySpacedPoints.push(vertices[0]);

        let accumulatedDistance = 0;
        let currentSegment = 0;

        for (let i = 1; i < polygon.getVerticesCount() - 1; i++) {
            const targetDistance = i * targetSpacing;

            while (currentSegment < segmentLengths.length &&
                   accumulatedDistance + segmentLengths[currentSegment] < targetDistance) {
                accumulatedDistance += segmentLengths[currentSegment];
                currentSegment++;
            }

            if (currentSegment < segmentLengths.length) {
                const remainingDistance = targetDistance - accumulatedDistance;
                const segmentLength = segmentLengths[currentSegment];
                const t = segmentLength === 0 ? 0 : remainingDistance / segmentLength;
                const p1 = vertices[currentSegment];
                const p2 = vertices[currentSegment + 1];
                evenlySpacedPoints.push(this.interpolate(p1, p2, t));
            }
        }

        evenlySpacedPoints.push(vertices[polygon.getVerticesCount() - 1]);
        return evenlySpacedPoints;
    }

    private calculateSegmentLengths(_polygon: Polygon, vertices: Point[]): number[] {
        const segmentLengths: number[] = [];
        for (let i = 1; i < vertices.length; i++) {
            const length = calcDistanceBetweenPoints(vertices[i-1], vertices[i]);
            segmentLengths.push(length);
        }

        return segmentLengths;
    }

    private interpolate(a: Point, b: Point, t: number): Point {
        const x = a.x + t * (b.x - a.x);
        const y = a.y + t * (b.y - a.y);
        return { x, y };
    }
}