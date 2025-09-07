import { db, testConnection, initializeDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("API/agents: Starting to fetch agents...");

  try {
    console.log("API/agents: Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("API/agents: Database connection failed");
      return NextResponse.json(
        { error: "Database connection failed", agents: [], count: 0 },
        { status: 500 }
      );
    }

    await initializeDatabase();
    console.log("API/agents: Database initialized");

    const [agents] = await db.query(
      `SELECT 
        id, 
        name, 
        profile_image AS profileImage, 
        address, 
        bio, 
        phone,
        email,
        instagram, 
        twitter, 
        linkedin,
        created_at,
        updated_at
       FROM agents 
       ORDER BY name`
    );

    const agentsArray = agents as any[];
    console.log(`API/agents: Found ${agentsArray.length} agents`);

    if (agentsArray.length > 0) {
      console.log("API/agents: Sample agent data:", {
        id: agentsArray[0].id,
        name: agentsArray[0].name,
        profileImage: agentsArray[0].profileImage,
        instagram: agentsArray[0].instagram,
      });
    }

    return NextResponse.json(
      {
        agents: agentsArray,
        count: agentsArray.length,
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
    console.error("API/agents: Database error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        agents: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  console.log("API/agents: Creating new agent...");

  if (!apiKey || apiKey !== process.env.MY_API_KEY) {
    console.log("API/agents: Unauthorized access attempt for POST");
    return NextResponse.json(
      { error: "Unauthorized", details: "Invalid API key" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, profileImage, address, bio, phone, email, instagram, twitter, linkedin } = body;

    if (!id || !name) {
      console.log("API/agents: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields", details: "id and name are required" },
        { status: 400 }
      );
    }

    console.log("API/agents: Creating agent with data:", { id, name, instagram });

    await db.query(
      `INSERT INTO agents (id, name, profile_image, address, bio, phone, email, instagram, twitter, linkedin) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, profileImage || null, address || null, bio || null, phone || null, email || null, instagram || null, twitter || null, linkedin || null]
    );

    console.log("API/agents: Agent created successfully:", id);

    return NextResponse.json(
      {
        message: "Agent created successfully",
        agentId: id,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API/agents: Error creating agent:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}