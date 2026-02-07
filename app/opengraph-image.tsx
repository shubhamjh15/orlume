import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'Orlume - The AI Website Builder'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
            }}
        >
            {/* Simple CSS shape as logo placeholder since we can't easily load local assets in edge runtime without fetch */}
             <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(to bottom right, #ec4899, #a855f7)',
                marginRight: '20px',
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
             }}>✨</div>
             <h1 style={{ fontSize: '90px', margin: 0, fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #888)', backgroundClip: 'text', color: 'transparent' }}>orlume.</h1>
        </div>
        <p style={{ fontSize: '32px', color: '#888', maxWidth: '800px', textAlign: 'center' }}>
          Where interfaces bloom into beautiful websites.
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
