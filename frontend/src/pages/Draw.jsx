import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// ✅ Connect to backend server
const socket = io("https://liveboard-12gj.onrender.com", {
  transports: ["websocket", "polling"],
});

function Draw() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // ✅ High-DPI scaling
    const scale = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(scale, scale);

    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctxRef.current = ctx;

    // ✅ Receive draw events
    socket.on("draw", ({ fromX, fromY, toX, toY }) => {
      drawLine(fromX, fromY, toX, toY);
    });

    const handleResize = () => window.location.reload();
    window.addEventListener("resize", handleResize);

    return () => {
      socket.off("draw");
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ✅ Draw line on canvas
  const drawLine = (fromX, fromY, toX, toY) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  };

  // ✅ Get scaled mouse position
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    return {
      x: (e.nativeEvent.clientX - rect.left) * scaleX,
      y: (e.nativeEvent.clientY - rect.top) * scaleY,
    };
  };

  // ✅ Get scaled touch position
  const getTouchPos = (e) => {
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);
    drawing.current = true;
    setMouse(pos);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    const pos = getMousePos(e);

    drawLine(mouse.x, mouse.y, pos.x, pos.y);
    socket.emit("draw", {
      fromX: mouse.x,
      fromY: mouse.y,
      toX: pos.x,
      toY: pos.y,
    });

    setMouse(pos);
  };

  const startTouchDrawing = (e) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    drawing.current = true;
    setMouse(pos);
  };

  const touchDraw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const pos = getTouchPos(e);

    drawLine(mouse.x, mouse.y, pos.x, pos.y);
    socket.emit("draw", {
      fromX: mouse.x,
      fromY: mouse.y,
      toX: pos.x,
      toY: pos.y,
    });

    setMouse(pos);
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onTouchStart={startTouchDrawing}
      onTouchMove={touchDraw}
      onTouchEnd={stopDrawing}
      onTouchCancel={stopDrawing}
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
        border: "1px solid #ccc",
        touchAction: "none", // ✅ Prevent scrolling during draw
        cursor: "crosshair",
      }}
    />
  );
}

export default Draw;
