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
    return '';
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}
export async function getAgentById(agentId: string) {
  try {
    const apiBaseUrl = process.env.API_BASE_URL || "https://dubai-market-place.vercel.app";
    const response = await fetch(`${apiBaseUrl}/api/agents/${agentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MY_API_KEY || "",
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.status}`);
    }
    const data = await response.json();
    return data.agent || null;
  } catch (error) {
    console.error("getAgentById: Error:", error);
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

// @/lib/data.ts
// @/lib/data.ts
export async function getAllAgents() {
  try {
    const apiBaseUrl = process.env.API_BASE_URL || "https://dubai-market-place.vercel.app";
    console.log("getAllAgents: Fetching agents from:", `${apiBaseUrl}/api/agents`);
    const response = await fetch(`${apiBaseUrl}/api/agents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MY_API_KEY || "",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    console.log("getAllAgents: Response status:", response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("getAllAgents: Agents fetched:", data.agents);
    return data.agents || [];
  } catch (error) {
    console.error("getAllAgents: Error:", error);
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