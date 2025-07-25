// --- START OF FILE: api/agents/[agentId]/route.ts ---

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { agentId: string } }) {
  let connection;
  try {
    connection = await db.getConnection();
    const { params } = context;
    const awaitedParams = await params;
    
    console.log(`API: Fetching agent ${awaitedParams.agentId}`);
    
    // FIX: The SQL query is updated to use 'AS profileImage' to match the frontend property name.
    const [agents] = await connection.query(
      `SELECT 
        id, 
        name, 
        profile_image AS profileImage,
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
    
    // FIX: The manual formatting ('formattedAgent') is removed because the data from the
    // database is already in the correct shape thanks to the SQL alias.
    console.log(`API: Returning agent data:`, agent);
    return NextResponse.json({ agent: agent }, { status: 200 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}