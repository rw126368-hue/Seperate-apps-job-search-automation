import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { create } from "https://deno.land/x/djwt@v2.7/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get Google Drive access token
async function getAccessToken(serviceAccountKey: any) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountKey.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    new TextEncoder().encode(serviceAccountKey.private_key),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["sign"]
  );

  const jwt = await create({ alg: "RS256", typ: "JWT" }, payload, privateKey);

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

// ... (rest of the file remains the same)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, file, fileName, folderId, jobApplication } = await req.json();

    if (action === 'check_status') {
      const keyJson = Deno.env.get('GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY');
      if (!keyJson) {
        return new Response(JSON.stringify({ status: 'NOT_SET' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let serviceAccountKey;
      try {
        serviceAccountKey = JSON.parse(keyJson);
      } catch (e) {
        return new Response(JSON.stringify({ status: 'INVALID_JSON', error: 'Could not parse the service account key. Ensure it is valid JSON.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!serviceAccountKey || !serviceAccountKey.client_email || !serviceAccountKey.private_key) {
        return new Response(JSON.stringify({ status: 'INVALID_JSON', error: 'The service account key is missing required fields like client_email or private_key.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        await getAccessToken(serviceAccountKey);
        return new Response(JSON.stringify({ status: 'SUCCESS' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Google Drive auth error during status check:', error);
        return new Response(JSON.stringify({ status: 'AUTH_FAILED', error: error.message }), {
          status: 400, // Use 400 for a client-side error (bad credentials)
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const serviceAccountKey = JSON.parse(Deno.env.get('GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY') || '{}');
    if (!serviceAccountKey.client_email) {
      throw new Error('Google Drive service account key not configured');
    }

    const accessToken = await getAccessToken(serviceAccountKey);

    // ... (The rest of the switch statement for other actions remains the same)
    switch (action) {
      case 'upload_master_resume': {
        // ... (implementation)
      }
      // ... (other cases)
    }

  } catch (error) {
    console.error('Google Drive service error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process Google Drive request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
