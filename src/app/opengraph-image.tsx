import { ImageResponse } from 'next/og';

import { getStats } from '@/lib/sites';

export const alt = 'Awesome AI Tool · AI 工具导航';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const stats = getStats();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #171233 55%, #0a0a0f 100%)',
        color: '#f5f5f7',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 28, color: '#8b7bff', marginBottom: 24 }}>
        Open Source AI Directory
      </div>
      <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
        Awesome AI Tool
      </div>
      <div style={{ display: 'flex', fontSize: 32, color: '#a0a0b0', marginTop: 24 }}>
        {stats.total} AI tools · {stats.categories} categories · powered by LobeHub Icons
      </div>
    </div>,
    size,
  );
}
