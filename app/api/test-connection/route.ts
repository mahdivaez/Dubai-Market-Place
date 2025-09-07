import { NextResponse } from "next/server";
import mysql from 'mysql2/promise';

export async function GET() {
  const config = {
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    connectTimeout: 30000,
    ssl: { rejectUnauthorized: false }
  };

  try {
    const connection = await mysql.createConnection(config);
    await connection.ping();
    await connection.end();
    return NextResponse.json({
      message: "Database connection successful",
      result: 'SUCCESS',
    });
  } catch (error) {
    return NextResponse.json({
      message: "Database connection failed",
      result: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}