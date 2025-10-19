// ...existing code...
import { useEffect, useMemo, useRef, useState } from 'react';

type Photo = { src: string };

const HEART_PATH = (t: number) => {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
};

function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch('/photos/manifest.json')
      .then((r) => r.json())
      .then((list: string[]) => {
        if (!mounted) return;
        const mapped = list.map((name) => ({ src: `/photos/${name}` }));
        setPhotos(mapped);
      })
      .catch(() => setPhotos([]));
    return () => {
      mounted = false;
    };
  }, []);
  return photos;
}

export default function HeartMosaic() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const photos = usePhotos();
  const images = useMemo(() => {
    const source = photos.length > 1 ? photos.filter(p => !p.src.endsWith('placeholder.jpg')) : photos;
    const imgs: HTMLImageElement[] = [];
    for (const p of source) {
      const img = new Image();
      img.src = p.src;
      imgs.push(img);
    }
    return imgs;
  }, [photos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let start = performance.now();

  function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const parent = canvas.parentElement;
  const width = parent ? parent.clientWidth : window.innerWidth;
  const height = parent ? parent.clientHeight : window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  // keep drawing coordinates in CSS pixels by scaling by dpr once here
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

    function draw(now: number) {
      if (!canvas || !ctx) return;
      const t = (now - start) / 1000;
      // Use CSS-px coordinates (vw/vh) because ctx has been scaled by dpr in resize()
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const vw = canvas.width / dpr;
      const vh = canvas.height / dpr;

      // clear using CSS-px dimensions
      ctx.clearRect(0, 0, vw, vh);

      // No resetting transform here (resize already set ctx to scale by dpr)
      ctx.save();

      let scale = Math.min(vw, vh) * 0.038;
      let offsetY = 0;

      if (vh > vw) {
        scale = Math.min(vw, vh) * 0.075; // tăng tỉ lệ để tim đầy hơn
        offsetY = vh * 0.12;              // đẩy tim xuống giữa khung mobile
      }

      // Container rectangle background (uniform color to fully cover and be consistent)
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      const grad = ctx.createLinearGradient(0, 0, 0, vh);
      grad.addColorStop(0, 'rgba(255, 61, 110, 0.4)');
      grad.addColorStop(1, 'rgba(255, 140, 180, 0.4)');
      ctx.fillStyle = grad;
      // fill with CSS-px rect
      ctx.fillRect(0, 0, vw, vh);
      ctx.restore();

      // Create heart path (center using CSS-px)
      ctx.save();
      const cx = vw / 2;
      const cy = vh / 2;

      if (vh > vw) {
        ctx.translate(cx, cy + vh * 0.12);
      } else {
        ctx.translate(cx, cy);
      }

      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const a = (i / 200) * Math.PI * 2;
        const { x, y } = HEART_PATH(a);
        const px = x * scale;
        const py = -y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.clip();

      // Mosaic tiles (lower density = larger tile => ảnh rõ hơn)
      const tile = Math.max(36, Math.floor(Math.min(vw, vh) / 12));
      const cols = Math.ceil(vw / tile) + 2;
      const rows = Math.ceil(vh / tile) + 2;

      for (let yy = -rows / 2; yy < rows / 2; yy++) {
        for (let xx = -cols / 2; xx < cols / 2; xx++) {
          const gx = xx * tile;
          const gy = yy * tile;
          const jitterX = Math.sin((xx + yy) * 0.5 + t * 0.8) * 1.4;
          const jitterY = Math.cos((xx - yy) * 0.5 + t * 0.8) * 1.4;
          const angle = Math.sin((xx * 0.25) + (yy * 0.18) + t * 0.4) * 0.045;

          ctx.save();
          ctx.translate(gx + jitterX, gy + jitterY);
          ctx.rotate(angle);

          if (images.length > 0) {
            const h = Math.abs(Math.sin(xx * 12.9898 + yy * 78.233) * 43758.5453);
            const offset = Math.floor((t * 0.3)) % images.length;
            const pick = (Math.floor(h) + offset) % images.length;
            const img = images[pick];
            const ready = img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
            if (ready) {
              const iw = img.naturalWidth;
              const ih = img.naturalHeight;
              const s = Math.max(tile / iw, tile / ih);
              const dw = iw * s;
              const dh = ih * s;
              // draw using CSS-px coordinates (ctx already scaled)
              ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
            } else {
              const g = ctx.createLinearGradient(-tile / 2, -tile / 2, tile / 2, tile / 2);
              g.addColorStop(0, '#ff3d6e');
              g.addColorStop(1, '#ffd1e0');
              ctx.fillStyle = g;
              ctx.fillRect(-tile / 2, -tile / 2, tile, tile);
            }
          } else {
            const g = ctx.createLinearGradient(-tile / 2, -tile / 2, tile / 2, tile / 2);
            g.addColorStop(0, '#ff3d6e');
            g.addColorStop(1, '#ffd1e0');
            ctx.fillStyle = g;
            ctx.fillRect(-tile / 2, -tile / 2, tile, tile);
          }

          ctx.restore();
        }
      }

      ctx.restore();

      // Soft glow outline
      ctx.save();
      ctx.translate(vw / 2, vh / 2 + 20);
      ctx.globalAlpha = 0.6;
      for (let r = 0; r < 6; r++) {
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const a = (i / 200) * Math.PI * 2;
          const { x, y } = HEART_PATH(a);
          const px = x * scale * (1 + r * 0.015 + Math.sin(t + a) * 0.003);
          const py = -y * scale * (1 + r * 0.015 + Math.cos(t + a) * 0.003);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(255,61,110,${0.12 - r * 0.015})`;
        ctx.lineWidth = 2 + r * 1.2;
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore();

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [images]);

  return (
    <div className="shine mosaicContainer">
      <canvas ref={canvasRef} style={{ width: '100%',
    height: '100%',
    display: 'block',
    borderRadius: 24,
    boxShadow: '0 20px 60px rgba(255,61,110,0.25)',}} className="glass" />
    </div>
  );
}
// ...existing code...