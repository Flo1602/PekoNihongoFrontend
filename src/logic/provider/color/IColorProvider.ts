import type { Color } from "@/model/Color";
import type { Polygon } from "@/model/Polygon";

export interface IColorProvider {
    getColor(currentVertex: number, polygon: Polygon): Color;
}