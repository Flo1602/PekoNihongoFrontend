import {useContext, useEffect, useRef, useState, type RefObject} from "react";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import type { TraceMode } from "@/logic/tracing/TraceMode";
import type { TraceLineOptions } from "@/logic/tracing/TraceLineOptions";
import { Color } from "@/model/Color";
import type { VerificationOptions } from "@/logic/tracing/verification/VerificationOptions";
import { UnicodeFilenameFileProvider } from "@/logic/provider/file/UnicodeFilenameFileProvider";
import type { ISvgPathParser } from "@/logic/parser/ISvgParser";
import { SvgPathParser } from "@/logic/parser/SvgParser";
import { SVGPolygonProvider, SvgPolyProviderOptions } from "@/logic/provider/polygon/SvgPolygonProvider";
import type { IPolygonConverter } from "@/logic/provider/polygon/IPolygonConverter";
import { PolygonScaler } from "@/logic/provider/polygon/PolygonScaler";
import { VertexFixedDistanceSetter } from "@/logic/provider/polygon/VertexFixedDistanceSetter";
import { Polygon } from "@/model/Polygon";
import type { IPolygonProvider } from "@/logic/provider/polygon/IPolygonProvider";
import type { ITraceVerificationLogic } from "@/logic/tracing/verification/ITraceVerificationLogic";
import { VerificationLogic } from "@/logic/tracing/verification/VerificationLogic";
import type { ITraceTargetChanger } from "@/logic/tracing/ITraceTargetChanger";
import type { ITraceLogic } from "@/logic/tracing/ITraceLogic";
import { UnicodeTraceLineLogic } from "@/logic/tracing/UnicodeTraceLineLogic";
import type { IPolygonDrawer } from "@/logic/drawing/IPolygonDrawer";
import { SmoothPolygonDrawer } from "@/logic/drawing/SmoothPolygonDrawer";
import type { ITraceLineListener } from "@/logic/tracing/ITraceLineListener";
import type { ITraceFinishedCallback } from "@/logic/tracing/ITraceFinishCallback";
import { LearnManagerContext } from "@/contexts/LearnManagerContext";
import { PolygonCenterer } from "@/logic/provider/polygon/PolygonCenterer";
import type { Point } from "@/model/Point";
import { useIsMobile } from "@/hooks/useIdMobile";

interface DrawingState {
    traceLogic: ITraceLogic<string> | null;
    hintLineDrawer: IPolygonDrawer | null;
    correctingLineDrawer: IPolygonDrawer | null;
    traceOptions: TraceLineOptions| null;
    traceLineListener: ITraceLineListener | null;
}

interface Props {
    traceMode: TraceMode,
    debug?: boolean
}

const DEFAULT_DRAWING_STATE: DrawingState = { traceLogic: null, hintLineDrawer: null, correctingLineDrawer: null, traceOptions: null, traceLineListener: null };

