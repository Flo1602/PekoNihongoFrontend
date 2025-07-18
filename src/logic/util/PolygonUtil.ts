import type { Point } from "@/model/Point";
import type { Polygon } from "@/model/Polygon";

export function calculatePolylineLength(polygon: Polygon): number {
    const n = polygon.getVerticesCount();
    if (n < 2) 
        return 0;

    const v = polygon.getVertices();
    let sum = 0;

    for (let i = 1; i < n; i++) {
        sum += calcDistanceBetweenPoints(v[i-1], v[i]);
    }

    return sum;
}

// Euclidean distance.
export function calcDistanceBetweenPoints(a: Point, b: Point): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
}

// Index of closest vertex in polygon to given point.
export function getVertexIndexOfClosestVertex(vertexToCompare: Point, polygonToSearchIn: Polygon): number {
    const n = polygonToSearchIn.getVerticesCount();
    if (n === 0)
        return -1;

    const v = polygonToSearchIn.getVertices();
    let closest = 0;
    let min = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i++) {
        const d = calcDistanceBetweenPoints(vertexToCompare, v[i]);
        if (d < min) {
            min = d;
            closest = i;
        }
    }

    return closest;
}

/**
 * Returns the absolute angular difference, normalized to [0,1],
 * between vectors (sourceA->sourceB) and (toCheckA->toCheckB).
 * In the Java original, degrees/180.0 was used.
 */
export function getVertexVectorDirectionDiff(sourceA: Point, sourceB: Point, toCheckA: Point, toCheckB: Point): number {
    const v1x = sourceB.x - sourceA.x;
    const v1y = sourceB.y - sourceA.y;
    const v2x = toCheckB.x - toCheckA.x;
    const v2y = toCheckB.y - toCheckA.y;

    const dot = v1x * v2x + v1y * v2y;
    const mag1 = Math.sqrt(v1x*v1x + v1y*v1y);
    const mag2 = Math.sqrt(v2x*v2x + v2y*v2y);
    if (mag1 === 0 || mag2 === 0) 
        return 0;

    let cosTheta = dot / (mag1 * mag2);

    if (cosTheta > 1) 
        cosTheta = 1;
    else if (cosTheta < -1) 
        cosTheta = -1;

    const thetaRad = Math.acos(cosTheta);
    const thetaDeg = thetaRad * 180 / Math.PI;
    return thetaDeg / 180.0;
}