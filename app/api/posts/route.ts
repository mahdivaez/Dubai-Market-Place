import { db, testConnection, initializeDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let connection;
  try {
    console.log('API: Fetching all posts');
    
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
      ORDER BY date DESC, created_at DESC`
    );

    const formattedPosts = (posts as any[]).map(post => ({
      id: post.id,
      agentId: post.agentId,
      title: post.title,
      content: post.content,
      transcription: post.transcription,
      date: post.date,
      caption: post.caption,
      originalUrl: post.originalUrl,
      thumbnail: post.thumbnail,
      media: {
        type: 'image',
        thumbnail: post.thumbnail
      },
      enhancedContent: post.enhancedContent
    }));

    console.log(`API: Found ${formattedPosts.length} posts`);
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

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { id, agentId, title, content, transcription, caption, originalUrl, thumbnail } = body;

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('API: Database connection failed');
      return NextResponse.json({ 
        error: "Database connection failed"
      }, { status: 500 });
    }

    // Initialize database
    await initializeDatabase();

    connection = await db.getConnection();

    await connection.query(
      `INSERT INTO posts (id, agent_id, title, content, transcription, date, caption, original_url, thumbnail) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [id, agentId, title, content, transcription, caption, originalUrl, thumbnail]
    );

    return NextResponse.json({ message: "Post created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}