import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// ✅ Use environment variable for backend URL
const socket = io(import.meta.env.VITE_BACKEND_URL);

function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctxRef.current = ctx;

    socket.on("draw", ({ fromX, fromY, toX, toY }) => {
      drawLine(fromX, fromY, toX, toY);
    });

    return () => {
      socket.off("draw");
    };
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    drawing.current = true;
    setMouse({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing.current) return;
    const { offsetX, offsetY } = nativeEvent;

    drawLine(mouse.x, mouse.y, offsetX, offsetY);
    socket.emit("draw", {
      fromX: mouse.x,
      fromY: mouse.y,
      toX: offsetX,
      toY: offsetY,
    });

    setMouse({ x: offsetX, y: offsetY });
  };

  const drawLine = (fromX, fromY, toX, toY) => {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(fromX, fromY);
    ctxRef.current.lineTo(toX, toY);
    ctxRef.current.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onMouseMove={draw}
      style={{ border: "1px solid #ccc", display: "block" }}
    />
  );
}

export default App;
