import type { Polygon } from "@/model/Polygon";
import type { ITraceVerificationLogic } from "./ITraceVerificationLogic";
import type { VerifyResult } from "./VerifyResult";
import type { VerificationOptions } from "./VerificationOptions";
import type { IPolygonConverter } from "@/logic/provider/polygon/IPolygonConverter";
import type { IPolygonDrawer } from "@/logic/drawing/IPolygonDrawer";
import { LayeredGradientPolygonDrawer } from "@/logic/drawing/LayeredGradientPolygonDrawer";
import { DottedColorProvidedPolygonDrawer } from "@/logic/drawing/DottedColorProvidedPolygonDrawer";
import { Color } from "@/model/Color";
import type { IColorProvider } from "@/logic/provider/color/IColorProvider";
import type { ColoredPolygon } from "@/model/ColoredPolygon";
import { getVertexIndexOfClosestVertex, getVertexVectorDirectionDiff } from "@/logic/util/PolygonUtil";
import type { Invalidator } from "./Invalidator";

const maxGradientHue = 270;
const whiteBaseColor = new Color(1.0, 1.0, 1.0);

export class VerificationLogic implements ITraceVerificationLogic {
    private readonly toVerifyPolygonConverter: IPolygonConverter;
    private readonly verificationOptions: VerificationOptions;
    private readonly sourceDrawer: IPolygonDrawer;
    private readonly toVerifyDrawer: IPolygonDrawer;
    private readonly sourceCanvas: HTMLCanvasElement;
    private readonly toVerifyCanvas: HTMLCanvasElement;
    private readonly debugCanvas: HTMLCanvasElement;
    private readonly dottedColorPolygonColorProvider: IColorProvider = {
        getColor: this.provideVerificationColor.bind(this),
    };

    private coloredSourcePolygon: ColoredPolygon | null = null;
    private currentMaxHue: number = 0.0;
    private currentTry = 0;

    constructor(
        verificationOptions: VerificationOptions,
        toVerifyPolygonConverter: IPolygonConverter
    ) {
        this.verificationOptions = verificationOptions;
        this.toVerifyPolygonConverter = toVerifyPolygonConverter;

        this.sourceDrawer = new LayeredGradientPolygonDrawer(
            verificationOptions.minGradientLineWidth,
            verificationOptions.gradientLines,
            verificationOptions.maxGradientLineWidth,
            maxGradientHue
        );

        this.toVerifyDrawer = new DottedColorProvidedPolygonDrawer(
            verificationOptions.toVerifyDotSize,
            this.dottedColorPolygonColorProvider
        );

        this.sourceCanvas = this.createCanvas(verificationOptions.fieldWidth, verificationOptions.fieldHeight);
        this.toVerifyCanvas = this.createCanvas(verificationOptions.fieldWidth, verificationOptions.fieldHeight);
        this.debugCanvas = this.createCanvas(verificationOptions.fieldWidth, verificationOptions.fieldHeight)
    }

    public verify(source: Polygon, toVerify: Polygon): VerifyResult {
        const polygonsToConvert: Polygon[] = [toVerify, source];
        this.toVerifyPolygonConverter.convert(polygonsToConvert);

        this.currentMaxHue = Number.MIN_VALUE;
        this.clearCanvas(this.sourceCanvas, true);
        this.clearCanvas(this.toVerifyCanvas, true);
        this.clearCanvas(this.debugCanvas, false);

        const sourceCtx = this.sourceCanvas.getContext("2d");
        const toVerifyCtx = this.toVerifyCanvas.getContext("2d");

        if (!sourceCtx || !toVerifyCtx) {
            throw new Error("Canvas 2D contexts could not be retrieved.");
        }

        this.coloredSourcePolygon = this.sourceDrawer.drawPolygon(sourceCtx, source);
        this.toVerifyDrawer.drawPolygon(toVerifyCtx, toVerify);

        if (this.verificationOptions.debug) {
            this.copyContent(this.sourceCanvas, this.debugCanvas);
            this.copyContent(this.toVerifyCanvas, this.debugCanvas);
        }

        return this.calculateVerificationResult(source, toVerify);
    }

    public resetTries(): void {
        this.currentTry = 0;
    }

