export interface Agent {
  id: string;
  name: string;
  address: string;
  bio: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  profileImage?: string;
}

export interface Post {
  id: string;
  agentId: string;
  title: string;
  content: string;
  transcription?: string;
  date: string;
  thumbnail: string;
  media?: {
    type: string;
    thumbnail: string;
  };
  caption: string;
  originalUrl: string;
}

// Helper function to get the base URL
function getBaseUrl() {
  // In browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // In Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Use configured API base URL or fallback to localhost
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
}

export async function getAgentById(agentId: string): Promise<Agent | null> {
  try {
    console.log('getAgentById: Fetching agent:', agentId);
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/agents/${agentId}`;
    
    console.log('getAgentById: Making request to:', url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      cache: "no-store", // Changed from next: { revalidate: 3600 } for better debugging
    });
    
    console.log('getAgentById: Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getAgentById: Error response:', errorText);
      throw new Error(`Failed to fetch agent: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('getAgentById: Response data:', data);
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

    console.log('getAgentPosts: Fetching from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`getAgentPosts: Failed - ${response.status} ${response.statusText}. Response:`, errorText);
      return [];
    }

    const data = await response.json();
    console.log('getAgentPosts: Data received:', data);
    return data.posts || [];
  } catch (error) {
    console.error("getAgentPosts: Error:", error);
    return [];
  }
}

export async function getAllAgents(): Promise<Agent[]> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/agents`;
    
    console.log("getAllAgents: Fetching from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      cache: "no-store", // Changed for better debugging
    });
    
    console.log("getAllAgents: Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getAllAgents: Error response:', errorText);
      throw new Error(`Failed to fetch agents: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("getAllAgents: Data received:", data);
    return data.agents || [];
  } catch (error) {
    console.error("getAllAgents: Error:", error);
    return [];
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/posts/${postId}`;

    console.log('getPost: Fetching from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`getPost: Failed - ${response.status} ${response.statusText}. Response:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log('getPost: Data received:', data);
    return data.post;
  } catch (error) {
    console.error("getPost: Error:", error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/posts`;

    console.log('getAllPosts: Fetching from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`getAllPosts: Failed - ${response.status} ${response.statusText}. Response:`, errorText);
      return [];
    }

    const data = await response.json();
    console.log('getAllPosts: Data received:', data);
    return data.posts || [];
  } catch (error) {
    console.error("getAllPosts: Error:", error);
    return [];
  }
}