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
    
    if (agentCount === 0) {
      console.log('📝 Inserting sample data...');
      
      await connection.query(`
        INSERT INTO agents (id, name, profile_image, address, bio, phone, email, instagram, twitter, linkedin) VALUES
        ('ahmed-hassan', 'Ahmed Hassan', '/agents/ahmed-hassan/profile.jpg', 'Downtown Dubai, UAE', 'مشاور املاک حرفه‌ای متخصص در املاک لوکس دبی. بیش از ۸ سال تجربه در صنعت املاک و کمک به مشتریان برای یافتن خانه رویایی و فرصت‌های سرمایه‌گذاری در مناطق معتبر دبی.', '+971 50 123 4567', 'ahmed.hassan@dubaiagents.com', 'ahmed_dubai_properties', 'ahmed_dubai_re', 'ahmed-hassan-dubai'),
        ('sarah-williams', 'Sarah Williams', '/agents/sarah-williams/profile.jpg', 'Dubai Marina, UAE', 'مشاور املاک بریتانیایی با ۶ سال تجربه در بازار املاک دبی. متخصص در کمک به مشتریان بین‌المللی برای هدایت در بازار املاک دبی، با تخصص در مناطق مارینا، JBR و پالم جمیرا.', '+971 55 987 6543', 'sarah.williams@dubaiagents.com', 'sarah_dubai_homes', NULL, 'sarah-williams-dubai-re'),
        ('omar-al-mansouri', 'Omar Al Mansouri', '/agents/omar-al-mansouri/profile.jpg', 'Business Bay, UAE', 'متخصص محلی دبی با دانش عمیق از محله‌های در حال توسعه و پروژه‌های نقشه‌ای. متخصص بیزینس بی، DIFC و مناطق آینده‌دار با پتانسیل رشد بالا.', '+971 52 456 7890', 'omar.almansouri@dubaiagents.com', 'omar_dubai_expert', 'omar_dubai_prop', 'omar-al-mansouri-dubai'),
        ('priya-sharma', 'Priya Sharma', '/agents/priya-sharma/profile.jpg', 'Jumeirah Village Circle, UAE', 'متعهد به کمک خانواده‌ها در یافتن خانه مناسب در محله‌های خانوادگی دبی. متخصص JVC، JVT و سایر مناطق مسکونی نوظهور با امکانات عالی و مدارس.', '+971 56 234 5678', 'priya.sharma@dubaiagents.com', 'priya_dubai_families', NULL, 'priya-sharma-dubai-homes'),
        ('james-mitchell', 'James Mitchell', '/agents/james-mitchell/profile.jpg', 'Dubai Hills Estate, UAE', 'متخصص املاک لوکس با تمرکز بر Dubai Hills Estate، Emirates Hills و سایر محله‌های گلف ممتاز. کمک به افراد ثروتمند برای یافتن املاک انحصاری.', '+971 50 345 6789', 'james.mitchell@dubaiagents.com', 'james_luxury_dubai', 'james_dubai_luxury', 'james-mitchell-luxury-re'),
        ('fatima-al-zahra', 'Fatima Al Zahra', '/agents/fatima-al-zahra/profile.jpg', 'Arabian Ranches, UAE', 'متخصص در محله‌های ویلایی و توسعه‌های خانواده‌محور. متخصص Arabian Ranches، Mudon و سایر محله‌های ویلایی با احساس قوی اجتماع.', '+971 55 678 9012', 'fatima.alzahra@dubaiagents.com', 'fatima_dubai_villas', NULL, 'fatima-al-zahra-dubai')
      `);
      
      await connection.query(`
        INSERT INTO posts (id, agent_id, title, content, transcription, caption, date, original_url, thumbnail) VALUES
        ('post-1', 'ahmed-hassan', 'آپارتمان شگفت‌انگیز دبی سنتر', 'آپارتمان زیبای ۲ خوابه با نمای برج خلیفه', 'این آپارتمان فوق‌العاده در قلب دبی سنتر واقع شده و نمای بی‌نظیری از برج خلیفه دارد. با امکانات مدرن و دسترسی آسان به مراکز خرید و رستوران‌های معتبر، این ملک انتخابی عالی برای زندگی یا سرمایه‌گذاری است.', '🏙️ یکی دیگر از معاملات شگفت‌انگیز در دبی سنتر! این آپارتمان خیره‌کننده ۲ خوابه با نمای برج خلیفه اکنون خانه خانوادهای دوست‌داشتنی از انگلیس است. بازار املاک دبی همچنان رشد قوی‌ای را نشان می‌دهد، به خصوص در مکان‌های اصلی مانند این. #DubaiRealEstate #DowntownDubai #BurjKhalifaViews #PropertyInvestment', '2024-01-15 10:30:00', 'https://instagram.com/p/example1', '/agents/ahmed-hassan/posts/post-1.jpg'),
        ('post-2', 'ahmed-hassan', 'تور پنت‌هاوس لوکس', 'تور مجازی پنت‌هاوس فوق‌العاده', 'این پنت‌هاوس در دبی سنتر با نمای پانورامیک شهر، تزئینات درجه یک و دسترسی به امکانات درجه یک جهانی، اوج زندگی لوکس را نمایندگی می‌کند.', '🎥 تور مجازی از این پنت‌هاوس فوق‌العاده در دبی سنتر! دارای نماهای پانورامیک شهر، تزئینات ممتاز و دسترسی به امکانات جهانی. این زندگی لوکس در بهترین حالت است. برای جزئیات بیشتر با من تماس بگیرید! #LuxuryLiving #PenthouseDubai #VirtualTour', '2024-01-12 14:45:00', 'https://instagram.com/p/example2', '/agents/ahmed-hassan/posts/post-2.jpg'),
        ('post-3', 'sarah-williams', 'زندگی مارینا در بهترین حالت', 'آپارتمان زیبای ۱ خوابه با نمای مارینا', 'این آپارتمان یک خوابه در دبی مارینا با نمای خیره‌کننده مارینا، انتخابی مناسب برای حرفه‌ای‌های جوان یا به عنوان ملک سرمایه‌گذاری است.', '🌊 زندگی مارینا در بهترین حالت! تازه این آپارتمان زیبای ۱ خوابه با نمای خیره‌کننده مارینا فهرست شد. مناسب برای حرفه‌ای‌های جوان یا به عنوان ملک سرمایه‌گذاری. دبی مارینا همچنان یکی از مورد علاقه‌ترین مکان‌ها برای ساکنان و سرمایه‌گذاران است. #DubaiMarina #MarinaViews #InvestmentOpportunity', '2024-01-10 09:15:00', 'https://instagram.com/p/example3', '/agents/sarah-williams/posts/post-3.jpg'),
        ('post-4', 'omar-al-mansouri', 'فرصت پیش‌فروش', 'توسعه جدید هیجان‌انگیز در بیزینس بی', 'این توسعه جدید در بیزینس بی طراحی مدرن، امکانات ممتاز و برنامه‌های پرداخت انعطاف‌پذیر ارائه می‌دهد. زمان مناسب برای سرمایه‌گذاری در منطقه تجاری در حال رشد دبی.', '🏗️ فرصت پیش‌فروش هیجان‌انگیز در بیزینس بی! این توسعه جدید طراحی مدرن، امکانات ممتاز و برنامه‌های پرداخت انعطاف‌پذیر ارائه می‌دهد. زمان مناسب برای سرمایه‌گذاری در منطقه تجاری در حال رشد دبی. قیمت‌های زودهنگام موجود! #OffPlan #BusinessBay #NewDevelopment #InvestmentOpportunity', '2024-01-08 16:20:00', 'https://instagram.com/p/example4', '/agents/omar-al-mansouri/posts/post-4.jpg'),
        ('post-5', 'priya-sharma', 'خانه خانوادگی در JVC', 'آپارتمان وسیع ۳ خوابه مناسب خانواده‌ها', 'این آپارتمان ۳ خوابه در JVC با فضای وسیع، نزدیکی به مدارس، پارک‌ها و امکانات اجتماعی، انتخابی عالی برای خانواده‌های در حال رشد است.', '👨‍👩‍👧‍👦 زندگی خانوادگی در JVC! این آپارتمان وسیع ۳ خوابه برای خانواده‌های در حال رشد مناسب است. نزدیک به مدارس، پارک‌ها و امکانات اجتماعی. JVC تعادل کاملی از مقرون‌به‌صرفه بودن و کیفیت زندگی در دبی ارائه می‌دهد. #FamilyLiving #JVC #FamilyFriendly #AffordableHomes', '2024-01-05 11:30:00', 'https://instagram.com/p/example5', '/agents/priya-sharma/posts/post-5.jpg')
      `);
      
      console.log('✅ Sample data inserted successfully');
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}