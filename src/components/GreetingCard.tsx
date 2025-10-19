// ...existing code...
import { useEffect, useRef, useState } from 'react';

export default function GreetingCard() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [opened, setOpened] = useState(false);
  const [modal, setModal] = useState(false);

  // track pointer down/up to distinguish tap vs scroll/drag
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--rx', `${y * -10}deg`);
      el.style.setProperty('--ry', `${x * 12}deg`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Close modal on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when modal open (restore on close/unmount)
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (modal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevOverflow || '';
    }
    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [modal]);

  return (
    <section aria-label="Thiệp chúc mừng" style={{ position: 'relative', marginTop: -40 }}>
      {/* Trigger card */}
      <div
        ref={ref}
        className="glass float"
        style={{
          width: 680,
          maxWidth: '92vw',
          padding: 24,
          borderRadius: 20,
          transform: 'perspective(900px) rotateX(var(--rx, 0)) rotateY(var(--ry, 0))',
          cursor: 'pointer',
        }}
        onClick={() => {
          setModal(true);
          if (typeof (window as any).__burstHeart__ === 'function') {
            (window as any).__burstHeart__();
          }
        }}
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <h1 style={{ margin: '8px 0 6px', fontSize: 30 }}>Nhấn để mở thiệp 💌</h1>
          <div style={{ opacity: 0.85 }}>Chúc mừng 20/10 dành riêng cho bạn</div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="modalOverlay"
          // use pointer events to distinguish tap vs scroll: record down/up and only close on small movement + target is overlay
          onPointerDown={(e) => {
            pointerDownRef.current = { x: (e as any).clientX, y: (e as any).clientY };
          }}
          onPointerUp={(e) => {
            const down = pointerDownRef.current;
            pointerDownRef.current = null;
            if (!down) return;
            const dx = Math.abs(down.x - (e as any).clientX);
            const dy = Math.abs(down.y - (e as any).clientY);
            const moved = Math.hypot(dx, dy);
            // if pointer released on overlay itself and movement is small -> treat as tap -> close
            if (e.currentTarget === e.target && moved < 8) {
              setModal(false);
            }
          }}
        >
          <div className="modalCard shimmer" onClick={(e) => e.stopPropagation()}>
            <h1 style={{ margin: '8px 0 10px', fontSize: 40, letterSpacing: 0.5 }}>
              Chúc mừng 20/10, người con gái xinh đẹp! 💖
            </h1>
            <p style={{ margin: 0, lineHeight: 1.75, fontSize: 18, opacity: 0.96 }}>
              Chúc bạn luôn xinh đẹp, hạnh phúc, và rạng rỡ mỗi ngày. Cảm ơn bạn đã đến
              bên mình, và tạo cho mình nhiều khoảnh khắc đáng nhớ. 
              Mình không biết nên nói điều gì để nữa, chỉ biết cảm ơn bạn – vì đã đến, đã làm cho những ngày bình thường trở nên đáng nhớ. Chúc bạn luôn rạng rỡ, luôn tìm thấy niềm vui trong từng điều nhỏ bé.
              Nếu sau này có dịp ở cùng một thành phố, hy vọng chúng ta sẽ cùng nhau đi dạo, ngồi trò chuyện và mình có thể tặng bạn món quà mà hôm nay chỉ có thể gửi bằng những dòng chữ này.
              Còn nếu không có duyên được ở cùng một nơi, thì xem như chúng ta đã có những kỷ niệm thật đẹp về nhau — những kỷ niệm mà mình sẽ luôn trân trọng. 🌷
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <span className="glass" style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,61,110,0.15)', borderColor: 'rgba(255,61,110,0.35)' }}>
                ❤️ Mãi xinh đẹp nhé
              </span>
              <span className="glass" style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,209,224,0.15)', borderColor: 'rgba(255,209,224,0.35)' }}>
                ✨ Hạnh phúc mỗi ngày
              </span>
              <span className="glass" style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)' }}>
                🎁 Gymer trẻ :D
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button
                className="glass"
                onClick={() => setModal(false)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.12)',
                  color: 'var(--text)'
                }}
              >Đóng</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
// ...existing code...