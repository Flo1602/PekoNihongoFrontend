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
        const toHex = (c: number) => {
            const hex = Math.round(c * 255).toString(16).padStart(2, '0');
            return hex;
        };

        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
    }

    public static hsb(h: number, s: number, v: number): Color {
        h = ((h % 360) + 360) % 360;        // wrap negatives, ensure 0–360
        s = Math.min(Math.max(s, 0), 1);
        v = Math.min(Math.max(v, 0), 1);

        if (s === 0) {
            // Achromatic (grey)
            return new Color(v, v, v);
        }

        const sector = h / 60;              // six sectors: 0–5.999…
        const i = Math.floor(sector);       // integer part
        const f = sector - i;               // fractional part

        const p = v * (1 - s);
        const q = v * (1 - s * f);
        const t = v * (1 - s * (1 - f));

        switch (i) {
            case 0: return new Color(v, t, p);
            case 1: return new Color(q, v, p);
            case 2: return new Color(p, v, t);
            case 3: return new Color(p, q, v);
            case 4: return new Color(t, p, v);
            default: // i === 5
            return new Color(v, p, q );
        }
    }

    public getHue(): number {
        // Clamp inputs to the legal range in case of rounding errors
        const r = Math.min(Math.max(this.r, 0), 1);
        const g = Math.min(Math.max(this.g, 0), 1);
        const b = Math.min(Math.max(this.b, 0), 1);

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        // Achromatic: hue is conventionally set to 0
        if (delta === 0) return 0;

        let h: number;

        if (max === r) {
            h = (g - b) / delta;           // between yellow & magenta
        } else if (max === g) {
            h = 2 + (b - r) / delta;       // between cyan & yellow
        } else { // max === b
            h = 4 + (r - g) / delta;       // between magenta & cyan
        }

        h *= 60;                         // turn into degrees

        if (h < 0) h += 360;             // wrap negatives into [0,360)

        return h;
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