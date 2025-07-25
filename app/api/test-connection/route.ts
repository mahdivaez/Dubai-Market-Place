import { NextResponse } from "next/server";
import mysql from 'mysql2/promise';

export async function GET() {
  const configs = [
    {
      name: "Railway Direct Host",
      config: {
        host: 'turntable.proxy.rlwy.net',
        port: 42664,
        user: 'root',
        password: 'OlWIFZHFiPpWIXCfaWdBLhILYxoqgecm',
        database: 'railway',
        connectTimeout: 30000,
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: "Railway Proxy Host",
      config: {
        host: 'turntable.proxy.rlwy.net',
        port: 42664,
        user: 'root',
        password: 'OlWIFZHFiPpWIXCfaWdBLhILYxoqgecm',
        database: 'railway',
        connectTimeout: 30000,
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: "Railway Direct Host (No SSL)",
      config: {
        host: 'turntable.proxy.rlwy.net',
        port: 42664,
        user: 'root',
        password: 'OlWIFZHFiPpWIXCfaWdBLhILYxoqgecm',
        database: 'railway',
        connectTimeout: 30000
      }
    }
  ];

  const results = [];

  for (const { name, config } of configs) {
    try {
      console.log(`🔄 Testing ${name}...`);
      console.log(`   Host: ${config.host}:${config.port}`);
      
      const connection = await mysql.createConnection(config);
      await connection.ping();
      await connection.end();
      
      results.push({
        name,
        status: 'SUCCESS',
        config: {
          host: config.host,
          port: config.port,
          database: config.database
        }
      });
      
      console.log(`✅ ${name} - SUCCESS`);
      
    } catch (error) {
      results.push({
        name,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        config: {
          host: config.host,
          port: config.port,
          database: config.database
        }
      });
      
      console.log(`❌ ${name} - FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return NextResponse.json({
    message: "Connection test results",
    results,
    recommendation: results.find(r => r.status === 'SUCCESS') ? 
      `Use configuration: ${results.find(r => r.status === 'SUCCESS')?.name}` : 
      "All connections failed. Check Railway service status and network connectivity."
  });
}