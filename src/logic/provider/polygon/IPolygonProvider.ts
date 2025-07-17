import type { Polygon } from "@/model/Polygon";

export interface IPolygonProvider {
    getAllPolygons(): Promise<Polygon[]>;
}