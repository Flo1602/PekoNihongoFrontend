import type { Polygon } from "@/model/Polygon";

export interface IPolygonConverter {
    convert(toConvert: Polygon[]): void;
}