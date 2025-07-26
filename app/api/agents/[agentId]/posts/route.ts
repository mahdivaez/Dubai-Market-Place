import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { agentId: string } }) {
  const { params } = context;
  console.log(`API/agents/[agentId]/posts: Fetching posts for agent ${params.agentId}`);

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.MY_API_KEY) {
    console.log(`API/agents/[agentId]/posts: Unauthorized access attempt for agent ${params.agentId}`);
    return NextResponse.json(
      { error: "Unauthorized", details: "Invalid API key", posts: [], count: 0, agentId: params.agentId },
      { status: 401 }
    );
  }

  try {
    console.log(`API/agents/[agentId]/posts: Querying posts for agent ${params.agentId}`);
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
        thumbnail
      FROM posts 
      WHERE agent_id = ?
      ORDER BY date DESC, created_at DESC`,
      [params.agentId]
    );

    const postsArray = posts as any[];
    console.log(`API/agents/[agentId]/posts: Found ${postsArray.length} posts for agent ${params.agentId}`);

    const formattedPosts = postsArray.map((post) => ({
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
    }));

    console.log(`API/agents/[agentId]/posts: Returning ${formattedPosts.length} posts for agent ${params.agentId}`);
    if (formattedPosts.length > 0) {
      console.log("API/agents/[agentId]/posts: Sample post:", {
        id: formattedPosts[0].id,
        title: formattedPosts[0].title,
        thumbnail: formattedPosts[0].thumbnail,
      });
    }

    return NextResponse.json(
      {
        posts: formattedPosts,
        count: formattedPosts.length,
        agentId: params.agentId,
        success: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error(`API/agents/[agentId]/posts: Error fetching posts for agent ${params.agentId}:`, error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        posts: [],
        count: 0,
        agentId: params.agentId,
      },
      { status: 500 }
    );
  }
}