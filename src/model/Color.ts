export class Color {

    private static readonly EPSILON = 1e-6;

    private readonly r: number;
    private readonly g: number;
    private readonly b: number;
    private readonly a: number;

    constructor(
        r: number,
        g: number,
        b: number,
        a: number = 1
    ) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public getRed() {
        return this.r;
    }

    public getGreen() {
        return this.g;
    }

    public getBlue() {
        return this.b;
    }
    
    public getAlpha() {
        return this.a;
    }

    public toHex(): string {
        const toHexPart = (n: number) => {
            const hex = n.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };

        return `#${toHexPart(this.r)}${toHexPart(this.g)}${toHexPart(this.b)}`;
    }

    public toRGBA(): string {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }

    public static hsb(h: number, s: number, v: number): Color {
        h = h % 360;
        if (h < 0) h += 360;

        s = Math.min(Math.max(s, 0), 1);
        v = Math.min(Math.max(v, 0), 1);

        const c = v * s;
        const hh = h / 60;
        const x = c * (1 - Math.abs(hh % 2 - 1));
        let r = 0, g = 0, b = 0;

        if (hh >= 0 && hh < 1) {
            r = c; g = x; b = 0;
        } else if (hh >= 1 && hh < 2) {
            r = x; g = c; b = 0;
        } else if (hh >= 2 && hh < 3) {
            r = 0; g = c; b = x;
        } else if (hh >= 3 && hh < 4) {
            r = 0; g = x; b = c;
        } else if (hh >= 4 && hh < 5) {
            r = x; g = 0; b = c;
        } else if (hh >= 5 && hh < 6) {
            r = c; g = 0; b = x;
        }

        const m = v - c;

        return new Color(
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        );
    }

    public getHue(): number {
        const max = Math.max(this.r, this.g, this.b);
        const min = Math.min(this.r, this.g, this.b);
        const delta = max - min;

        let hue: number;

        if (delta === 0) {
            hue = 0;
        } else if (max === this.r) {
            hue = ((this.g - this.b) / delta) % 6;
        } else if (max === this.g) {
            hue = (this.b - this.r) / delta + 2;
        } else {
            hue = (this.r - this.g) / delta + 4;
        }

        hue *= 60;
        if (hue < 0)
          hue += 360;

        return hue;
    }

    public equals(other: Color): boolean {
        return (
            Math.abs(this.r - other.r) < Color.EPSILON &&
            Math.abs(this.g - other.g) < Color.EPSILON &&
            Math.abs(this.b - other.b) < Color.EPSILON &&
            Math.abs(this.a - other.a) < Color.EPSILON
        )
    }
}