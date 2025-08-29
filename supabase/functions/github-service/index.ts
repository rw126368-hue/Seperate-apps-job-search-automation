import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getGithubToken(supabaseClient: any) {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error || !session) {
    throw new Error("Could not get user session from Supabase.");
  }
  if (session.provider_token) {
    return session.provider_token;
  }
  throw new Error("GitHub provider token not found. Please sign in with GitHub.");
}

async function getRepoDetails(githubToken: string) {
    const userResponse = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${githubToken}` },
    });
    if (!userResponse.ok) throw new Error("Failed to fetch GitHub user.");
    const { login } = await userResponse.json();

    const repoResponse = await fetch(`https://api.github.com/user/repos?type=owner`, {
        headers: { 'Authorization': `token ${githubToken}` },
    });
    if (!repoResponse.ok) throw new Error("Failed to fetch user repositories.");
    const repos = await repoResponse.json();
    
    // Assuming the app is in a repo named 'Seperate-apps-job-search-automation'
    const repo = repos.find((r: any) => r.name === 'Seperate-apps-job-search-automation');
    if (!repo) throw new Error("Could not find the 'Seperate-apps-job-search-automation' repository.");

    return { owner: login, repo: repo.name };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, filePath, fileContent } = await req.json();
    const supabaseClient = createClient(req.headers.get('Authorization')!);
    const githubToken = await getGithubToken(supabaseClient);
    const { owner, repo } = await getRepoDetails(githubToken);

    if (action === 'upload_resume') {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

      const githubResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `feat: Add master resume - ${filePath}`,
          content: fileContent, // Already base64 encoded from the frontend
        }),
      });

      const responseData = await githubResponse.json();

      if (!githubResponse.ok) {
        throw new Error(`GitHub API Error: ${responseData.message || 'Failed to upload file.'}`);
      }

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in github-service:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
