import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

export const db = mysql.createPool({
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
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
    
    if (agentCount === 0) {
      // Seed a sample agent
      const sampleAgentId = 'mojtaba-dubai-amlak';
      await connection.query(
        `INSERT INTO agents (id, name, profile_image, address, bio, phone, email, instagram, twitter, linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [
          sampleAgentId,
          'Mojtaba Dubai Amlak',
          '/agents/mojtaba-dubai-amlak/profile/profile_picture.jpg',
          'Dubai, UAE',
          'Specialist in luxury Dubai real estate.',
          null,
          null,
          'mojtaba_dubai_amlak',
          null,
          null,
        ]
      );
      
      // Seed posts from public assets if available
      const postsDir = path.join(process.cwd(), 'public', 'agents', 'mojtaba-dubai-amlak', 'posts');
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir);
        const thumbnails = files.filter(f => f.endsWith('_thumbnail.jpg'));
        for (const thumb of thumbnails) {
          const base = thumb.replace('_thumbnail.jpg', '');
          const id = base; // e.g., post_1
          const captionPath = path.join(postsDir, `${base}_caption.txt`);
          const transcriptionPath = path.join(postsDir, `${base}_transcription.txt`);
          const caption = fs.existsSync(captionPath) ? fs.readFileSync(captionPath, 'utf8').trim() : null;
          const transcription = fs.existsSync(transcriptionPath) ? fs.readFileSync(transcriptionPath, 'utf8').trim() : null;
          const thumbnail = `/agents/mojtaba-dubai-amlak/posts/${thumb}`;

          await connection.query(
            `INSERT INTO posts (id, agent_id, title, content, transcription, date, caption, original_url, thumbnail, enhanced_content)
             VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)` ,
            [
              id,
              sampleAgentId,
              null,
              null,
              transcription,
              caption,
              null,
              thumbnail,
              null,
            ]
          );
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}