import {useContext, useEffect, useRef, useState, type RefObject} from "react";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import { useDebounce } from "react-use";
import type { TraceMode } from "@/logic/tracing/TraceMode";
import type { TraceLineOptions } from "@/logic/tracing/TraceLineOptions";
import { Color } from "@/model/Color";
import type { VerificationOptions } from "@/logic/tracing/verification/VerificationOptions";
import type { IFileProvider } from "@/logic/provider/file/IFileProvider";
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

type DrawingState = {
    traceLogic: ITraceLogic<string> | null;
    hintLineDrawer: IPolygonDrawer | null;
    correctingLineDrawer: IPolygonDrawer | null;
    traceOptions: TraceLineOptions| null;
    traceLineListener: ITraceLineListener | null;

}

type Point = {
    x: number;
    y: number;
}

interface Props {
    traceMode: TraceMode,
    debug?: boolean
}

const DEFAULT_STATE: DrawingState = { traceLogic: null, hintLineDrawer: null, correctingLineDrawer: null, traceOptions: null, traceLineListener: null };

const KanjiDraw = (props: Props) => {
    const learnDataContext = useContext(LearnDataContext);
    const learnManagerContext = useContext(LearnManagerContext);

    const hintCanvasRef = useRef<HTMLCanvasElement>(null);
    const hintArrowCanvasRef = useRef<HTMLCanvasElement>(null);
    const userCanvasRef = useRef<HTMLCanvasElement>(null);

    const [drawingState, setDrawingState] = useState<DrawingState>(DEFAULT_STATE);
    const [debouncedDrawingState, setDebouncedDrawingState] = useState<DrawingState>(DEFAULT_STATE);

    const callback = useRef<ITraceFinishedCallback | null>(null);
    const lastPoint = useRef<Point | null>(null);
    const drawnPoints = useRef<Point[]>([]);
    const correctedPolygons = useRef<Polygon[]>([]);
    const correctlyDrawnPolygons = useRef<Polygon[]>([]);

    useDebounce(() => setDebouncedDrawingState(drawingState), 100, [drawingState]);

    useEffect(() => {
        if (!learnDataContext?.kanji || !learnManagerContext || drawingState.traceLogic)
            return;

        const handleResize = async () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const size = 500; //(windowWidth > windowHeight ? windowHeight : windowWidth) / 2;

            const traceOptions: TraceLineOptions = {
                drawingColor: new Color(1.0, 1.0, 1.0), // White
                hintColor: new Color(0.3, 0.3, 0.3),  // Gray
                fieldWidth: size,
                fieldHeight: size,
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

            const onMouseDown = (e: MouseEvent) => {
                if (e.button === 0) {
                    drawNewPoint(userCanvasRef.current, e.offsetX, e.offsetY);
                } else if (e.button === 1) {
                    showDebugInfos();
                }
            };

            const onMouseMove = (e: MouseEvent) => {
                if (e.buttons === 1) {
                    drawNewPoint(userCanvasRef.current, e.offsetX, e.offsetY);
                }
            };

            const onMouseOut = (e: MouseEvent) => {
                if (e.buttons === 1) {
                    disableUserDrawingFinishPolygon();
                }
            };

            const onMouseUp = (e: MouseEvent) => {
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

                canvas.removeEventListener('mousedown', onMouseDown);
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('mouseout', onMouseOut);
                canvas.removeEventListener('mouseup', onMouseUp);
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

                canvas.addEventListener('mousedown', onMouseDown);
                canvas.addEventListener('mousemove', onMouseMove);
                canvas.addEventListener('mouseout', onMouseOut);
                canvas.addEventListener('mouseup', onMouseUp);
            };

            const setIsFinished = (isFinished: boolean) => {
                const canvas = userCanvasRef.current;
                
                if (!canvas) {
                    console.error("User canvas not available");
                    return;
                }

                const onMouseDown = (e: MouseEvent) => {
                    if (e.button === 2) {
                        drawUserCanvasPolygons(correctlyDrawnPolygons.current);
                    } else if (e.button === 1) {
                        showDebugInfos();
                    }
                };

                const onMouseUp = (e: MouseEvent) => {
                    if (e.button === 2 || e.button === 1) {
                        drawUserCanvasPolygons(correctedPolygons.current);
                    }
                };

                if (isFinished) {
                    canvas.addEventListener('mousedown', onMouseDown);
                    canvas.addEventListener('mouseup', onMouseUp);
                } else {
                    canvas.removeEventListener('mousedown', onMouseDown);
                    canvas.removeEventListener('mouseup', onMouseUp);
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
            
            setDrawingState({
                traceLogic: traceLogic,
                hintLineDrawer: hintLineDrawer,
                correctingLineDrawer: correctingLineDrawer,
                traceOptions: traceOptions,
                traceLineListener: traceLineListener
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            if (drawingState.traceLogic && drawingState.traceLineListener)
                drawingState.traceLogic.removeTraceLineListener(drawingState.traceLineListener);
        }
    }, [learnDataContext, learnManagerContext]);

    useEffect(() => {
        if (drawingState?.traceLogic && learnDataContext?.kanji?.symbol) {
            const logic = drawingState.traceLogic;

            logic.changeTarget(learnDataContext.kanji.symbol);
            logic.startTracing(props.traceMode);
        }
    }, [debouncedDrawingState, learnDataContext]);

    const setCanvasSize = (canvasRef: RefObject<HTMLCanvasElement | null>, traceOptions: TraceLineOptions) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;

        canvas.width = traceOptions.fieldWidth ?? 0;
        canvas.height = traceOptions.fieldHeight ?? 0;
    };

    useEffect(() => {
        if (!debouncedDrawingState.traceOptions)
            return;

        //canvas.width = debouncedDrawingState.size;
        //canvas.height = debouncedDrawingState.size;

        setCanvasSize(hintCanvasRef, debouncedDrawingState.traceOptions);
        setCanvasSize(hintArrowCanvasRef, debouncedDrawingState.traceOptions);
        setCanvasSize(userCanvasRef, debouncedDrawingState.traceOptions);

        // TODO reset current drawing / validation stuff -> move to other effect
    }, [debouncedDrawingState]);

    return (
        <div className="flex-1 flex">
            <div className="flex justify-center items-center">
                <canvas ref={hintCanvasRef} className="aspect-square bg-base-100 rounded-2xl z-0, absolute" />
                <canvas ref={hintArrowCanvasRef} className="aspect-square rounded-2xl z-1 absolute" />
                <canvas ref={userCanvasRef} className="aspect-square rounded-2xl z-2 absolute" />
            </div>
        </div>
    );
};
export default KanjiDraw
