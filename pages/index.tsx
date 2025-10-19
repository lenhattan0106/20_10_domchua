import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import HeartMosaic from '@/src/components/HeartMosaic';
import GreetingCard from '@/src/components/GreetingCard';
import ParallaxHearts from '@/src/components/ParallaxHearts';
import ThreeGalaxy from '@/src/components/ThreeGalaxy';
import BelowHeart from '@/src/components/BelowHeart';

const Particles = dynamic(() => import('@/src/components/Particles'), { ssr: false });

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <Head>
        <title>20-10 | Gửi Hà Kim Thảo xinh đẹp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Thiệp 20-10 với trái tim ghép từ ảnh kỷ niệm" />
      </Head>
      <main className="pageRoot section">
        {mounted && <ThreeGalaxy />}
        {mounted && <ParallaxHearts />}
        {mounted && <Particles />}
        <div className="spacerSm" />
        <HeartMosaic />
        <div className="spacerMd" />
        <div className="spacerLg" />
        <GreetingCard />
        <footer className="footer">
          <span>Gửi tặng người đặc biệt nhân ngày 20/10 ❤️</span>
        </footer>
      </main>
    </>
  );
}


