import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { agentId: string } }) {
  const { params } = context;
  console.log(`API/agents/[agentId]: Fetching agent ${params.agentId}`);

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.MY_API_KEY) {
    console.log(`API/agents/[agentId]: Unauthorized access attempt for agent ${params.agentId}`);
    return NextResponse.json(
      { error: "Unauthorized", details: "Invalid API key" },
      { status: 401 }
    );
  }

  try {
    console.log(`API/agents/[agentId]: Querying agent ${params.agentId}`);
    const [agents] = await db.query(
      `SELECT 
        id, 
        name, 
        profile_image AS profileImage, 
        address, 
        bio, 
        instagram, 
        twitter, 
        linkedin
       FROM agents 
       WHERE id = ?`,
      [params.agentId]
    );

    if (!agents || (agents as any[]).length === 0) {
      console.log(`API/agents/[agentId]: Agent ${params.agentId} not found`);
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const agent = (agents as any[])[0];
    const formattedAgent = {
      id: agent.id,
      name: agent.name,
      address: agent.address || "",
      bio: agent.bio || "",
      instagram: agent.instagram || null,
      twitter: agent.twitter || null,
      linkedin: agent.linkedin || null,
      profileImage: agent.profileImage || null,
    };

    console.log(`API/agents/[agentId]: Returning agent data for ${params.agentId}`);
    return NextResponse.json(
      { agent: formattedAgent },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error(`API/agents/[agentId]: Error fetching agent ${params.agentId}:`, error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}