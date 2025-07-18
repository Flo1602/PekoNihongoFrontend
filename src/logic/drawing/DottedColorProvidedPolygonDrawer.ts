import type { Polygon } from "@/model/Polygon";
import type { IColorProvider } from "../provider/color/IColorProvider";
import { ContextPreservingPolygonDrawer } from "./ContextPreservingPolygonDrawer";
import { ColoredPolygon } from "@/model/ColoredPolygon";
import type { Color } from "@/model/Color";

export class DottedColorProvidedPolygonDrawer extends ContextPreservingPolygonDrawer {
    private readonly colorProvider: IColorProvider;

    constructor(lineWidth: number, colorProvider: IColorProvider) {
        super(lineWidth);
        this.colorProvider = colorProvider;
    }

    protected doDrawPolygon(gc: CanvasRenderingContext2D, polygon: Polygon): ColoredPolygon | null {
        const vertices = polygon.getVertices();
        const colors: Color[] = [];

        for (let i = 0; i < polygon.getVerticesCount(); i++) {
            const color = this.colorProvider.getColor(i, polygon);
            gc.fillStyle = color.toHex();
            colors.push(color);

            const pointOffset = this.lineWidth / 2;
            const vertex = vertices[i];

            gc.beginPath();
            gc.ellipse(
                vertex.x,
                vertex.y,
                pointOffset,
                pointOffset,
                0,
                0,
                2 * Math.PI
            );
            gc.fill();
        }

        return new ColoredPolygon(vertices, colors);
    }
}