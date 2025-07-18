import type { Polygon } from "@/model/Polygon";
import type { ITraceFinishedCallback } from "./ITraceFinishCallback";
import type { Point } from "@/model/Point";

export interface ITraceLineListener {
  onShowHint(polygonToShowHintFor: Polygon): void;

  onDrawCorrectedLines(correctedLines: Polygon[]): void;

  onBeginTracing(callback: ITraceFinishedCallback): void;

  onShowHintArrow(from: Point | null, to: Point | null): void;

  onResetProgress(): void;

  onFinished(correct: boolean): void;
}