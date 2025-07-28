import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '42664'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'OlWIFZHFiPpWIXCfaWdBLhILYxoqgecm',
  database: process.env.DB_NAME || 'railway',
  connectTimeout: 30000,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testConnection(): Promise<boolean> {
  try {
    console.log('🔄 Testing Railway MySQL connection...');
    const connection = await db.getConnection();
    await connection.ping();
    console.log('✅ Railway MySQL Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Railway MySQL Database connection failed:', error);
    return false;
  }
}

export async function initializeDatabase(): Promise<void> {
  let connection;
  try {
    connection = await db.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        profile_image VARCHAR(500),
        address TEXT,
        bio TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        instagram VARCHAR(255),
        twitter VARCHAR(255),
        linkedin VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(255) PRIMARY KEY,
        agent_id VARCHAR(255),
        title TEXT,
        content TEXT,
        transcription TEXT,
        date DATETIME,
        caption TEXT,
        original_url TEXT,
        thumbnail TEXT,
        enhanced_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `);
    
    const [agents] = await connection.query('SELECT COUNT(*) as count FROM agents');
    const agentCount = (agents as any[])[0].count;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}