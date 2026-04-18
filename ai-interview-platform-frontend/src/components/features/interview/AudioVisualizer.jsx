import React, { useEffect, useRef } from "react";

const AudioVisualizer = ({ isPlaying, isRecording, audioStream, mode = "listening" }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    // Configuration
    const barCount = 24; 
    const gap = 4;
    const totalGap = (barCount - 1) * gap;
    const barWidth = (width - totalGap) / barCount;
    
    // Colors
    const recordingColor = "#ef4444"; // Red-500
    const speakingColor = "#10b981"; // Emerald-500
    const barColor = mode === "speaking" ? recordingColor : speakingColor;

    // Setup Web Audio API if stream is present
    const initAudio = () => {
      if (audioStream && isRecording && !audioContextRef.current) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 128; // Higher resolution
          analyserRef.current.smoothingTimeConstant = 0.8;
          
          sourceRef.current = audioContextRef.current.createMediaStreamSource(audioStream);
          sourceRef.current.connect(analyserRef.current);
        } catch (e) {
          console.error("Audio API setup failed", e);
        }
      }
    };

    initAudio();

    const drawRoundedRect = (x, y, w, h, radius) => {
      if (h < radius * 2) radius = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
      ctx.fill();
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = barColor;

      let dataArray;
      const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 0;

      if (audioStream && isRecording && analyserRef.current) {
         dataArray = new Uint8Array(bufferLength);
         analyserRef.current.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < barCount; i++) {
        let barHeight;

        if (audioStream && isRecording && dataArray) {
          // Map frequency data to bars
          // We focus on the lower half of the frequency spectrum for voice
          const index = Math.floor(i * (bufferLength / 2) / barCount);
          const value = dataArray[index] || 0;
          // Scale value (0-255) to height
          const percent = value / 255;
          barHeight = Math.max(4, percent * height * 0.8);
        } else if (isPlaying || isRecording) {
          // Simulation mode (AI speaking or Recording without stream yet)
          // Create a wave-like pattern
          const time = Date.now() / 200;
          const offset = i * 0.5;
          const noise = Math.sin(time + offset) * 0.5 + 0.5; // 0 to 1
          barHeight = Math.max(4, noise * height * 0.6 + height * 0.2);
        } else {
          barHeight = 4;
        }

        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2; // Center vertically

        drawRoundedRect(x, y, barWidth, barHeight, barWidth / 2);
      }
      
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      // Cleanup audio context on unmount or prop change
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isPlaying, isRecording, audioStream, mode]);

  if (!isPlaying && !isRecording) return null;

  return <canvas ref={canvasRef} className="w-[200px] h-12" />;
};

export default AudioVisualizer;
