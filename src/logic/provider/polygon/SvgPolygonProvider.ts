import { Polygon } from "@/model/Polygon";
import type { IPolygonProvider } from "./IPolygonProvider";
import type { IFileProvider } from "../file/IFileProvider";
import type { ISvgPathParser } from "@/logic/parser/ISvgParser";

export interface SvgPolyProviderOptionsProps {
    tolerance: number;
    decimals?: number | null;
}

export class SvgPolyProviderOptions implements SvgPolyProviderOptionsProps {
    readonly tolerance: number;
    readonly decimals?: number | null;
    constructor(tolerance: number, decimals?: number | null) {
        this.tolerance = tolerance;
        this.decimals = decimals ?? null;
    }
}

// --------------------------------------
// Command structure used internally during parsing
// --------------------------------------
interface Command {
    code: string;      // upper-case canonical code (M,L,H,V,C,S,Z,...)
    command: string;   // original command char as found in path (may be lower-case)
    x0: number; y0: number; // starting point (absolute after makeAbsolute)
    x1: number; y1: number; // control point 1
    x2: number; y2: number; // control point 2
    x: number;  y: number;  // end point
}

function newCommand(code: string, command: string): Command {
  return { code, command, x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x: 0, y: 0 };
}

// --------------------------------------
// SVGPolygonProvider implementation
// --------------------------------------
export class SVGPolygonProvider implements IPolygonProvider {
    private readonly fileProvider: IFileProvider;
    private readonly svgParser: ISvgPathParser;
    private readonly options: SvgPolyProviderOptions;

    constructor(fileProvider: IFileProvider, svgParser: ISvgPathParser, options: SvgPolyProviderOptions) {
        this.fileProvider = fileProvider;
        this.svgParser = svgParser;
        this.options = options;
    }

    /**
     * Load SVG, extract all path strings, convert to polygons.
     */
    async getAllPolygons(): Promise<Polygon[]> {
        const input = await this.fileProvider.provideFile();
        const svgPathStrings = await this.svgParser.parse(input);
        const allPolygons: Polygon[] = [];
        for (const svgPathString of svgPathStrings) {
            const polys = this.svgPathToPolygons(svgPathString);
            if (polys) allPolygons.push(...polys);
        }

        return allPolygons;
    }

    // --------------------------------------------------
    // Convert a single SVG path data string into polygons
    // --------------------------------------------------
    private svgPathToPolygons(svgPathString: string): Polygon[] | null {
        const polys: Polygon[] = [];
        const tolerance2 = this.options.tolerance * this.options.tolerance;
        let poly: Polygon | null = null;
        let prev: Command | null = null;

        const commands = this.makeAbsolute(this.parseSvgPath(svgPathString));
        for (const cmd of commands) {
            switch (cmd.code) {
                case 'M': {
                    poly = new Polygon();
                    polys.push(poly);
                    // fall-through to add first point
                }
                // eslint-disable-next-line no-fallthrough
                case 'L':
                case 'H':
                case 'V':
                case 'Z': {
                    if (poly)
                        this.add(poly, cmd.x, cmd.y);
                    
                    break;
                }
                case 'C': {
                    if (poly) {
                        this.sampleCubicBezier(cmd.x0, cmd.y0, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y, poly, tolerance2);
                        this.add(poly, cmd.x, cmd.y);
                    }

                    break;
                }
                case 'S': {
                    if (poly) {
                        let x1 = 0, y1 = 0;
                        if (prev) {
                            if (prev.code === 'C') {
                                x1 = prev.x * 2 - prev.x2;
                                y1 = prev.y * 2 - prev.y2;
                            } else {
                                x1 = prev.x;
                                y1 = prev.y;
                            }
                        }

                        this.sampleCubicBezier(cmd.x0, cmd.y0, x1, y1, cmd.x2, cmd.y2, cmd.x, cmd.y, poly, tolerance2);
                        this.add(poly, cmd.x, cmd.y);
                    }

                    break;
                }
                default: {
                    console.error(`Our deepest apologies, but ${cmd.command} commands (${cmd.code}) are not yet supported.`);
                    return null;
                }
            }
            prev = cmd;
        }
        return polys;
    }

    // ----------------------------------------------
    // Recursive cubic Bézier flattening approximation
    // ----------------------------------------------
    private sampleCubicBezier(
        x0: number, y0: number,
        x1: number, y1: number,
        x2: number, y2: number,
        x3: number, y3: number,
        poly: Polygon,
        tolerance2: number
    ): void {
        // Midpoints of segments
        const x01 = (x0 + x1) / 2.0; 
        const y01 = (y0 + y1) / 2.0;
        const x12 = (x1 + x2) / 2.0; 
        const y12 = (y1 + y2) / 2.0;
        const x23 = (x2 + x3) / 2.0; 
        const y23 = (y2 + y3) / 2.0;
        const x012 = (x01 + x12) / 2.0;
        const y012 = (y01 + y12) / 2.0;
        const x123 = (x12 + x23) / 2.0;
        const y123 = (y12 + y23) / 2.0;
        const x0123 = (x012 + x123) / 2.0;
        const y0123 = (y012 + y123) / 2.0;

        // Try straight-line approximation
        const dx = x3 - x0;
        const dy = y3 - y0;
        const d1 = Math.abs(((x1 - x3) * dy - (y1 - y3) * dx));
        const d2 = Math.abs(((x2 - x3) * dy - (y2 - y3) * dx));

        if (((d1 + d2) * (d1 + d2)) < (tolerance2 * (dx * dx + dy * dy))) {
            this.add(poly, x0123, y0123);
        } else {
            // Subdivide
            this.sampleCubicBezier(x0, y0, x01, y01, x012, y012, x0123, y0123, poly, tolerance2);
            this.sampleCubicBezier(x0123, y0123, x123, y123, x23, y23, x3, y3, poly, tolerance2);
        }
    }

