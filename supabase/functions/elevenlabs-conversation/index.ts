
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const url = new URL(req.url);
    const signedUrl = url.searchParams.get('signed_url');
    
    if (!signedUrl) {
      return new Response("Missing signed_url parameter", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    console.log('Connecting to ElevenLabs with signed URL:', signedUrl);
    
    // Connect to ElevenLabs WebSocket
    const elevenlabsSocket = new WebSocket(signedUrl);
    
    elevenlabsSocket.onopen = () => {
      console.log('Connected to ElevenLabs WebSocket');
      socket.send(JSON.stringify({ 
        type: 'connection_status', 
        status: 'connected' 
      }));
    };

    elevenlabsSocket.onmessage = (event) => {
      console.log('Message from ElevenLabs:', event.data);
      // Forward message from ElevenLabs to client
      socket.send(event.data);
    };

    elevenlabsSocket.onclose = (event) => {
      console.log('ElevenLabs WebSocket closed:', event.code, event.reason);
      socket.send(JSON.stringify({ 
        type: 'connection_status', 
        status: 'disconnected',
        reason: event.reason 
      }));
      socket.close();
    };

    elevenlabsSocket.onerror = (error) => {
      console.error('ElevenLabs WebSocket error:', error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'Connection to voice service failed' 
      }));
      socket.close();
    };

    // Handle messages from client to ElevenLabs
    socket.onmessage = (event) => {
      console.log('Message from client:', event.data);
      if (elevenlabsSocket.readyState === WebSocket.OPEN) {
        elevenlabsSocket.send(event.data);
      }
    };

    socket.onclose = () => {
      console.log('Client WebSocket closed');
      if (elevenlabsSocket.readyState === WebSocket.OPEN) {
        elevenlabsSocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
      if (elevenlabsSocket.readyState === WebSocket.OPEN) {
        elevenlabsSocket.close();
      }
    };

    return response;

  } catch (error) {
    console.error('Error in elevenlabs-conversation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
