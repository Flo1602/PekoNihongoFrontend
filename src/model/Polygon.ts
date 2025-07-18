import type { Point } from "./Point";

export class Polygon {
    private vertices: Point[];

    constructor();
    constructor(vertices: Point[]);
    constructor(vertices?: Point[]) {
        this.vertices = vertices ?? [];
    }

    public getVertices(): Point[] {
        return this.vertices;
    }

    public getVerticesCount(): number {
        return this.vertices.length;
    }
}