    // ---------------------------------
    // Add a point to a polygon (rounded)
    // ---------------------------------
    private add(poly: Polygon, x: number, y: number): void {
        const { decimals } = this.options;
        if (decimals != null && decimals >= 0) {
            x = this.roundToDecimals(x, decimals);
            y = this.roundToDecimals(y, decimals);
        }

        poly.getVertices().push({ x, y });
    }

    private roundToDecimals(value: number, decimals: number): number {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    // ------------------
    // SVG path parsing
    // ------------------
    private parseSvgPath(svgPathString: string): Command[] {
        const commands: Command[] = [];
        const svgPath = svgPathString.replace(/[\n\r]/g, ' ').trim();

        // Matches command letters OR numeric parameters (floats, scientific notation)
        const pattern = /([MmZzLlHhVvCcSsQqTtAa])|([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
        const matches = svgPath.matchAll(pattern);

        let currentCommand: string | null = null;
        const params: number[] = [];

        for (const m of matches) {
            const match = m[0];
            if (/^[MmZzLlHhVvCcSsQqTtAa]$/.test(match)) {
                if (currentCommand !== null) {
                    this.extractCommands(currentCommand, params, commands);
                    params.length = 0;
                }

                currentCommand = match;
            } else {
                params.push(parseFloat(match));
            }
        }

        if (currentCommand !== null) {
            this.extractCommands(currentCommand, params, commands);
        }

        return commands;
    }

    private extractCommands(commandChar: string, params: number[], commands: Command[]): void {
        const paramCount = this.getParamCount(commandChar);
        const code = commandChar.toUpperCase();

        for (let i = 0; i < params.length; i += paramCount) {
            const remaining = params.length - i;
            if (remaining < paramCount) {
                console.error(`Invalid parameter count for command: ${commandChar}`);
                break;
            }

            const cmd = newCommand(code, commandChar);
            switch (code) {
                case 'M':
                case 'L':
                    cmd.x = params[i];
                    cmd.y = params[i + 1];
                    break;
                case 'H':
                    cmd.x = params[i];
                    break;
                case 'V':
                    cmd.y = params[i];
                    break;
                case 'C':
                    cmd.x1 = params[i];
                    cmd.y1 = params[i + 1];
                    cmd.x2 = params[i + 2];
                    cmd.y2 = params[i + 3];
                    cmd.x = params[i + 4];
                    cmd.y = params[i + 5];
                    break;
                case 'S':
                    cmd.x2 = params[i];
                    cmd.y2 = params[i + 1];
                    cmd.x = params[i + 2];
                    cmd.y = params[i + 3];
                    break;
                case 'Z':
                    // no params
                    break;
                default:
                    console.error(`Command not supported: ${code}`);
            }

            // x0/y0 will be set in makeAbsolute
            commands.push(cmd);
        }
    }

    private getParamCount(command: string): number {
        switch (command.toUpperCase()) {
            case 'M':
            case 'L': return 2;
            case 'H':
            case 'V': return 1;
            case 'C': return 6;
            case 'S': return 4;
            default: return 0; // Z, etc.
        }
    }

    // -------------------------------------------------
    // Convert relative coordinates to absolute in-place
    // -------------------------------------------------
    private makeAbsolute(commands: Command[]): Command[] {
        let currentX = 0, currentY = 0;
        let subPathStartX = 0, subPathStartY = 0;

        for (const cmd of commands) {
            const isRelative = cmd.command.length > 0 && cmd.command === cmd.command.toLowerCase();
            switch (cmd.code) {
                case 'M':
                case 'L': {
                    if (isRelative) {
                        cmd.x += currentX;
                        cmd.y += currentY;
                    }
                    currentX = cmd.x;
                    currentY = cmd.y;
                    if (cmd.code === 'M') {
                        subPathStartX = currentX;
                        subPathStartY = currentY;
                    }
                    cmd.x0 = currentX;
                    cmd.y0 = currentY;
                    break;
                }
                case 'H': {
                    if (isRelative) {
                        cmd.x += currentX;
                    }
                    currentX = cmd.x;
                    cmd.x0 = currentX;
                    cmd.y0 = currentY;
                    cmd.y = currentY;
                    break;
                }
                case 'V': {
                    if (isRelative) {
                        cmd.y += currentY;
                    }
                    currentY = cmd.y;
                    cmd.x0 = currentX;
                    cmd.y0 = currentY;
                    cmd.x = currentX;
                    break;
                }
                case 'C': {
                    if (isRelative) {
                        cmd.x1 += currentX; cmd.y1 += currentY;
                        cmd.x2 += currentX; cmd.y2 += currentY;
                        cmd.x += currentX;  cmd.y += currentY;
                    }
                    cmd.x0 = currentX; cmd.y0 = currentY;
                    currentX = cmd.x; currentY = cmd.y;
                    break;
                }
                case 'S': {
                    if (isRelative) {
                        cmd.x2 += currentX; cmd.y2 += currentY;
                        cmd.x += currentX;  cmd.y += currentY;
                    }
                    cmd.x0 = currentX; cmd.y0 = currentY;
                    currentX = cmd.x; currentY = cmd.y;
                    break;
                }
                case 'Z': {
                    currentX = subPathStartX;
                    currentY = subPathStartY;
                    cmd.x0 = currentX; cmd.y0 = currentY;
                    cmd.x = currentX;  cmd.y = currentY;
                    break;
                }
                default:
                    console.error(`Command not supported in makeAbsolute: ${cmd.code}`);
            }

            cmd.code = cmd.code.toUpperCase();
        }
        
        return commands;
    }
}
