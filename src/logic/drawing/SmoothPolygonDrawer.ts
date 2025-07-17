import type { Color } from "@/model/Color";
import { ColoredPolygon } from "@/model/ColoredPolygon";
import type { Polygon } from "@/model/Polygon";
import { ContextPreservingPolygonDrawer } from "./ContextPreservingPolygonDrawer";

export class SmoothPolygonDrawer extends ContextPreservingPolygonDrawer {
    private readonly strokeColor: Color;

    constructor(lineWidth: number, strokeColor: Color) {
        super(lineWidth);
        this.strokeColor = strokeColor;
    }

    protected doDrawPolygon(gc: CanvasRenderingContext2D, polygon: Polygon): ColoredPolygon | null {
        const vertices = polygon.getVertices();
        const vertexCount = polygon.getVerticesCount();

        if (vertexCount < 3) {
            return null; // Not enough points to draw smooth polygon
        }

        gc.beginPath();
        gc.moveTo(vertices[0].x, vertices[0].y);
        gc.strokeStyle = this.strokeColor.toRGBA();
        gc.globalCompositeOperation = "source-over"; // equivalent to BlendMode.SRC_OVER
        gc.lineWidth = this.lineWidth;

        for (let i = 1; i < vertexCount - 2; i++) {
            const currentVertex = vertices[i];
            const nextVertex = vertices[i + 1];
            const intermediateX = (currentVertex.x + nextVertex.x) / 2;
            const intermediateY = (currentVertex.y + nextVertex.y) / 2;

            gc.quadraticCurveTo(currentVertex.x, currentVertex.y, intermediateX, intermediateY);
        }

        // Draw last segment
        const secondToLastVertex = vertices[vertexCount - 2];
        const lastVertex = vertices[vertexCount - 1];
        gc.quadraticCurveTo(
            secondToLastVertex.x,
            secondToLastVertex.y,
            lastVertex.x,
            lastVertex.y
        );

        gc.stroke();

        // Fill colors array with strokeColor repeated for each vertex
        const colors = new Array<Color>(vertexCount).fill(this.strokeColor);

        return new ColoredPolygon(vertices, colors);
    }
}