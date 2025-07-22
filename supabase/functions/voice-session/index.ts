
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const agentId = Deno.env.get('AGENT_ID');
    const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID');

    if (!elevenlabsApiKey || !agentId) {
      return new Response(
        JSON.stringify({ error: 'Missing ElevenLabs configuration' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, conversationId } = await req.json();

    if (action === 'get_signed_url') {
      // Generate signed URL for ElevenLabs conversation
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': elevenlabsApiKey,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to get signed URL from ElevenLabs' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ 
          signed_url: data.signed_url,
          agent_id: agentId,
          voice_id: voiceId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'end_session' && conversationId) {
      // End the conversation session
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'xi-api-key': elevenlabsApiKey,
          },
        }
      );

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in voice-session function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
