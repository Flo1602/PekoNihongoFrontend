import type { ColoredPolygon } from "@/model/ColoredPolygon";
import type { Polygon } from "@/model/Polygon";

export interface IPolygonDrawer {
    drawPolygon(gc: CanvasRenderingContext2D, polygon: Polygon): ColoredPolygon | null;
}