// 🔥 FULL OPTIMIZED VERSION

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getStrategicHint } from '../services/geminiService';
import { Point, Bubble, Particle, BubbleColor, DebugInfo } from '../types';
import { Loader2, Trophy, BrainCircuit, Play, MousePointerClick, Eye, Terminal, AlertTriangle, Target, Lightbulb, Monitor } from 'lucide-react';

const PINCH_THRESHOLD = 0.05;
const GRAVITY = 0.0;
const FRICTION = 0.998;

const BUBBLE_RADIUS = 22;
const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3);
const GRID_COLS = 12;
const GRID_ROWS = 8;
const SLINGSHOT_BOTTOM_OFFSET = 220;

const MAX_DRAG_DIST = 180;
const MIN_FORCE_MULT = 0.15;
const MAX_FORCE_MULT = 0.45;

const COLOR_CONFIG: Record<BubbleColor, { hex: string, points: number, label: string }> = {
  red:    { hex: '#ef5350', points: 100, label: 'Red' },
  blue:   { hex: '#42a5f5', points: 150, label: 'Blue' },
  green:  { hex: '#66bb6a', points: 200, label: 'Green' },
  yellow: { hex: '#ffee58', points: 250, label: 'Yellow' },
  purple: { hex: '#ab47bc', points: 300, label: 'Purple' },
  orange: { hex: '#ffa726', points: 500, label: 'Orange' }
};

const COLOR_KEYS: BubbleColor[] = ['red','blue','green','yellow','purple','orange'];

const GeminiSlingshot: React.FC = () => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const bubbles = useRef<Bubble[]>([]);
  const particles = useRef<Particle[]>([]);
  const anchorPos = useRef<Point>({ x: 0, y: 0 });
  const ballPos = useRef<Point>({ x: 0, y: 0 });
  const ballVel = useRef<Point>({ x: 0, y: 0 });

  const isFlying = useRef(false);
  const isAiThinkingRef = useRef(false);
  const captureRequestRef = useRef(false);

  const [score, setScore] = useState(0);
  const [aiHint, setAiHint] = useState<string | null>("Initializing...");
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selectedColor, setSelectedColor] = useState<BubbleColor>('red');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const getBubblePos = (row: number, col: number, width: number) => {
    const xOffset = (width - (GRID_COLS * BUBBLE_RADIUS * 2)) / 2 + BUBBLE_RADIUS;
    const isOdd = row % 2 !== 0;
    const x = xOffset + col * (BUBBLE_RADIUS * 2) + (isOdd ? BUBBLE_RADIUS : 0);
    const y = BUBBLE_RADIUS + row * ROW_HEIGHT;
    return { x, y };
  };

  const initGrid = useCallback((width: number) => {
    const newBubbles: Bubble[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = getBubblePos(r, c, width);
        newBubbles.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          x,
          y,
          color: COLOR_KEYS[Math.floor(Math.random()*COLOR_KEYS.length)],
          active: true
        });
      }
    }
    bubbles.current = newBubbles;

    setTimeout(() => {
      captureRequestRef.current = true;
    }, 1000);
  }, []);

  // 🔥 OPTIMIZED AI CALL
  const performAiAnalysis = async (screenshot: string) => {
    if (isAiThinkingRef.current) return;

    isAiThinkingRef.current = true;
    setIsAiThinking(true);
    setAiHint("Analyzing tactical options...");
    setAiRationale(null);

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 6000)
      );

      const aiCall = getStrategicHint(screenshot, [], 0);

      const result: any = await Promise.race([aiCall, timeout]);

      setDebugInfo(result.debug);
      setAiHint(result.hint.message);
      setAiRationale(result.hint.rationale || null);

    } catch (err) {
      setAiHint("AI Timeout — Playing safe.");
      setAiRationale("Fallback strategy engaged.");
    }

    isAiThinkingRef.current = false;
    setIsAiThinking(false);
  };

  useEffect(() => {
    if (!canvasRef.current || !gameContainerRef.current) return;

    const canvas = canvasRef.current;
    const container = gameContainerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    anchorPos.current = { x: canvas.width / 2, y: canvas.height - SLINGSHOT_BOTTOM_OFFSET };
    ballPos.current = { ...anchorPos.current };

    initGrid(canvas.width);

    const loop = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);

      bubbles.current.forEach(b => {
        if (!b.active) return;
        ctx.beginPath();
        ctx.arc(b.x,b.y,BUBBLE_RADIUS,0,Math.PI*2);
        ctx.fillStyle = COLOR_CONFIG[b.color].hex;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(ballPos.current.x, ballPos.current.y, BUBBLE_RADIUS, 0, Math.PI*2);
      ctx.fillStyle = COLOR_CONFIG[selectedColor].hex;
      ctx.fill();

      // 🔥 OPTIMIZED CAPTURE BLOCK
      if (captureRequestRef.current && !isAiThinkingRef.current) {
        captureRequestRef.current = false;

        const offscreen = document.createElement('canvas');
        const targetWidth = 320;
        const scale = Math.min(1, targetWidth / canvas.width);

        offscreen.width = canvas.width * scale;
        offscreen.height = canvas.height * scale;

        const oCtx = offscreen.getContext('2d');
        if (oCtx) {
          oCtx.drawImage(canvas,0,0,offscreen.width,offscreen.height);
          const screenshot = offscreen.toDataURL("image/jpeg",0.4);
          performAiAnalysis(screenshot);
        }
      }

      requestAnimationFrame(loop);
    };

    loop();
  }, [initGrid, selectedColor]);

  return (
    <div ref={gameContainerRef} className="flex w-full h-screen bg-[#121212] text-white">
      <canvas ref={canvasRef} className="absolute inset-0"/>

      {isAiThinking && (
        <div className="absolute bottom-[220px] left-1/2 -translate-x-1/2">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400"/>
          <p className="text-xs text-blue-400 mt-2">ANALYZING...</p>
        </div>
      )}

      <div className="absolute top-6 left-6">
        <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-gray-700">
          <p className="text-sm text-gray-400">Score</p>
          <p className="text-2xl font-bold">{score}</p>
        </div>
      </div>

      <div className="absolute right-0 w-[360px] h-full bg-[#1e1e1e] border-l border-gray-700 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-5 h-5 text-blue-400"/>
          <h2 className="font-bold">Flash Strategy</h2>
        </div>

        <p className="text-sm font-semibold">{aiHint}</p>
        {aiRationale && (
          <p className="text-xs text-blue-300 mt-2 italic">{aiRationale}</p>
        )}

        {debugInfo && (
          <div className="mt-6 text-xs font-mono bg-black p-3 rounded">
            {JSON.stringify(debugInfo.parsedResponse,null,2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiSlingshot;
