import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #22c55e 0%, #a855f7 100%)',
          borderRadius: '20%',
        }}
      >
        <span
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: 'white',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          P
        </span>
      </div>
    ),
    {
      width: 32,
      height: 32,
    }
  );
}