const KanjiDraw = (props: Props) => {
    const learnDataContext = useContext(LearnDataContext);
    const learnManagerContext = useContext(LearnManagerContext);    
    const isMobile = useIsMobile();

    const [drawingState, setDrawingState] = useState<DrawingState>(DEFAULT_DRAWING_STATE);
    const [viewportSizeState, setViewportSizeState] = useState<number>(0);

    const hintCanvasRef = useRef<HTMLCanvasElement>(null);
    const hintArrowCanvasRef = useRef<HTMLCanvasElement>(null);
    const userCanvasRef = useRef<HTMLCanvasElement>(null);
    const callback = useRef<ITraceFinishedCallback | null>(null);
    const lastPoint = useRef<Point | null>(null);
    const drawnPoints = useRef<Point[]>([]);
    const correctedPolygons = useRef<Polygon[]>([]);
    const correctlyDrawnPolygons = useRef<Polygon[]>([]);
    const viewportSizeRef = useRef<number>(0);

    useEffect(() => {
        viewportSizeRef.current = viewportSizeState;
    }, [viewportSizeState]);

    useEffect(() => {
        if (!learnDataContext?.kanji)
            return;

        console.debug("RELOAD TRACING LOGIC");
        const setCanvasSize = (canvasRef: RefObject<HTMLCanvasElement | null>, size: number) => {
            const canvas = canvasRef.current;
            if (!canvas)
                return;

            canvas.width = size;
            canvas.height = size;
        };

        const canvasSize = 500;
        setCanvasSize(hintCanvasRef, canvasSize);
        setCanvasSize(hintArrowCanvasRef, canvasSize);
        setCanvasSize(userCanvasRef, canvasSize);

        const traceOptions: TraceLineOptions = {
            drawingColor: new Color(1.0, 1.0, 1.0), // White
            hintColor: new Color(0.3, 0.3, 0.3),  // Gray
            fieldWidth: canvasSize,
            fieldHeight: canvasSize,
            lineWidth: 15
        };

        const verificationOptions: VerificationOptions = {
            gradientLines: 10,
            minGradientLineWidth: traceOptions.lineWidth * 2,
            maxGradientLineWidth: traceOptions.lineWidth * 7,
            toVerifyDotSize: traceOptions.lineWidth,
            colorCorrectnessExp: 0.6,
            lengthCorrectnessExp: 0.5,
            maxAngleRangeToScore: 180,
            angularDiffMaxCheckSamples: 20,
            maxTries: 3,
            minImageSimilarity: 0.6,
            minLengthSimilarity: 0.4,
            minAngularSimilarity: 0.6,
            fieldWidth: traceOptions.fieldWidth,
            fieldHeight: traceOptions.fieldHeight,
            debug: !!props.debug
        };

        const fileProvider = new UnicodeFilenameFileProvider(
            "http://localhost:8080/resources/kanji",
            "0",
            5,
            "svg"
        );

        const svgPathParser: ISvgPathParser = new SvgPathParser();
        const svgPolyProviderOptions = new SvgPolyProviderOptions(0.001, 5);

        const sourcePolygonProvider = new SVGPolygonProvider(
            fileProvider,
            svgPathParser,
            svgPolyProviderOptions
        );

        const scaler: IPolygonConverter = new PolygonScaler(4);
        const centerer: IPolygonConverter = new PolygonCenterer(traceOptions.fieldWidth, traceOptions.fieldHeight);
        const fixedDistanceSetter: IPolygonConverter = new VertexFixedDistanceSetter(5);
        const convertingPolygonProvider: IPolygonProvider = {
            async getAllPolygons() {
                const polygons = await sourcePolygonProvider.getAllPolygons();
                scaler.convert(polygons);
                centerer.convert(polygons);
                fixedDistanceSetter.convert(polygons);
                return polygons;
            }
        };

        const verificationLogic: ITraceVerificationLogic = new VerificationLogic(
            verificationOptions,
            fixedDistanceSetter
        );

        const targetChanger: ITraceTargetChanger<string> = {
            changeTarget(targetIdentifier) {
                fileProvider.setCharForFilename(targetIdentifier);
            }
        };

        const traceLogic: ITraceLogic<string> = new UnicodeTraceLineLogic(
            verificationLogic,
            convertingPolygonProvider,
            targetChanger
        );

        const clearCanvas = (canvas: HTMLCanvasElement | null) => {
            const ctx = canvas?.getContext('2d');
            if (!ctx)
                return;

            ctx.clearRect(0, 0, traceOptions.fieldWidth, traceOptions.fieldHeight);
        };

        const drawUserCanvasPolygons = (polygonsToDraw: Polygon[]) => {                
            clearCanvas(userCanvasRef.current);
            for (const polygonToDraw of polygonsToDraw) {
                correctingLineDrawer.drawPolygon(userCanvasRef.current, polygonToDraw);
            }
        };

        const drawNewPoint = (canvas: HTMLCanvasElement | null, x: number, y: number) => {
            const viewportMultiplyer = canvasSize / viewportSizeRef.current;
            x *= viewportMultiplyer;
            y *= viewportMultiplyer;

            const currentPoint: Point = { x: x, y: y };

            if (lastPoint.current) {
                const polygon = new Polygon();
                const verticies = polygon.getVertices();
                verticies.push(lastPoint.current);
                verticies.push(currentPoint);

                correctingLineDrawer.drawPolygon(canvas, polygon);
            }

            lastPoint.current = currentPoint;
            drawnPoints.current.push(currentPoint);
        };

        const overwriteCanvas = (source: HTMLCanvasElement, target: HTMLCanvasElement | null): void => {
            const targetCtx = target?.getContext('2d');
            if (!targetCtx)
                return;

            targetCtx.drawImage(source, 0, 0);
        };

        const showDebugInfos = () => {
            const verificationLogic = traceLogic.getVerificationLogic();

            if (verificationLogic instanceof VerificationLogic && !!props.debug) {
                const debugCanvas = verificationLogic.getDebugCanvas();
                if (debugCanvas)
                    overwriteCanvas(debugCanvas, userCanvasRef.current);
            }
        };

        const onPointerDown = (e: PointerEvent) => {
            if (e.button === 0) {
                drawNewPoint(userCanvasRef.current, e.offsetX, e.offsetY);
            } else if (e.button === 1) {
                showDebugInfos();
            }
        };

        const onPointerMove = (e: PointerEvent) => {
            if (e.buttons === 1) {
                drawNewPoint(userCanvasRef.current, e.offsetX, e.offsetY);
            }
        };

        const onPointerLeave = (e: PointerEvent) => {
            if (e.buttons === 1) {
                disableUserDrawingFinishPolygon();
            }
        };

        const onPointerUp = (e: PointerEvent) => {
            if (e.button === 0) {
                disableUserDrawingFinishPolygon();
            } else if (e.button === 1) {
                drawUserCanvasPolygons(correctedPolygons.current);
            }
        };

        const disableUserDrawingFinishPolygon = () => {
            const canvas = userCanvasRef.current;
            const ctx = canvas?.getContext('2d');

            if (!canvas || !ctx) {
                console.error("User canvas or context not available");
                return;
            }

            ctx.strokeStyle = traceOptions.drawingColor.toHex();
            ctx.lineCap = 'round';
            ctx.lineWidth = traceOptions.lineWidth;

            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerleave', onPointerLeave);
            canvas.removeEventListener('pointerup', onPointerUp);
            lastPoint.current = null;

            if (callback.current) {
                const drawnPolygon = new Polygon([... drawnPoints.current]);
                drawnPoints.current = [];
                if (callback.current.onTraceFinished(drawnPolygon))
                    correctlyDrawnPolygons.current.push(drawnPolygon);
            }
        };

        const enableUserDrawing = () => {
            const canvas = userCanvasRef.current;
            
            if (!canvas) {
                console.error("User canvas not available");
                return;
            }

            canvas.addEventListener('pointerdown', onPointerDown);
            canvas.addEventListener('pointermove', onPointerMove);
            canvas.addEventListener('pointerleave', onPointerLeave);
            canvas.addEventListener('pointerup', onPointerUp);
        };

        const onFinishedPointerDown = (e: PointerEvent) => {
            if (e.button === 2) {
                drawUserCanvasPolygons(correctlyDrawnPolygons.current);
            } else if (e.button === 1) {
                showDebugInfos();
            }
        };

        const onFinishedPointerUp = (e: PointerEvent) => {
            if (e.button === 2 || e.button === 1) {
                drawUserCanvasPolygons(correctedPolygons.current);
            }
        };

        const setIsFinished = (isFinished: boolean) => {
            const canvas = userCanvasRef.current;
            
            if (!canvas) {
                console.error("User canvas not available");
                return;
            }

            if (isFinished) {
                canvas.addEventListener('pointerdown', onFinishedPointerDown);
                canvas.addEventListener('pointerup', onFinishedPointerUp);
            } else {
                canvas.removeEventListener('pointerdown', onFinishedPointerDown);
                canvas.removeEventListener('pointerup', onFinishedPointerUp);
            }
        };

        const traceLineListener: ITraceLineListener = {
            onShowHint(polygonToShowHintFor: Polygon) {
                hintLineDrawer.drawPolygon(hintCanvasRef.current, polygonToShowHintFor);
            },
        
            onDrawCorrectedLines(correctedLines: Polygon[]) {
                correctedPolygons.current = correctedLines;
                drawUserCanvasPolygons(correctedPolygons.current);
            },
        
            onBeginTracing(cb: ITraceFinishedCallback) {
                callback.current = cb;
                enableUserDrawing();
            },
        
            onShowHintArrow(from: Point | null, to: Point | null) {
                // TODO implement
            },
        
            onResetProgress() {
                // updateWordWithKanji is missing here
                clearCanvas(userCanvasRef.current);
                clearCanvas(hintArrowCanvasRef.current);
                clearCanvas(hintCanvasRef.current);
                correctlyDrawnPolygons.current = [];
                correctedPolygons.current = [];
                setIsFinished(false);
            },
        
            onFinished(correct: boolean) {
                setIsFinished(true);
                const kanjiId = learnDataContext?.kanji?.id;
                if (kanjiId) {
                    learnDataContext?.setResults([{id: kanjiId, correct: correct}]);
                    learnManagerContext?.onComplete(correct);
                } else {
                    console.error("onFinished: Kanji was null");
                }
            }
        };

        traceLogic.addTraceLineListener(traceLineListener);
        const hintLineDrawer: IPolygonDrawer = new SmoothPolygonDrawer(traceOptions.lineWidth, traceOptions.hintColor);
        const correctingLineDrawer: IPolygonDrawer = new SmoothPolygonDrawer(traceOptions.lineWidth, traceOptions.drawingColor);
    
        clearCanvas(userCanvasRef.current);
        clearCanvas(hintCanvasRef.current);
        clearCanvas(hintArrowCanvasRef.current);
        setDrawingState({
            traceLogic: traceLogic,
            hintLineDrawer: hintLineDrawer,
            correctingLineDrawer: correctingLineDrawer,
            traceOptions: traceOptions,
            traceLineListener: traceLineListener
        });

        return () => {
            traceLogic.removeTraceLineListener(traceLineListener);
            const canvas = userCanvasRef.current;
            if (canvas) {
                canvas.removeEventListener('pointerdown', onFinishedPointerDown);
                canvas.removeEventListener('pointerup', onFinishedPointerUp);
                canvas.removeEventListener('pointerdown', onPointerDown);
                canvas.removeEventListener('pointermove', onPointerMove);
                canvas.removeEventListener('pointerleave', onPointerLeave);
                canvas.removeEventListener('pointerup', onPointerUp);
            }
        };
    }, [learnDataContext]);

    useEffect(() => {
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const windowRatio = isMobile ? 1.3 : 2.5;
            const newViewportSize = (windowWidth > windowHeight ? windowHeight : windowWidth) / windowRatio;
            console.debug("NEW VIEWPORT SIZE: " + newViewportSize);
            setViewportSizeState(newViewportSize);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [isMobile]);

    useEffect(() => {
        if (drawingState?.traceLogic && learnDataContext?.kanji?.symbol) {
            console.debug('CHANGE TARGET TO ' + learnDataContext.kanji.symbol);
            const logic = drawingState.traceLogic;
            logic.changeTarget(learnDataContext.kanji.symbol);
            logic.startTracing(props.traceMode);
        }
    }, [drawingState, learnDataContext]);

    return (
        <div className="flex-1 flex">
            <div className="flex justify-center items-center">
                <canvas ref={hintCanvasRef} className="aspect-square bg-base-100 rounded-2xl z-0, absolute touch-none" style={{ width: viewportSizeState, height: viewportSizeState }}/>
                <canvas ref={hintArrowCanvasRef} className="aspect-square rounded-2xl z-1 absolute touch-none" style={{ width: viewportSizeState, height: viewportSizeState }} />
                <canvas ref={userCanvasRef} 
                    className="aspect-square rounded-2xl z-2 absolute touch-none"
                    style={{ width: viewportSizeState, height: viewportSizeState }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                />
            </div>
        </div>
    );
};
export default KanjiDraw
