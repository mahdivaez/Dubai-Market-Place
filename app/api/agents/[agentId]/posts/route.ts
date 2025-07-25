import { db, testConnection, initializeDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ agentId: string }> }
) {
  let connection;
  try {
    const params = await context.params;
    const { agentId } = params;
    
    console.log(`API: Fetching posts for agent ${agentId}`);
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('API: Database connection failed');
      return NextResponse.json({ 
        error: "Database connection failed",
        posts: [],
        count: 0
      }, { status: 500 });
    }
    
    // Initialize database
    await initializeDatabase();
    
    connection = await db.getConnection();

    // Query posts with proper column mapping
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
        thumbnail,
        enhanced_content AS enhancedContent
      FROM posts 
      WHERE agent_id = ?
      ORDER BY date DESC, created_at DESC`,
      [agentId]
    );

    console.log(`API: Found ${(posts as any[]).length} posts for agent ${agentId}`);

    const formattedPosts = (posts as any[]).map(post => ({
      id: post.id,
      agentId: post.agentId,
      title: post.title || '',
      content: post.content || '',
      transcription: post.transcription || null,
      date: post.date,
      caption: post.caption || '',
      originalUrl: post.originalUrl || '',
      thumbnail: post.thumbnail,
      media: {
        type: 'image',
        thumbnail: post.thumbnail
      },
      enhancedContent: post.enhancedContent || null
    }));

    console.log(`API: Returning formatted posts:`, formattedPosts.length);

    return NextResponse.json({ 
      posts: formattedPosts,
      count: formattedPosts.length 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error',
      posts: []
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}