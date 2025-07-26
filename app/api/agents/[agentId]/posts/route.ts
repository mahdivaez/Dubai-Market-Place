import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { agentId: string } }) {
  let connection;
  try {
    const { params } = context;
    const awaitedParams = await params;
    console.log(`API: Fetching posts for agent ${awaitedParams.agentId}`);
    
    connection = await db.getConnection();

    // Query posts with proper column mapping and ensure posts exist
    const [posts] = await connection.query(
      `SELECT 
        id,
        agent_id AS agentId,
        title,
        content,
        transcription,
        date,
        caption,
        original_url AS originalUrl,
        thumbnail
      FROM posts 
      WHERE agent_id = ?
      ORDER BY date DESC, created_at DESC`,
      [awaitedParams.agentId]
    );

    const postsArray = posts as any[];
    console.log(`API: Found ${postsArray.length} posts for agent ${awaitedParams.agentId}`);

    const formattedPosts = postsArray.map(post => ({
      id: post.id,
      agentId: post.agentId,
      title: post.title || '',
      content: post.content || '',
      transcription: post.transcription || null,
      date: post.date,
      caption: post.caption || '',
      originalUrl: post.originalUrl || '',
      thumbnail: post.thumbnail || '', // Ensure we have a thumbnail value
      media: {
        type: 'image', // Default to image
        thumbnail: post.thumbnail || '' // Use database thumbnail
      }
    }));

    console.log(`API: Returning formatted posts for agent ${awaitedParams.agentId}:`, formattedPosts.length);
    
    // Debug: Log first post if exists
    if (formattedPosts.length > 0) {
      console.log('API: Sample post:', {
        id: formattedPosts[0].id,
        title: formattedPosts[0].title,
        thumbnail: formattedPosts[0].thumbnail
      });
    }

    return NextResponse.json({ 
      posts: formattedPosts,
      count: formattedPosts.length,
      agentId: awaitedParams.agentId,
      success: true
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("API: Database error fetching posts:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error',
      posts: [], // Return empty array as fallback
      count: 0,
      agentId: context.params?.agentId || 'unknown'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}