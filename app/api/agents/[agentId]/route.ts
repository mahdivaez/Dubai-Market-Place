import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { agentId: string } }) {
  let connection;
  try {
    connection = await db.getConnection();
    const { params } = context;
    const awaitedParams = await params;
    
    console.log(`API: Fetching agent ${awaitedParams.agentId}`);
    
    // Fetch the agent - REMOVED profile_image
    const [agents] = await connection.query(
      `SELECT 
        id, 
        name, 
        profile_image, 
        address, 
        bio, 
        instagram, 
        twitter, 
        linkedin
       FROM agents WHERE id = ?`,
      [awaitedParams.agentId]
    );

    if (!agents || (agents as any[]).length === 0) {
      console.log(`API: Agent ${awaitedParams.agentId} not found`);
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const agent = (agents as any[])[0];
    
    // Format agent data properly - NO profile_image
    const formattedAgent = {
      id: agent.id,
      name: agent.name,
      address: agent.address,
      bio: agent.bio,
      instagram: agent.instagram,
      twitter: agent.twitter,
      linkedin: agent.linkedin,
      profileImage: agent.profile_image // now from DB
    };

    console.log(`API: Returning agent data:`, formattedAgent);
    return NextResponse.json({ agent: formattedAgent }, { status: 200 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}