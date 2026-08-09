export const dynamic = 'force-dynamic'

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Send handshake
      controller.enqueue(new TextEncoder().encode('data: {"type":"CONNECTED"}\n\n'))
      
      // Keep connection open using an interval or event emitter
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Critical if using Nginx/Vercel proxies
    },
  })
}