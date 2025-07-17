import type { Polygon } from "@/model/Polygon";
import { ContextPreservingPolygonDrawer } from "./ContextPreservingPolygonDrawer";
import { ColoredPolygon } from "@/model/ColoredPolygon";
import { Color } from "@/model/Color";

export class LayeredGradientPolygonDrawer extends ContextPreservingPolygonDrawer {
    private readonly gradientLines: number;
    private readonly maxGradientLineWidth: number;
    private readonly maxHue: number;

    constructor(
        minGradientLineWidth: number,
        gradientLines: number,
        maxGradientLineWidth: number,
        maxHue: number
    ) {
        super(minGradientLineWidth);
        this.gradientLines = gradientLines;
        this.maxGradientLineWidth = maxGradientLineWidth;
        this.maxHue = maxHue;
    }

    protected doDrawPolygon(gc: CanvasRenderingContext2D, polygon: Polygon): ColoredPolygon | null {
        const gradientZoneSize = this.maxGradientLineWidth - this.lineWidth;
        const gradientLineStepSize = gradientZoneSize / this.gradientLines;
        let currentGradientLineWidth = this.maxGradientLineWidth;

        let colors: Color[] = [];

        for (let currGradientLine = 0; currGradientLine <= this.gradientLines; currGradientLine++) {
            const saturation = (currGradientLine + 1) / (this.gradientLines + 1);
            gc.lineWidth = currentGradientLineWidth;

            colors = this.drawGradientLine(gc, polygon, saturation);

            currentGradientLineWidth -= gradientLineStepSize;
        }

        if (colors.length === 0) return null;

        return new ColoredPolygon(polygon.getVertices(), colors);
    }

    private drawGradientLine(gc: CanvasRenderingContext2D, polygon: Polygon, saturation: number): Color[] {
        const colors: Color[] = [];
        const vertices = polygon.getVertices();
        const vertexCount = polygon.getVerticesCount();

        for (let i = 1; i < vertexCount; i++) {
            const fromVertex = vertices[i - 1];
            const toVertex = vertices[i];

            const progress = (i - 1) / vertexCount;
            const color = Color.hsb(this.maxHue * progress, saturation, 1.0);

            colors.push(color);
            gc.strokeStyle = color.toRGBA();
            gc.beginPath();
            gc.moveTo(fromVertex.x, fromVertex.y);
            gc.lineTo(toVertex.x, toVertex.y);
            gc.stroke();
        }

        // Add last color again (equivalent to colors.getLast() in Java)
        if (colors.length > 0) {
            colors.push(colors[colors.length - 1]);
        }

        return colors;
    }
}