export interface Agent {
  id: string;
  name: string;
  address: string;
  bio: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  profileImage?: string; // Potential Mismatch: DB has 'profile_image', interface has 'profileImage'. Ensure your API route handles this casing.
}

export interface Post {
  id: string;
  agentId: string; // Potential Mismatch: DB has 'agent_id', interface has 'agentId'. Ensure your API route handles this casing.
  title: string;
  content: string;
  transcription?: string;
  date: string;
  thumbnail: string;
  media?: {
    type: string;
    thumbnail: string;
  }; // Logic Issue: Your DB schema only has 'thumbnail'. If frontend expects 'media.thumbnail', your API route must construct this object.
  caption: string;
  originalUrl: string; // Potential Mismatch: DB has 'original_url', interface has 'originalUrl'. Ensure your API route handles this casing.
}

// Helper function to get the base URL
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Client side
    // POTENTIAL BUG: Returning '' means relative paths. This works ONLY if the API is on the same origin (same domain, same port) as the frontend.
    // If your API is on a subdomain, different port, or a completely different service, '' will result in incorrect URLs (e.g., trying to fetch from example.com/api/posts/1 when API is api.example.com/api/posts/1).
    // For Next.js, relative paths usually work well if your API routes are in `pages/api`.
    // If you're seeing 404s, this is often the FIRST place to check.
    // Suggestion for debugging:
    // return window.location.origin; // This will return 'http://localhost:3000' or 'https://your-vercel-app.vercel.app'
    return ''; // Keep as '' if you are confident your Next.js setup handles relative paths correctly for internal API routes.
  }

  // Server side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

export async function getAgentById(agentId: string): Promise<Agent | null> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/agents/${agentId}`;

    console.log('Fetching agent from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch agent: ${response.status} ${response.statusText}. URL: ${url}`); // Added URL to log
      return null;
    }

    const data = await response.json();
    console.log('Agent data received:', data);
    // FIX/CHECK: 'data.agent' vs 'data'. This depends *entirely* on what your actual API route returns.
    // If your API route for `api/agents/[agentId].ts` does `res.status(200).json({ agent: agentData });`, then `data.agent` is correct.
    // If it does `res.status(200).json(agentData);`, then `return data;` is correct.
    // Verify your API implementation.
    return data.agent;
  } catch (error) {
    console.error("Error fetching agent:", error);
    return null;
  }
}

export async function getAgentPosts(agentId: string): Promise<Post[]> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/agents/${agentId}/posts`;

    console.log('Fetching agent posts from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch agent posts: ${response.status} ${response.statusText}. URL: ${url}`); // Added URL to log
      return [];
    }

    const data = await response.json();
    console.log('Agent posts data received:', data);
    // FIX/CHECK: 'data.posts' vs 'data'. Verify your API implementation.
    return data.posts || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getAllAgents(): Promise<Agent[]> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/agents`;

    console.log('Fetching agents from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch agents: ${response.status} ${response.statusText}. URL: ${url}`);
      return [];
    }

    const data = await response.json();
    console.log('Agents data received:', data);
    // FIX/CHECK: 'data.agents' vs 'data'. Verify your API implementation.
    return data.agents || [];
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/posts/${postId}`; // This endpoint is crucial

    console.log('Fetching post from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      // THIS IS WHERE THE 404 IS REPORTED!
      console.error(`Failed to fetch post: ${response.status} ${response.statusText}. URL: ${url}`);
      return null;
    }

    const data = await response.json();
    console.log('Post data received:', data);
    // FIX/CHECK: 'data.post' vs 'data'. Verify your API implementation for single post.
    return data.post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/posts`;

    console.log('Fetching all posts from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch posts: ${response.status} ${response.statusText}. URL: ${url}`);
      return [];
    }

    const data = await response.json();
    console.log('All posts data received:', data);
    // FIX/CHECK: 'data.posts' vs 'data'. Verify your API implementation.
    return data.posts || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}