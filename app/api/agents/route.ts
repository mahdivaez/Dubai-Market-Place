import { db, testConnection, initializeDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let connection;
  try {
    console.log('API: Starting to fetch agents...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('API: Database connection failed');
      return NextResponse.json({ 
        error: "Database connection failed",
        agents: [],
        count: 0
      }, { status: 500 });
    }
    
    // Initialize database if needed
    await initializeDatabase();
    
    connection = await db.getConnection();
    console.log('API: Database connection established');

    // Query with proper column aliasing
    const [agents] = await connection.query(
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
    console.log(`API: Found ${agentsArray.length} agents`);
    
    if (agentsArray.length > 0) {
      console.log('API: Sample agent data:', {
        id: agentsArray[0].id,
        name: agentsArray[0].name,
        profileImage: agentsArray[0].profileImage,
        instagram: agentsArray[0].instagram
      });
    }

    return NextResponse.json({ 
      agents: agentsArray,
      count: agentsArray.length,
      success: true
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("API: Database error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error',
      agents: [],
      count: 0
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { id, name, profileImage, address, bio, phone, email, instagram, twitter, linkedin } = body;

    console.log('API: Creating new agent:', { id, name, instagram });

    connection = await db.getConnection();

    await connection.query(
      `INSERT INTO agents (id, name, profile_image, address, bio, phone, email, instagram, twitter, linkedin) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, profileImage, address, bio, phone, email, instagram, twitter, linkedin]
    );

    console.log('API: Agent created successfully:', id);

    return NextResponse.json({ 
      message: "Agent created successfully",
      agentId: id,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error("API: Error creating agent:", error);
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