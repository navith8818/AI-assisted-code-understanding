import { useEffect, useRef } from "react";
import "./Hexagon.css";

const GAP = 3;
const HEX_OUTER = 70;
const HEX_INNER = HEX_OUTER - GAP;
const COLORS = ["#ff6600", "#ff00ff", "#00ffff",  "#00ff88", "#ff0066", "#7700ff"];
const ROW_COUNTS = [6, 7, 8, 7, 6];

export default function Hexagon() {
  const sceneRef = useRef(null);
  const glowRef = useRef(null);
  const hexRef = useRef(null);
  const stateRef = useRef({ mouseX: -9999, mouseY: -9999, colorIdx: 0 });

  useEffect(() => {
    const scene = sceneRef.current;
    const glowCanvas = glowRef.current;
    const hexCanvas = hexRef.current;
    const glowCtx = glowCanvas.getContext("2d");
    const hexCtx = hexCanvas.getContext("2d");

    function hexPath(ctx, cx, cy, r) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function getHexCenters() {
      const colW = HEX_OUTER * Math.sqrt(3);
      const rowH = HEX_OUTER * 1.5;
      const totalHeight = ROW_COUNTS.length * rowH;
      const startY = (hexCanvas.height - totalHeight) / 2;
      const centers = [];

      ROW_COUNTS.forEach((count, row) => {
        const totalRowWidth = count * colW;
        const startX = (hexCanvas.width - totalRowWidth) / 2 + colW / 2 + 200;
        const cy = startY + row * rowH + HEX_OUTER;

        for (let col = 0; col < count; col++) {
          const cx = startX + col * colW;
          centers.push([cx, cy]);
        }
      });

      return centers;
    }

    function drawHexes(W, H) {
        hexCtx.clearRect(0, 0, W, H);

        hexCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
        hexCtx.shadowBlur = 15;
        hexCtx.shadowOffsetX = 4;
        hexCtx.shadowOffsetY = 4;

        hexCtx.fillStyle = "#1C1C1E";
        for (const [cx, cy] of getHexCenters()) {
            hexPath(hexCtx, cx, cy, HEX_INNER);
            hexCtx.fill();
        }

        // reset shadow so it doesn't affect other draws
        hexCtx.shadowColor = "transparent";
        hexCtx.shadowBlur = 0;
        hexCtx.shadowOffsetX = 0;
        hexCtx.shadowOffsetY = 0;
    }

    function drawGlow(W, H) {
      const { mouseX, mouseY, colorIdx } = stateRef.current;
      glowCtx.clearRect(0, 0, W, H);
      if (mouseX < 0 || mouseX > W || mouseY < 0 || mouseY > H) return;

      const neon = COLORS[colorIdx];
      const r = parseInt(neon.slice(1, 3), 16);
      const g = parseInt(neon.slice(3, 5), 16);
      const b = parseInt(neon.slice(5, 7), 16);
      const radius = 160;

      const grad = glowCtx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, radius);
      grad.addColorStop(0,   `rgba(${r},${g},${b},1)`);
      grad.addColorStop(0.3, `rgba(${r},${g},${b},0.7)`);
      grad.addColorStop(0.7, `rgba(${r},${g},${b},0.2)`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

      glowCtx.fillStyle = grad;
      glowCtx.beginPath();
      glowCtx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
      glowCtx.fill();
    }

    function getSize() {
      return { W: hexCanvas.width, H: hexCanvas.height };
    }

    function resize() {
      const W = scene.offsetWidth;
      const H = scene.offsetHeight;
      glowCanvas.width = hexCanvas.width = W;
      glowCanvas.height = hexCanvas.height = H;
      drawHexes(W, H);
      drawGlow(W, H);
    }

    function isOverHexagon(mx, my) {
    const centers = getHexCenters();
    for (const [cx, cy] of centers) {
        const dx = mx - cx - 10;
        const dy = my - cy - 10;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= HEX_INNER) return true;
    }
    return false;
    }

    function onMouseMove(e) {
    const rect = scene.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isOverHexagon(mx, my)) {
        stateRef.current.mouseX = mx;
        stateRef.current.mouseY = my;
        scene.style.cursor = "none";
    } else {
        stateRef.current.mouseX = -9999;
        stateRef.current.mouseY = -9999;
        scene.style.cursor = "default";
    }

    const { W, H } = getSize();
    drawGlow(W, H);
    }

    function onTouchMove(e) {
      e.preventDefault();
      const rect = scene.getBoundingClientRect();
      stateRef.current.mouseX = e.touches[0].clientX - rect.left;
      stateRef.current.mouseY = e.touches[0].clientY - rect.top;
      const { W, H } = getSize();
      drawGlow(W, H);
    }

    function onMouseLeave() {
      stateRef.current.mouseX = -9999;
      stateRef.current.mouseY = -9999;
      const { W, H } = getSize();
      drawGlow(W, H);
    }

    function onClick() {
      stateRef.current.colorIdx = (stateRef.current.colorIdx + 1) % COLORS.length;
      const { W, H } = getSize();
      drawGlow(W, H);
    }

    scene.addEventListener("mousemove", onMouseMove);
    scene.addEventListener("touchmove", onTouchMove, { passive: false });
    scene.addEventListener("mouseleave", onMouseLeave);
    scene.addEventListener("click", onClick);
    window.addEventListener("resize", resize);
    resize();

    return () => {
      scene.removeEventListener("mousemove", onMouseMove);
      scene.removeEventListener("touchmove", onTouchMove);
      scene.removeEventListener("mouseleave", onMouseLeave);
      scene.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="hex-scene" ref={sceneRef}>
      <canvas ref={glowRef} />
      <canvas ref={hexRef} />
    </div>
  );
}