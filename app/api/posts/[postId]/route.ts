import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { postId: string } }) {
  const { params } = context;
  console.log(`API/posts/[postId]: Fetching post ${params.postId}`);

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.MY_API_KEY) {
    console.log(`API/posts/[postId]: Unauthorized access attempt for post ${params.postId}`);
    return NextResponse.json(
      { error: "Unauthorized", details: "Invalid API key" },
      { status: 401 }
    );
  }

  try {
    console.log(`API/posts/[postId]: Querying post ${params.postId}`);
    const [posts] = await db.query(
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
      WHERE id = ?`,
      [params.postId]
    );

    if (!posts || (posts as any[]).length === 0) {
      console.log(`API/posts/[postId]: Post ${params.postId} not found`);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = (posts as any[])[0];
    const formattedPost = {
      id: post.id,
      agentId: post.agentId,
      title: post.title || "",
      content: post.content || "",
      transcription: post.transcription || null,
      date: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
      caption: post.caption || "",
      originalUrl: post.originalUrl || "",
      thumbnail: post.thumbnail || "",
      media: {
        type: "image",
        thumbnail: post.thumbnail || "",
      },
      enhancedContent: post.enhancedContent || null,
    };

    console.log(`API/posts/[postId]: Returning post ${params.postId}`);
    return NextResponse.json(
      { post: formattedPost },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error(`API/posts/[postId]: Error fetching post ${params.postId}:`, error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}