import mysql from 'mysql2/promise';

async function testDBConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'tirich-mir.liara.cloud',
      port: 32815,
      user: 'root',
      password: 'iIFaZEndTMSPLapZRSjxAqNL',
      database: 'keen_meninsky',
    });

    console.log('✅ DB connection successful');
    await connection.end();
  } catch (error) {
    console.error('❌ DB connection failed:', error);
  }
}

testDBConnection();

