import { Polygon } from "@/model/Polygon";
import type { IPolygonProvider } from "../provider/polygon/IPolygonProvider";
import type { ITraceLineListener } from "./ITraceLineListener";
import type { ITraceLogic } from "./ITraceLogic";
import type { ITraceTargetChanger } from "./ITraceTargetChanger";
import type { TraceMode } from "./TraceMode";
import type { ITraceVerificationLogic } from "./verification/ITraceVerificationLogic";
import type { ITraceFinishedCallback } from "./ITraceFinishCallback";
import type { Point } from "@/model/Point";

export class UnicodeTraceLineLogic implements ITraceLogic<string> {
    private readonly verificationLogic: ITraceVerificationLogic;
    private readonly polygonProvider: IPolygonProvider;
    private readonly targetChanger: ITraceTargetChanger<string>;
    private readonly traceFinishedCallback: ITraceFinishedCallback = {
        onTraceFinished: this.onTraceFinished.bind(this),
    };
    
    private loadedPolygons: Polygon[] = [];
    private tranceLineListeners: ITraceLineListener[] = [];
    private nextPolygonToDraw = 0;
    private currentTraceMode: TraceMode | null = null;

    constructor(verificationLogic: ITraceVerificationLogic, polygonProvider: IPolygonProvider, targetChanger: ITraceTargetChanger<string>) {
        this.verificationLogic = verificationLogic;
        this.polygonProvider = polygonProvider;
        this.targetChanger = targetChanger;
    }
    
    public async startTracing(traceMode: TraceMode): Promise<void> {
        // DO NOT CHANGE STATE BEFORE AWAIT !!!
        const loadedPolygons = await this.loadPolygons();

        this.reset();
        this.currentTraceMode = traceMode;
        this.loadedPolygons = loadedPolygons;
        this.nextPolygonToDraw = this.loadedPolygons.length === 0 ? -1 : 0;

        if (traceMode === "ALL_HINTS") {
            for (const polygon of this.loadedPolygons) {
                this.iterateListeners(listener => listener.onShowHint(polygon));
            }
        }

        this.traceNextPolygon();
    }

    public addTraceLineListener(listenerToAdd: ITraceLineListener): void {
        if (!this.tranceLineListeners.includes(listenerToAdd))
            this.tranceLineListeners.push(listenerToAdd);
    }

    public removeTraceLineListener(listenerToRemove: ITraceLineListener): void {
        this.tranceLineListeners = this.tranceLineListeners.filter(listener => listener !== listenerToRemove);
    }

    public getVerificationLogic(): ITraceVerificationLogic {
        return this.verificationLogic;
    }

    public changeTarget(targetIdentifier: string): void {
        this.targetChanger.changeTarget(targetIdentifier);
    }

    private iterateListeners(consumer: (listener: ITraceLineListener) => void): void {
        for (const listener of this.tranceLineListeners) {
            consumer(listener);
        }
    }

    private reset(): void {
        this.iterateListeners(listener => listener.onResetProgress());
        this.nextPolygonToDraw = 0;
        this.verificationLogic.resetTries();
    }

    private async loadPolygons(): Promise<Polygon[]> {
        return [... await this.polygonProvider.getAllPolygons()];
    }

    private traceNextPolygon(): void {
        if (this.loadedPolygons.length <= this.nextPolygonToDraw) {
            this.iterateListeners(l => l.onShowHintArrow(null, null));
            this.iterateListeners(l => l.onFinished(true));
            return;
        }

        const source = this.loadedPolygons[this.nextPolygonToDraw];

        if (this.currentTraceMode === "NEXT_HINT") {
            this.iterateListeners(l => l.onShowHint(source));
        }

        if (this.currentTraceMode !== 'NO_HINTS' || this.nextPolygonToDraw === 0) {
            this.showHintArrow(source);
        }

        this.iterateListeners(l => l.onBeginTracing(this.traceFinishedCallback));
    }

    private showHintArrow(polygon: Polygon) {
        const vertices = polygon.getVertices();
        let hintArrowFrom: Point | null = null;
        let hintArrowTo: Point | null = null;

        if (polygon.getVerticesCount() > 6) {
            hintArrowFrom = vertices[2];
            hintArrowTo = vertices[Math.ceil(polygon.getVerticesCount() * 0.3)];
        } else if (polygon.getVerticesCount() > 3) {
            hintArrowFrom = vertices[1];
            hintArrowTo = vertices[polygon.getVerticesCount() - 2];
        } else if (polygon.getVerticesCount() > 1) {
            hintArrowFrom = vertices[0];
            hintArrowTo = vertices[polygon.getVerticesCount() - 1];
        }

        this.iterateListeners(l => l.onShowHintArrow(hintArrowFrom, hintArrowTo));
    }

    private onTraceFinished(tracedPolygon: Polygon): boolean {
        const source = this.loadedPolygons[this.nextPolygonToDraw];
        const verifyResult = this.verificationLogic.verify(source, tracedPolygon);

        if (verifyResult === "NO_MORE_TRIES") {
            this.iterateListeners(l => l.onResetProgress());

            for (const loadedPolygon of this.loadedPolygons) {
                this.iterateListeners(l => l.onShowHint(loadedPolygon));
            }

            this.iterateListeners(l => l.onFinished(false));
            return false;
        }

        if (verifyResult !== "INCORRECT") {
            this.nextPolygonToDraw++;
        }

        if (verifyResult === "CORRECT") {
            this.verificationLogic.resetTries();
        }

        const correctedPolys = this.loadedPolygons.slice(0, this.nextPolygonToDraw);
        this.iterateListeners(l => l.onDrawCorrectedLines(correctedPolys));
        this.traceNextPolygon();

        return verifyResult === "CORRECT";
        }
}