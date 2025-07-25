import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let connection;
  try {
    console.log('API: Starting to fetch agents...');
    connection = await db.getConnection();
    console.log('API: Database connection established');

    // FIX: The SQL query now uses 'AS' to alias 'profile_image' to 'profileImage'.
    // This ensures the object returned from the database has the correct property name
    // that the frontend components expect.
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
       FROM agents 
       ORDER BY name`
    );

    console.log(`API: Found ${(agents as any[]).length} agents`);

    // FIX: The manual mapping ('formattedAgents') is no longer needed because the SQL alias
    // has already structured the data correctly. We can return the result directly.
    console.log('API: Returning agents data:', agents);
    return NextResponse.json({ 
      agents: agents,
      count: (agents as any[]).length 
    }, { status: 200 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error',
      agents: [] // Return empty array as fallback
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// The POST function does not need any changes.
export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { id, name, profileImage, address, bio, instagram, twitter, linkedin } = body;

    connection = await db.getConnection();

    await connection.query(
      `INSERT INTO agents (id, name, profile_image, address, bio, instagram, twitter, linkedin) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      // Note: When inserting, we still use the correct database column name 'profile_image'.
      [id, name, profileImage, address, bio, instagram, twitter, linkedin]
    );

    return NextResponse.json({ message: "Agent created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}