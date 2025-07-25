import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  let connection;
  try {
    const { postId } = await params; // Await params to get postId
    console.log(`API: Fetching post ${postId}`);
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
        thumbnail
      FROM posts 
      WHERE id = ?`,
      [postId]
    );

    if (!posts || (posts as any[]).length === 0) {
      console.log(`API: Post ${postId} not found`);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = (posts as any[])[0];
    const formattedPost = {
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
      }
    };

    console.log(`API: Found post ${postId}:`, formattedPost);
    return NextResponse.json({ post: formattedPost }, { status: 200 });
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