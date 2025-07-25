-- Railway MySQL Database Initialization Script
-- Run this script to create the required database structure

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS railway;
USE railway;

-- Create agents table
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

-- Create posts table
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

-- Create filtered_posts table for tracking filtered content
CREATE TABLE IF NOT EXISTS filtered_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id VARCHAR(50),
    instagram_shortcode VARCHAR(50),
    filter_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_agent_shortcode (agent_id, instagram_shortcode)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_instagram ON agents(instagram);
CREATE INDEX IF NOT EXISTS idx_posts_agent_id ON posts(agent_id);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);
CREATE INDEX IF NOT EXISTS idx_posts_shortcode ON posts(instagram_shortcode);
CREATE INDEX IF NOT EXISTS idx_agent_shortcode ON posts (agent_id, instagram_shortcode);

-- Insert sample data (optional - remove if you don't want sample data)
INSERT IGNORE INTO agents (id, name, profile_image, address, bio, phone, email, instagram, twitter, linkedin) VALUES
('ahmed-hassan-001', 'Ahmed Hassan', '/agents/ahmed-hassan-001/profile/profile_picture.jpg', 'Downtown Dubai, UAE', 'Experienced real estate professional specializing in luxury properties in Downtown Dubai and Dubai Marina. With over 8 years in the industry, I help clients find their dream homes and investment opportunities in Dubai\'s most prestigious locations.', '+971 50 123 4567', 'ahmed.hassan@dubaiagents.com', 'ahmed_dubai_properties', 'ahmed_dubai_re', 'ahmed-hassan-dubai'),

('sarah-williams-002', 'Sarah Williams', '/agents/sarah-williams-002/profile/profile_picture.jpg', 'Dubai Marina, UAE', 'British expat with 6 years of experience in Dubai\'s real estate market. I specialize in helping international clients navigate the Dubai property market, with expertise in Marina, JBR, and Palm Jumeirah areas.', '+971 55 987 6543', 'sarah.williams@dubaiagents.com', 'sarah_dubai_homes', NULL, 'sarah-williams-dubai-re'),

('omar-al-mansouri-003', 'Omar Al Mansouri', '/agents/omar-al-mansouri-003/profile/profile_picture.jpg', 'Business Bay, UAE', 'Local Dubai expert with deep knowledge of emerging neighborhoods and off-plan developments. Specializing in Business Bay, DIFC, and upcoming areas with high growth potential.', '+971 52 456 7890', 'omar.almansouri@dubaiagents.com', 'omar_dubai_expert', 'omar_dubai_prop', 'omar-al-mansouri-dubai');

-- Show table structure
DESCRIBE agents;
DESCRIBE posts;
DESCRIBE filtered_posts;

-- Show sample data count
SELECT 'Agents' as Table_Name, COUNT(*) as Record_Count FROM agents
UNION ALL
SELECT 'Posts' as Table_Name, COUNT(*) as Record_Count FROM posts
UNION ALL
SELECT 'Filtered Posts' as Table_Name, COUNT(*) as Record_Count FROM filtered_posts;

COMMIT;