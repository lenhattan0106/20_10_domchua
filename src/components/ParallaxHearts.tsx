import { useEffect, useRef } from 'react';

function heartXY(t: number) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

export default function ParallaxHearts() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const t = Date.now() / 1000;
      const layers = [
        { count: 8, scale: 0.8, alpha: 0.05 },
        { count: 5, scale: 1.0, alpha: 0.08 },
        { count: 3, scale: 1.2, alpha: 0.10 },
      ];
      const cx = w / 2, cy = h / 2;

      for (let li = 0; li < layers.length; li++) {
        const layer = layers[li];
        for (let i = 0; i < layer.count; i++) {
          const base = (i / layer.count) * Math.PI * 2;
          const { x, y } = heartXY(base + Math.sin(t * 0.2 + i) * 0.2);
          const s = Math.min(w, h) * 0.02 * layer.scale;
          ctx.save();
          ctx.translate(cx + x * s * 4, cy - y * s * 4);
          ctx.scale(s, s);
          ctx.globalAlpha = layer.alpha;
          ctx.beginPath();
          for (let j = 0; j <= 200; j++) {
            const a = (j / 200) * Math.PI * 2;
            const p = heartXY(a);
            if (j === 0) ctx.moveTo(p.x, -p.y);
            else ctx.lineTo(p.x, -p.y);
          }
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
          g.addColorStop(0, 'rgba(255,61,110,0.4)');
          g.addColorStop(1, 'rgba(255,61,110,0)');
          ctx.fillStyle = g;
          ctx.fill();
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}