    private calculateVerificationResult(source: Polygon, toVerify: Polygon): VerifyResult {
        let minWrongSimilarity = 1.0;
        let invalidator: Invalidator = "NO";

        const imageSimilarity = this.getImageSimilarity();
        const lengthSimilarity = this.getLengthSimilarity(source, toVerify);
        const angularSimilarity = this.getAngularSimilarity(source, toVerify);

        if (imageSimilarity < minWrongSimilarity && imageSimilarity < this.verificationOptions.minImageSimilarity) {
            minWrongSimilarity = imageSimilarity;
            invalidator = "IMAGE";
        }

        if (lengthSimilarity < minWrongSimilarity && lengthSimilarity < this.verificationOptions.minLengthSimilarity) {
            minWrongSimilarity = lengthSimilarity;
            invalidator = "LENGTH";
        }

        if (angularSimilarity < minWrongSimilarity && angularSimilarity < this.verificationOptions.minAngularSimilarity) {
            minWrongSimilarity = angularSimilarity;
            invalidator = "ANGLE";
        }

        const clampedWrongSimilarity = Math.max(0.0, Math.min(1.0, minWrongSimilarity));

        console.debug("\nSUMMARY:");
        console.debug("\tMin. result from:\t", invalidator, " similarity");
        console.debug("\tMin. result:\t\t", minWrongSimilarity);
        console.debug("\tClamped result:\t\t", clampedWrongSimilarity);

        const verifyResult = this.getVerifyResult(clampedWrongSimilarity);

        console.debug(`\tCurrent try:\t\t${this.currentTry} / ${this.verificationOptions.maxTries}`);
        console.debug(`\tResult:\t\t\t\t${verifyResult}`);

        return verifyResult;
    }

    private getAngularSimilarity(source: Polygon, toVerify: Polygon): number {
        if (source.getVerticesCount() < 3 || toVerify.getVerticesCount() < 3) {
            return 1.0;
        }

        const sampleSize = Math.min(
            this.verificationOptions.angularDiffMaxCheckSamples,
            Math.floor(source.getVerticesCount() / 2),
            Math.floor(toVerify.getVerticesCount() / 2)
        );

        let lastSourceStartIndex = -1;
        let lastToVerifyStartIndex = -1;

        let samplesTaken = 0;
        let totalAngularDiff = 0.0;

        for (let i = 0; i < sampleSize; i++) {
            const percentage = (1.0 / sampleSize) * i;
            const sourceStartIndex = Math.floor(source.getVerticesCount() * percentage);
            const toVerifyStartIndex = Math.floor(toVerify.getVerticesCount() * percentage);

            if (
                lastSourceStartIndex === sourceStartIndex ||
                lastToVerifyStartIndex === toVerifyStartIndex ||
                sourceStartIndex + 1 >= source.getVerticesCount() ||
                toVerifyStartIndex + 1 >= toVerify.getVerticesCount()
            ) {
                continue;
            }

            const sourceVertices = source.getVertices();
            const toVerifyVertices = toVerify.getVertices();

            const sourceA = sourceVertices[sourceStartIndex];
            const sourceB = sourceVertices[sourceStartIndex + 1];
            const toVerifyA = toVerifyVertices[toVerifyStartIndex];
            const toVerifyB = toVerifyVertices[toVerifyStartIndex + 1];

            const scaleFactor = 360.0 / this.verificationOptions.maxAngleRangeToScore;

            totalAngularDiff += getVertexVectorDirectionDiff(sourceA, sourceB, toVerifyA, toVerifyB) * scaleFactor;

            samplesTaken++;
            lastSourceStartIndex = sourceStartIndex;
            lastToVerifyStartIndex = toVerifyStartIndex;
        }

        const result = 1.0 - totalAngularDiff / samplesTaken;

        console.debug("\nANGULAR SIMILARITY:");
        console.debug("\tExpected samples:\t", sampleSize);
        console.debug("\tActual samples:\t\t", samplesTaken);
        console.debug("\tResult:\t\t\t\t", result);

        return result;
    }

    private getLengthSimilarity(source: Polygon, toVerify: Polygon): number {
        const sourceCount = source.getVerticesCount();
        const toVerifyCount = toVerify.getVerticesCount();
        const verticesCountDiff = Math.abs(sourceCount - toVerifyCount);

        const baseDiff = 1.0 - verticesCountDiff / sourceCount;
        const result = 1.0 - Math.pow(verticesCountDiff / sourceCount, 1.0 / this.verificationOptions.lengthCorrectnessExp);

        console.debug("\nLENGTH SIMILARITY:");
        console.debug("\tSource vertices:\t", sourceCount);
        console.debug("\tTo verify vertices:\t", toVerifyCount);
        console.debug("\tVertices diff:\t\t", verticesCountDiff);
        console.debug("\tBase diff:\t\t\t", baseDiff);
        console.debug("\tDiff factor:\t\t", result / baseDiff);
        console.debug("\tResult:\t\t\t\t", result);

        return result;
    }

