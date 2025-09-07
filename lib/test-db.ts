import mysql from 'mysql2/promise';

async function testDBConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST as string,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
    });

    console.log('✅ DB connection successful');
    await connection.end();
  } catch (error) {
    console.error('❌ DB connection failed:', error);
  }
}

testDBConnection();

