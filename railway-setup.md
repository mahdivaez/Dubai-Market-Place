# Railway.com MySQL Database Setup

## Database Configuration

Your project is now configured to use Railway.com's MySQL cloud database instead of localhost.

### Connection Details
- **Host**: `turntable.proxy.rlwy.net`
- **Port**: `42664`
- **Database**: `railway`
- **Username**: `root`
- **Password**: `OlWIFZHFiPpWIXCfaWdBLhILYxoqgecm`

### Connection URL
```
mysql://root:OlWIFZHFiPpWIXCfaWdBLhILYxoqgecm@turntable.proxy.rlwy.net:42664/railway
```

## Files Updated

1. **`lib/db.ts`** - Updated MySQL connection pool configuration
2. **`.env.local`** - Local environment variables
3. **`.env.example`** - Example environment file
4. **`instagram_scraper_with_ai.py`** - Python scraper database config
5. **`test_openai.py`** - Python test script database config

## Database Migration Required

Since you're switching from a local database to Railway's cloud database, you'll need to:

### 1. Create Tables in Railway Database

Connect to your Railway MySQL database and run the schema creation script:

```sql
-- Create the database structure
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    profile_image VARCHAR(255),
    address TEXT,
    bio TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    instagram VARCHAR(50),
    twitter VARCHAR(50),
    linkedin VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50),
    title VARCHAR(255),
    content TEXT,
    transcription TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    caption TEXT,
    original_url VARCHAR(255),
    thumbnail VARCHAR(255),
    instagram_shortcode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_posts_agent_id ON posts(agent_id);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);
```

### 2. Test the Connection

Run the test endpoint to verify the connection:
```bash
curl http://localhost:3000/api/test-db
```

Or visit: `http://localhost:3000/api/test-db` in your browser.

### 3. Environment Variables

Make sure your `.env.local` file contains:
```env
DB_HOST=turntable.proxy.rlwy.net
DB_PORT=42664
DB_USER=root
DB_PASSWORD=OlWIFZHFiPpWIXCfaWdBLhILYxoqgecm
DB_NAME=railway
```

## Security Notes

- The database password is included in the configuration files for development
- In production, use Railway's environment variables instead of hardcoded values
- Railway automatically provides these environment variables in the deployment environment

## Troubleshooting

If you encounter connection issues:

1. **SSL/TLS Issues**: The configuration includes `ssl: { rejectUnauthorized: false }` for Railway compatibility
2. **Port Issues**: Make sure port `42664` is accessible
3. **Network Issues**: Railway's proxy domain should be accessible from your location
4. **Database Permissions**: The `root` user should have full access to the `railway` database

## Next Steps

1. Start your development server: `npm run dev`
2. Test the database connection: Visit `/api/test-db`
3. Check that your existing data migration is complete
4. Run your Instagram scraper to populate the Railway database

Your project is now configured to use Railway.com's MySQL cloud database! 🚀