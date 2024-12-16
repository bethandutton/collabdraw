'use client';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

let socket;

const Canvas = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);

    useEffect(() => {
        const initSocket = async () => {
            await fetch('/api/socketio');
            socket = io();

            socket.on('connect', () => {
                console.log('Socket connected');
            });

            socket.on('draw', (data) => {
                // Handle received drawing data
                if (!isDrawing.current) {
                    draw(data);
                }
            });
        };

        initSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const sendDrawingData = (data) => {
        if (socket) {
            socket.emit('draw', data);
        }
    };

    const draw = (info) => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.strokeStyle = info.color;
        context.lineWidth = info.width;
        context.lineCap = 'round';

        context.beginPath();
        context.moveTo(info.x, info.y);
        context.lineTo(info.x, info.y);
        context.stroke();
        context.closePath();

        sendDrawingData({
            x: info.x,
            y: info.y,
            color: selectedColor,
            width: lineWidth,
            isDrawing: isDrawing.current
        });
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const drawOnCanvas = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        draw({ x: offsetX, y: offsetY });
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={drawOnCanvas}
            />
            <div>
                <label>Color:</label>
                <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                />
            </div>
            <div>
                <label>Line Width:</label>
                <input
                    type="number"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(e.target.value)}
                />
            </div>
        </div>
    );
};

export default Canvas;
