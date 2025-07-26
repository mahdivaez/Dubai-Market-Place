import { db, testConnection, initializeDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  console.log("API/posts: Fetching all posts...");

  if (!apiKey || apiKey !== process.env.MY_API_KEY) {
    console.log("API/posts: Unauthorized access attempt");
    return NextResponse.json(
      { error: "Unauthorized", details: "Invalid API key", posts: [], count: 0 },
      { status: 401 }
    );
  }

  try {
    console.log("API/posts: Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("API/posts: Database connection failed");
      return NextResponse.json(
        { error: "Database connection failed", posts: [], count: 0 },
        { status: 500 }
      );
    }

    await initializeDatabase();
    console.log("API/posts: Database initialized");

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
      ORDER BY date DESC, created_at DESC`
    );

    const formattedPosts = (posts as any[]).map((post) => ({
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
    }));

    console.log(`API/posts: Found ${formattedPosts.length} posts`);
    return NextResponse.json(
      {
        posts: formattedPosts,
        count: formattedPosts.length,
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
    console.error("API/posts: Database error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        posts: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  console.log("API/posts: Creating new post...");

  if (!apiKey || apiKey !== process.env.MY_API_KEY) {
    console.log("API/posts: Unauthorized access attempt for POST");
    return NextResponse.json(
      { error: "Unauthorized", details: "Invalid API key" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, agentId, title, content, transcription, caption, originalUrl, thumbnail } = body;

    if (!id || !agentId) {
      console.log("API/posts: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields", details: "id and agentId are required" },
        { status: 400 }
      );
    }

    console.log("API/posts: Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("API/posts: Database connection failed");
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    await initializeDatabase();
    console.log("API/posts: Database initialized");

    await db.query(
      `INSERT INTO posts (id, agent_id, title, content, transcription, date, caption, original_url, thumbnail) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        id,
        agentId,
        title || null,
        content || null,
        transcription || null,
        caption || null,
        originalUrl || null,
        thumbnail || null,
      ]
    );

    console.log("API/posts: Post created successfully:", id);
    return NextResponse.json(
      { message: "Post created successfully", postId: id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("API/posts: Error creating post:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}