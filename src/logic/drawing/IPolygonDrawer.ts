import type { ColoredPolygon } from "@/model/ColoredPolygon";
import type { Polygon } from "@/model/Polygon";

export interface IPolygonDrawer {
    drawPolygon(canvas: HTMLCanvasElement | null, polygon: Polygon): ColoredPolygon | null;
}