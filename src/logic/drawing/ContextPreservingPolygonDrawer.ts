import type { ColoredPolygon } from "@/model/ColoredPolygon";
import type { IPolygonDrawer } from "./IPolygonDrawer";
import type { Polygon } from "@/model/Polygon";

export abstract class ContextPreservingPolygonDrawer implements IPolygonDrawer {
  protected readonly lineWidth: number;
  private readonly lineCap: CanvasLineCap;

  constructor(lineWidth: number);
  constructor(lineWidth: number, lineCap: CanvasLineCap);
  constructor(lineWidth: number, lineCap: CanvasLineCap = "round") {
    this.lineWidth = lineWidth;
    this.lineCap = lineCap;
  }

  public drawPolygon(gc: CanvasRenderingContext2D, polygon: Polygon): ColoredPolygon | null {
    if (polygon.getVerticesCount() < 2) {
      return null;
    }

    // Save previous context state
    const prevLineCap = gc.lineCap;
    const prevStrokeStyle = gc.strokeStyle;
    const prevLineWidth = gc.lineWidth;
    const blendMode = gc.globalCompositeOperation;

    // Set new context styles
    gc.lineCap = this.lineCap;
    gc.lineWidth = this.lineWidth;

    const returnValue = this.doDrawPolygon(gc, polygon);

    // Restore previous context styles
    gc.lineCap = prevLineCap;
    gc.strokeStyle = prevStrokeStyle;
    gc.lineWidth = prevLineWidth;
    gc.globalCompositeOperation = blendMode;

    return returnValue;
  }

  protected abstract doDrawPolygon(gc: CanvasRenderingContext2D, polygon: Polygon): ColoredPolygon | null;
}