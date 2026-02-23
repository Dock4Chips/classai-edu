"use client";

import { useEffect, useRef } from "react";

type Detection = {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox_xyxy: [number, number, number, number];
};

export default function TestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // ===============================
  // 摄像头初始化
  // ===============================
  useEffect(() => {
    async function initCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }

    initCamera();
  }, []);

  // ===============================
  // WebSocket
  // ===============================
  useEffect(() => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlX2lkIjoxLCJ1c2VyX25hbWUiOiJhZG1pbiIsImlzcyI6ImNsYXNzYWktZWR1IiwiaWF0IjoxNzcxODYyNzU5LCJleHAiOjE3NzIxMjE5NTksImp0aSI6ImQyOWNhMGVkLTU1MDEtNGMxYy05ZDQ2LWMxNzRmMDk4N2U0YiJ9.S8n2YWNNKldH74LsgjEamfJEgaqUZTfMDYsqbZJvwkM";

    const ws = new WebSocket(
      `ws://localhost:7869/api/stream/ws?token=${token}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected");

      ws.send(
        JSON.stringify({
          action: "predict",
          source: 0,
          conf: 0.4,
        })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "predict") {
        drawDetections(msg.detections);
      }

      if (msg.type === "error") {
        console.error(msg.message);
      }
    };

    ws.onclose = () => console.log("WS closed");

    return () => ws.close();
  }, []);

  // ===============================
  // 画检测框
  // ===============================
  function drawDetections(detections: Detection[]) {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.font = "16px Arial";

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox_xyxy;

      ctx.strokeStyle = "lime";
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      ctx.fillStyle = "lime";
      ctx.fillText(
        `${det.class_name} ${(det.confidence * 100).toFixed(1)}%`,
        x1,
        y1 - 5
      );
    });
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div
      style={{
        position: "relative",
        width: "fit-content",
        margin: "40px auto",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: 800 }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
      />
    </div>
  );
}