import { NextRequest, NextResponse } from 'next/server';
import { liveGameEmitter } from '@/lib/game/liveSyncStream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const quizCode = searchParams.get('code');

  if (!quizCode) {
    return NextResponse.json({ success: false, error: 'Quiz code required' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const channel = `session:${quizCode}`;

      const eventHandler = (eventData: any) => {
        try {
          const payload = `data: ${JSON.stringify(eventData)}\n\n`;
          controller.enqueue(new TextEncoder().encode(payload));
        } catch (err) {
          console.error('SSE enqueue error:', err);
        }
      };

      liveGameEmitter.on(channel, eventHandler);

      // Send initial connection heartbeat
      const initMessage = `data: ${JSON.stringify({ type: 'CONNECTED', quizCode, timestamp: Date.now() })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initMessage));

      // Heartbeat ping every 15 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        liveGameEmitter.off(channel, eventHandler);
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
