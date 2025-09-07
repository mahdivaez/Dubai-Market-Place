import { db } from "./db";

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
    const [rows] = await db.query(
      `SELECT id, name, address, bio, instagram, twitter, linkedin, profile_image as profileImage FROM agents WHERE id = ?`,
      [agentId]
    );
    if ((rows as any[]).length === 0) return null;
    return (rows as any[])[0];
  } catch (error) {
    console.error("getAgentById: Error:", error);
    return null;
  }
}

export async function getAgentPosts(agentId: string): Promise<Post[]> {
  try {
    const [rows] = await db.query(
      `SELECT id, agent_id as agentId, title, content, transcription, date, caption, original_url as originalUrl, thumbnail FROM posts WHERE agent_id = ?`,
      [agentId]
    );
    return (rows as any[]).map(row => ({
      ...row,
    }));
  } catch (error) {
    console.error("getAgentPosts: Error:", error);
    return [];
  }
}

export async function getAllAgents(): Promise<Agent[]> {
  try {
    const [rows] = await db.query(`SELECT id, name, address, bio, instagram, twitter, linkedin, profile_image as profileImage FROM agents`);
    return (rows as any[]).map(row => ({
      ...row,
    }));
  } catch (error) {
    console.error("getAllAgents: Error:", error);
    return [];
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  try {
    const [rows] = await db.query(
      `SELECT id, agent_id as agentId, title, content, transcription, date, caption, original_url as originalUrl, thumbnail FROM posts WHERE id = ?`,
      [postId]
    );
    if ((rows as any[]).length === 0) return null;
    return (rows as any[])[0];
  } catch (error) {
    console.error("getPost: Error:", error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const [rows] = await db.query(`SELECT id, agent_id as agentId, title, content, transcription, date, caption, original_url as originalUrl, thumbnail FROM posts`);
    return (rows as any[]).map(row => ({
      ...row,
    }));
  } catch (error) {
    console.error("getAllPosts: Error:", error);
    return [];
  }
}

export const dynamic = "force-dynamic";