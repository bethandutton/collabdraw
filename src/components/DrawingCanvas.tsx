'use client';

import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

type Tool = 'pen' | 'pan';
type Color = 'white' | 'red' | 'blue' | 'yellow';

interface Line {
  points: Array<{ x: number; y: number }>;
  color: Color;
  timestamp: number;
}

export default function DrawingCanvas({ user }: { user: { name: string; avatar: string; id: string } }) {
  const [cursors, setCursors] = useState<{ [key: string]: { x: number; y: number; user: typeof user } }>({});
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState<Color>('white');
  const [lines, setLines] = useState<Line[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket']
    });
    socketRef.current.emit('user-joined', user);
    
    socketRef.current.on('cursor-move', (data: { x: number; y: number; user: typeof user }) => {
      setCursors(prev => ({
        ...prev,
        [data.user.id]: data
      }));
    });

    // Add cleanup interval
    const cleanup = setInterval(() => {
      const now = Date.now();
      setLines((prev: Line[]) => prev.filter(line => now - line.timestamp < 15000));
    }, 1000);

    return () => {
      socketRef.current?.emit('user-left', user.id);
      clearInterval(cleanup);
    };
  }, [user]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (currentTool === 'pen') {
      startDrawing(touch.clientX, touch.clientY);
    } else if (currentTool === 'pan') {
      setIsPanning(true);
      setStartPanPos({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    stopDrawing();
    setIsPanning(false);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    // Emit cursor position without offset
    socketRef.current?.emit('cursor-move', { 
      x: rawX + canvasOffset.x, // Add offset to cursor position
      y: rawY + canvasOffset.y, 
      user 
    });

    if (isPanning && currentTool === 'pan') {
      setCanvasOffset({
        x: canvasOffset.x + (clientX - startPanPos.x),
        y: canvasOffset.y + (clientY - startPanPos.y)
      });
      setStartPanPos({ x: clientX, y: clientY });
      return;
    }

    if (isDrawing && currentTool === 'pen') {
      const x = rawX + canvasOffset.x;
      const y = rawY + canvasOffset.y;
      const context = contextRef.current;
      if (!context || !lastPointRef.current) return;

      context.strokeStyle = currentColor;
      context.beginPath();
      context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      context.lineTo(x, y);
      context.stroke();

      setLines((prev: Line[]) => {
        const lastLine = prev[prev.length - 1];
        if (lastLine && lastPointRef.current) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastLine,
              points: [...lastLine.points, { x, y }],
              timestamp: Date.now()
            }
          ];
        }
        return prev;
      });

      lastPointRef.current = { x, y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentTool === 'pen') {
      startDrawing(e.clientX, e.clientY);
    } else if (currentTool === 'pan') {
      setIsPanning(true);
      setStartPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const startDrawing = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left + canvasOffset.x;
    const y = clientY - rect.top + canvasOffset.y;

    lastPointRef.current = { x, y };
    setIsDrawing(true);

    setLines((prev: Line[]) => [
      ...prev,
      {
        points: [{ x, y }],
        color: currentColor,
        timestamp: Date.now()
      }
    ]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  return (
    <main 
      className="w-screen h-screen bg-black overflow-hidden relative" 
      onMouseMove={handleMouseMove}
      onMouseUp={() => handleTouchEnd()}
      onMouseLeave={() => handleTouchEnd()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        style={{ 
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          className="bg-black"
          onMouseDown={handleMouseDown}
        />
      </div>
      
      {Object.values(cursors).map(cursor => (
        <div
          key={cursor.user.id}
          className="fixed pointer-events-none"
          style={{
            left: cursor.x - canvasOffset.x,
            top: cursor.y - canvasOffset.y,
            transform: 'translate(-50%, -50%)',
            transition: isPanning ? 'none' : 'all 0.1s ease-out' // Add smooth transition except during panning
          }}
        >
          <div className="text-2xl">{cursor.user.avatar}</div>
          <div className="px-2 py-1 bg-gray-800 rounded-full text-white text-sm -mt-1">
            {cursor.user.name}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 right-0 p-4 sm:p-6 flex flex-col gap-2 items-end">
        <div className="bg-gray-800 rounded-lg p-2 flex gap-2 shadow-lg">
          <button
            className={`w-12 h-12 sm:w-10 sm:h-10 rounded flex items-center justify-center ${currentTool === 'pen' ? 'bg-blue-500' : 'bg-gray-700'}`}
            onClick={() => setCurrentTool('pen')}
          >
            ✏️
          </button>
          <button
            className={`w-12 h-12 sm:w-10 sm:h-10 rounded flex items-center justify-center ${currentTool === 'pan' ? 'bg-blue-500' : 'bg-gray-700'}`}
            onClick={() => setCurrentTool('pan')}
          >
            ✋
          </button>
          <div className="w-px bg-gray-600 mx-1" /> {/* Divider */}
          {(['white', 'red', 'blue', 'yellow'] as Color[]).map(color => (
            <button
              key={color}
              className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full ${currentColor === color ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
