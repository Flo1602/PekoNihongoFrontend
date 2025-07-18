import type { Polygon } from "@/model/Polygon";

export interface ITraceFinishedCallback {
    onTraceFinished(tracedPolygon: Polygon): boolean;
}