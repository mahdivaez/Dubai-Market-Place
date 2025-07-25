import { db, testConnection, initializeDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('🌐 Environment check:');
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'mysql-production-308f.up.railway.app'}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT || '3306'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'railway'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || 'root'}`);
    console.log(`   SSL: enabled with rejectUnauthorized: false`);
    
    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({ 
        error: "Database connection failed",
        connected: false,
        config: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER
        }
      }, { status: 500 });
    }

    // Initialize database with sample data if needed
    await initializeDatabase();

    // Get some sample data to verify everything works
    let connection;
    try {
      connection = await db.getConnection();
      
      const [agents] = await connection.query('SELECT COUNT(*) as count FROM agents');
      const [posts] = await connection.query('SELECT COUNT(*) as count FROM posts');
      
      const agentCount = (agents as any[])[0].count;
      const postCount = (posts as any[])[0].count;

      return NextResponse.json({
        connected: true,
        message: "Database connection successful!",
        host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
        database: process.env.DB_NAME || 'railway',
        port: process.env.DB_PORT || '42664',
        data: {
          agents: agentCount,
          posts: postCount
        }
      });

    } finally {
      if (connection) {
        connection.release();
      }
    }

  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({ 
      error: "Database test failed",
      details: error instanceof Error ? error.message : 'Unknown error',
      connected: false,
      config: {
        host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
        port: process.env.DB_PORT || '42664',
        database: process.env.DB_NAME || 'railway',
        user: process.env.DB_USER || 'root'
      }
    }, { status: 500 });
  }
}