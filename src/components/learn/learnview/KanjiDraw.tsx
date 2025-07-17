import {useContext, useEffect, useRef, useState} from "react";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import { useDebounce } from "react-use";

type CanvasOptions = {
    size: number;
}

type Point = {
    x: number;
    y: number;
}

const KanjiDraw = () => {
    const learnDataContext = useContext(LearnDataContext);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasSize, setCanvasSize] = useState<CanvasOptions>({ size: 0 });
    const [debouncedCanvasSize, setDebouncedSettings] = useState<CanvasOptions>({ size: 0 });

    const isDrawing = useRef(false);
    const prevPoint = useRef<Point | null>(null);

    useDebounce(() => setDebouncedSettings(canvasSize), 100, [canvasSize]);

    useEffect(() => {
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            const size = (windowWidth > windowHeight ? windowHeight : windowWidth) / 2;
            setCanvasSize({ size: size });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;

        canvas.width = debouncedCanvasSize.size;
        canvas.height = debouncedCanvasSize.size;

        // TODO reset current drawing / validation stuff -> move to other effect
    }, [debouncedCanvasSize]);

    // Drawing functions
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (!canvas || ! ctx)
            return;
        
        const getMousePos = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            } as Point;
        };

        const onMouseDown = (e: MouseEvent) => {
            isDrawing.current = true;
            prevPoint.current = getMousePos(e);
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDrawing.current || !prevPoint.current)
                return;

            const curr = getMousePos(e);
            ctx.beginPath();
            ctx.moveTo(prevPoint.current.x, prevPoint.current.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.strokeStyle = "#000"; // black ink
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            prevPoint.current = curr;
        };

        const onMouseUp = () => {
            isDrawing.current = false;
            prevPoint.current = null;
        };

        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            canvas.removeEventListener("mousedown", onMouseDown);
            canvas.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [debouncedCanvasSize]);

    return (
        <div className="flex-1 flex">
            <div className="flex justify-center items-center">
                <canvas ref={canvasRef} className="aspect-square bg-base-100 rounded-2xl" />
            </div>
        </div>
    );
};
export default KanjiDraw