    private getImageSimilarity(): number {
        const sourceCtx = this.sourceCanvas.getContext("2d");
        const toVerifyCtx = this.toVerifyCanvas.getContext("2d");

        if (!sourceCtx || !toVerifyCtx) {
            throw new Error("Canvas 2D context not available.");
        }

        const width = this.toVerifyCanvas.width;
        const height = this.toVerifyCanvas.height;

        const sourceData = sourceCtx.getImageData(0, 0, width, height).data;
        const toVerifyData = toVerifyCtx.getImageData(0, 0, width, height).data;

        let comparedPixels = 0;
        let totalColorDiff = 0;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const index = (y * width + x) * 4; // RGBA index

                // Extract RGBA for toVerify pixel normalized between 0-1
                const toVerifyColor = new Color(
                    toVerifyData[index] / 255,
                    toVerifyData[index + 1] / 255,
                    toVerifyData[index + 2] / 255,
                    toVerifyData[index + 3] / 255,
                );

                // Check if toVerifyColor equals BASE_COLOR — 
                // assuming BASE_COLOR is of the same shape, with r,g,b,a 0..1 floats
                if (toVerifyColor.equals(whiteBaseColor)) {
                    continue;
                }

                const sourceColor = new Color(
                    sourceData[index] / 255,
                    sourceData[index + 1] / 255,
                    sourceData[index + 2] / 255,
                    sourceData[index + 3] / 255,
                );

                comparedPixels++;
                const pixelDiff = this.calculateAvgColorDiff(toVerifyColor, sourceColor);
                totalColorDiff += pixelDiff;
            }
        }

        console.debug("\nIMAGE SIMILARITY:");
        console.debug("\tTotal color diff:\t", totalColorDiff);
        console.debug("\tCompared Pixels:\t", comparedPixels);

        let result = 1.0;

        if (comparedPixels !== 0) {
            result = 1.0 - totalColorDiff / comparedPixels;
        }

        console.debug("\tResult:\t\t\t\t", result);
        return result;
    }

    private calculateAvgColorDiff(a: Color, b: Color): number {
        const redDiff = this.calculateColorChannelDiff(a.getRed(), b.getRed());
        const greenDiff = this.calculateColorChannelDiff(a.getGreen(), b.getGreen());
        const blueDiff = this.calculateColorChannelDiff(a.getBlue(), b.getBlue());

        return redDiff + greenDiff + blueDiff;
    }

    private calculateColorChannelDiff(channelA: number, channelB: number): number {
        return Math.pow(Math.abs(channelA - channelB), 1.0 / this.verificationOptions.colorCorrectnessExp);
    }

    private getVerifyResult(result: number): VerifyResult {
        this.currentTry++;

        let incorrectResult: VerifyResult = "INCORRECT";
        if (this.currentTry >= this.verificationOptions.maxTries) {
            incorrectResult = "NO_MORE_TRIES";
        }

        return result < 1.0 ? incorrectResult : "CORRECT";
    }


    private createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    private provideVerificationColor(currentVertex: number, polygon: Polygon): Color {
        if (!this.coloredSourcePolygon)
            return whiteBaseColor;

        const vertexToCompare = polygon.getVertices()[currentVertex];
        const index = getVertexIndexOfClosestVertex(vertexToCompare, this.coloredSourcePolygon);
        const closestVerificationColor = this.coloredSourcePolygon.getColors()[index];
        let verificationHue = closestVerificationColor.getHue();

        if (verificationHue > this.currentMaxHue)
            this.currentMaxHue = verificationHue;
        else
            verificationHue = this.currentMaxHue;

        return Color.hsb(verificationHue, 1.0, 1.0);
    }

    private clearCanvas(canvas: HTMLCanvasElement, setBackground: boolean) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;

        if (setBackground) {
            ctx.fillStyle = whiteBaseColor.toRGBA();
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    private copyContent(sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) {
        const sourceCtx = sourceCanvas.getContext('2d');
        const targetCtx = targetCanvas.getContext('2d');
        if (!sourceCtx || !targetCtx)
            return;

        const width = sourceCanvas.width;
        const height = sourceCanvas.height;

        const imageData = sourceCtx.getImageData(0, 0, width, height);
        const data = imageData.data; 

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3] / 255;

                const color = new Color(r, g, b, a);
                if (!color.equals(whiteBaseColor)) {
                    targetCtx.fillStyle = color.toRGBA();
                    targetCtx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}