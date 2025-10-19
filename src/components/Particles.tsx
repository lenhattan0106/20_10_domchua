import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  shape: 'dot' | 'heart' | 'star';
  life?: number; // for burst particles
};

function drawHeart(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath();
  const s = size / 15;
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(a), 3) * s;
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    ctx.lineTo(x, -y * s);
  }
  ctx.closePath();
}

export default function Particles() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: Particle[] = [];
    let raf = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const isMobile = width <= 768;
      const base = isMobile ? 42000 : 28000;
      const count = Math.round((width * height) / base);
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 6 + Math.random() * 8,
        hue: 330 + Math.random() * 40,
        shape: Math.random() < 0.15 ? 'heart' : Math.random() < 0.5 ? 'star' : 'dot',
      }));
    }

    function draw() {
      if (!canvas || !ctx) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 0.7)`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.8)`;
        ctx.shadowBlur = 8;
        if (p.shape === 'dot') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.18, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'heart') {
          drawHeart(ctx, p.size);
          ctx.fill();
        } else {
          // star
          ctx.beginPath();
          const spikes = 5;
          const outer = p.size * 0.28;
          const inner = outer * 0.5;
          for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const a = (i / (spikes * 2)) * Math.PI * 2;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      // fade and remove burst particles
      particles = particles.filter((p) => {
        if (typeof p.life === 'number') {
          p.life -= 1;
          return p.life > 0;
        }
        return true;
      });
      raf = requestAnimationFrame(draw);
    }

    function burst(x: number, y: number) {
      const n = 28;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const speed = 1.2 + Math.random() * 1.2;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: 8 + Math.random() * 10,
          hue: 330 + Math.random() * 40,
          shape: Math.random() < 0.4 ? 'heart' : 'star',
          life: 80 + Math.floor(Math.random() * 40),
        });
      }
    }

    function handleClick(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      burst(e.clientX - rect.left, e.clientY - rect.top);
    }
    canvas.addEventListener('click', handleClick);

    // Expose global burst event
    (window as any).__burstHeart__ = (x?: number, y?: number) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      burst((x ?? rect.width / 2), (y ?? rect.height / 2));
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      if ((window as any).__burstHeart__) delete (window as any).__burstHeart__;
    };
  }, []);

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}


