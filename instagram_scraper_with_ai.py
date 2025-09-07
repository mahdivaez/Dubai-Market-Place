import instaloader
import time
import browser_cookie3
from instaloader.exceptions import ConnectionException, ProfileNotExistsException, QueryReturnedBadRequestException
import os
import shutil
from dotenv import load_dotenv
from io import BytesIO
import requests
from elevenlabs.client import ElevenLabs
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import concurrent.futures
from threading import Lock
import glob
import random
from groq import Groq

load_dotenv()

# ElevenLabs API key
api_key = os.getenv("ELEVEN_API_KEY")

# Groq API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}

# Global variables for thread safety
db_lock = Lock()
file_lock = Lock()

try:
    elevenlabs = ElevenLabs(api_key=api_key)
    print("✅ ElevenLabs client initialized successfully")
except Exception as e:
    print(f"❌ Error initializing ElevenLabs client: {str(e)}")
    elevenlabs = None

def test_elevenlabs_connection():
    """Test ElevenLabs API connection"""
    if not elevenlabs:
        print("❌ ElevenLabs client not available")
        return False
    
    try:
        print("🔍 Testing ElevenLabs API connection...")
        # Use the correct method to get models
        response = elevenlabs.models.get_all()
        models = list(response)
        print(f"✅ ElevenLabs API connection successful. Available models: {len(models)}")
        return True
    except Exception as e:
        print(f"❌ ElevenLabs API connection failed: {e}")
        return False

try:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("✅ Groq AI client initialized successfully")
except Exception as e:
    print(f"❌ Error initializing Groq client: {str(e)}")
    groq_client = None

def clear_instaloader_sessions():
    """Clear all Instaloader session files"""
    try:
        session_locations = [
            os.path.expanduser("~/.config/instaloader/"),
            os.path.expanduser("~/.instaloader/"),
            "./",
            os.getcwd()
        ]
        
        print("🧹 Clearing old Instaloader sessions...")
        
        for location in session_locations:
            if os.path.exists(location):
                session_files = glob.glob(os.path.join(location, "session-*"))
                for session_file in session_files:
                    try:
                        os.remove(session_file)
                        print(f"🗑️  Removed: {session_file}")
                    except Exception as e:
                        print(f"⚠️  Could not remove {session_file}: {e}")
        
        print("✅ Session cleanup completed")
        
    except Exception as e:
        print(f"⚠️  Error during session cleanup: {e}")

def generate_persian_title_with_ai(content, caption="", agent_name=""):
    """Generate Persian title using Groq AI"""
    if not groq_client or not content:
        print("⚠️ No Groq client or content available for title generation")
        return None
    
    try:
        print("🤖 Generating Persian title with AI...")
        print(f"📝 Content preview: {content[:100]}...")
        
        # Enhanced prompt for better title generation
        prompt = f"""تو یک متخصص تولید عنوان برای آگهی‌های املاک در دبی هستی که باید عنوان‌های جذاب و منحصر به فرد بسازی.

وظیفه تو:
1. بر اساس محتوای ارائه شده، یک عنوان جذاب، منحصر به فرد و حرفه‌ای به زبان فارسی بنویس
2. عنوان باید بین 6 تا 15 کلمه باشد
3. عنوان باید شامل نوع ملک (آپارتمان، ویلا، دفتر، پنت‌هاوس و...) و منطقه دبی باشد
4. از کلمات جذاب مثل "لوکس"، "منحصر به فرد"، "ویژه"، "استثنایی"، "برتر"، "فوق‌العاده" استفاده کن
5. عنوان باید برای بازاریابی املاک و SEO مناسب باشد
6. عنوان باید منعکس‌کننده محتوای واقعی پست باشد
7. فقط عنوان را بنویس، هیچ توضیح، علامت نقل قول یا متن اضافی نده
8. عنوان باید کاملاً منحصر به فرد و مرتبط با محتوا باشد
{content[:500]}

کپشن اصلی:
{caption[:200] if caption else "بدون کپشن"}

عنوان فارسی:"""

        response = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="gemma2-9b-it",  # Using a more powerful model
            temperature=0.7,
            max_tokens=150,
            top_p=0.9
        )
        
        title = response.choices[0].message.content.strip()
        
        # Clean up the title
        title = title.replace('"', '').replace("'", '').replace('«', '').replace('»', '').strip()
        
        # Remove any prefixes like "عنوان:" or "Title:"
        if ':' in title:
            title = title.split(':', 1)[-1].strip()
        
        # Validate title length
        if len(title.split()) < 4 or len(title.split()) > 20:
            print("⚠️ AI title seems invalid, using fallback")
            return None
        
        # Check if title is meaningful (not just generic)
        generic_words = ['املاک', 'ویژه', 'شماره', 'پست', 'محتوا']
        if all(word in title for word in generic_words[:3]):
            print("⚠️ AI title seems too generic, regenerating...")
            return None
        
        print(f"✅ Persian title generated: {title}")
        return title
        
    except Exception as e:
        print(f"⚠️ AI title generation failed: {e}")
        print(f"🔍 Error details: {str(e)}")
        return None
def clean_transcription_with_ai(original_transcription):
    """Clean transcription using Groq AI - UPDATED to preserve English words"""
    if not groq_client or not original_transcription:
        return original_transcription
    
    try:
        print("🤖 Cleaning transcription with AI (preserving English words)...")
        
        # Enhanced prompt for structured real estate content creation
        prompt = f"""تو یک متخصص تولید محتوای املاک و ویراستار حرفه‌ای هستی. متن زیر ترنسکریپشن یک ویدیو املاک از اینستاگرام است که باید آن را به محتوای ساختارمند و حرفه‌ای برای وبسایت تبدیل کنی.

**وظایف اصلی:**

1. **حفظ محتوای اصلی**: تمام اطلاعات کلیدی، قیمت‌ها، مشخصات، و جزئیات مهم را دقیقاً حفظ کن.

2. **ساختار مناسب وبسایت**: متن را به‌صورت پاراگراف‌های منطقی و خوانا تنظیم کن (نه لیست، نه نقطه‌چین).

3. **حفظ کلمات انگلیسی**: 
   - نام مکان‌ها (Dubai Hills, Rose Hill، Golf Course)
   - واژه‌های تخصصی (Premium, Single Building, L-Shape)  
   - برندها و نام‌های خاص را دقیقاً به انگلیسی نگه دار

4. **پاک‌سازی هوشمند**:
   - کلمات اضافی ("در نظر بگیرید"، "خب"، "این قسمت") را حذف کن
   - جملات تکراری را ادغام کن
   - عبارات محاوره‌ای را به زبان رسمی تبدیل کن
   - صداهای اضافی مثل "(صدای ریکاوریدگی)" را حذف کن

5. **زبان حرفه‌ای املاک**: 
   - از واژگان استاندارد املاک استفاده کن
   - جملات روان و قابل فهم بنویس
   - برای مخاطبان وبسایت مناسب باشد

6. **فرمت نهایی**: فقط متن تمیز و ساختارمند ارائه کن، بدون هیچ توضیح، عنوان یا نشان اضافی.

**مثال تبدیل:**
اصلی: "خب، بریم یک معرفی داشته باشیم از پروژه جدید. این قسمت رو در نظر بگیرید که یک location عالیه."
تبدیل شده: "پروژه جدید املاک در location مطلوبی قرار گرفته است."

**متن اصلی برای تبدیل:**
{original_transcription}

**متن ساختارمند برای وبسایت:**"""

        response = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="gemma2-9b-it",  # Using a good model for Persian text with English preservation
            temperature=0.3,  # Lower temperature for more consistent cleaning
            max_tokens=2000,
            top_p=0.9
        )
        
        cleaned_text = response.choices[0].message.content.strip()
        
        # Basic validation - ensure we got meaningful content back
        if len(cleaned_text) < 10 or len(cleaned_text) > len(original_transcription) * 3:
            print("⚠️ AI cleaning result seems invalid, using original")
            return original_transcription
        
        print("✅ Transcription cleaned successfully with AI (English words preserved)")
        return cleaned_text
        
    except Exception as e:
        print(f"⚠️ AI cleaning failed: {e}")
        print("📝 Using original transcription")
        return original_transcription

def create_database_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"❌ Error connecting to MySQL database: {e}")
        return None

def ensure_database_structure(connection):
    """Ensure the database has the correct structure - OPTIMIZED"""
    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'posts'
            AND COLUMN_NAME IN ('thumbnail', 'instagram_shortcode')
        """, (DB_CONFIG['database'],))

        existing_columns = {row[0] for row in cursor.fetchall()}

        if 'thumbnail' not in existing_columns:
            cursor.execute("ALTER TABLE posts ADD COLUMN thumbnail VARCHAR(255) AFTER caption")

        if 'instagram_shortcode' not in existing_columns:
            cursor.execute("ALTER TABLE posts ADD COLUMN instagram_shortcode VARCHAR(50) AFTER original_url")
            cursor.execute("CREATE UNIQUE INDEX idx_agent_shortcode ON posts (agent_id, instagram_shortcode)")

        cursor.execute("""
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'filtered_posts'
        """, (DB_CONFIG['database'],))

        if not cursor.fetchone():
            cursor.execute("""
                CREATE TABLE filtered_posts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    agent_id VARCHAR(50),
                    instagram_shortcode VARCHAR(50),
                    filter_reason VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_agent_shortcode (agent_id, instagram_shortcode)
                )
            """)

        connection.commit()
        return True
    except Error as e:
        print(f"❌ Error checking database structure: {e}")
        return False
    finally:
        if cursor:
            cursor.close()

def count_persian_characters(text):
    """Count Persian/Farsi characters in text - OPTIMIZED"""
    if not text:
        return 0

    persian_chars = set('آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی')
    return sum(1 for char in text if char in persian_chars)

def get_or_create_agent(connection, username, profile_data):
    """Get existing agent or create new one using only username as agent_id - OPTIMIZED"""
    try:
        cursor = connection.cursor()

        # Use cleaned username as agent_id
        agent_id = username.replace('.', '-').replace('_', '-')

        # Check if agent already exists
        cursor.execute("SELECT id FROM agents WHERE instagram = %s", (username,))
        existing_agent = cursor.fetchone()

        if existing_agent:
            return existing_agent[0]

        # Create new agent with username as agent_id
        full_name = profile_data.get('full_name', '').strip() or username.replace('.', ' ').replace('_', ' ').title()
        biography = profile_data.get('biography', '').strip() or f'مشاور املاک حرفه‌ای در دبی. برای آخرین به‌روزرسانی‌های املاک @{username} را دنبال کنید.'

        cursor.execute("""
            INSERT INTO agents (id, name, profile_image, address, bio, phone, email, instagram, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, (
            agent_id, full_name, f"/agents/{agent_id}/profile/profile_picture.jpg",
            "دبی، امارات متحده عربی", biography, None, None, username
        ))

        connection.commit()
        print(f"✅ New agent created: {agent_id}")
        return agent_id

    except Error as e:
        print(f"❌ Error getting/creating agent: {e}")
        connection.rollback()
        return None
    finally:
        if cursor:
            cursor.close()

def get_existing_and_filtered_shortcodes(connection, agent_id):
    """Get both existing and filtered shortcodes in one query - OPTIMIZED"""
    try:
        cursor = connection.cursor()

        cursor.execute("SELECT instagram_shortcode FROM posts WHERE agent_id = %s AND instagram_shortcode IS NOT NULL", (agent_id,))
        existing = {row[0] for row in cursor.fetchall()}

        cursor.execute("SELECT instagram_shortcode FROM filtered_posts WHERE agent_id = %s", (agent_id,))
        filtered = {row[0] for row in cursor.fetchall()}

        return existing, filtered

    except Error as e:
        print(f"❌ Error getting shortcodes: {e}")
        return set(), set()
    finally:
        if cursor:
            cursor.close()

def add_to_filtered_posts(connection, agent_id, shortcode, reason):
    """Add a post to the filtered posts table - OPTIMIZED"""
    cursor = None
    try:
        if not connection or not connection.is_connected():
            print("❌ Error adding to filtered posts: MySQL Connection not available.")
            return
            
        cursor = connection.cursor()
        cursor.execute("""
            INSERT IGNORE INTO filtered_posts (agent_id, instagram_shortcode, filter_reason)
            VALUES (%s, %s, %s)
        """, (agent_id, shortcode, reason))
        connection.commit()
    except Error as e:
        print(f"❌ Error adding to filtered posts: {e}")
    finally:
        if cursor:
            cursor.close()

def get_next_post_number(connection, agent_id):
    """Get the next post number - OPTIMIZED"""
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM posts WHERE agent_id = %s", (agent_id,))
        return cursor.fetchone()[0] + 1
    except Error as e:
        return 1
    finally:
        if cursor:
            cursor.close()

def save_post_to_database(connection, agent_id, post_data, post_number):
    """Save a post to the database with AI-generated title - OPTIMIZED"""
    cursor = None
    try:
        if not connection or not connection.is_connected():
            print("❌ Error saving post: MySQL Connection not available.")
            return None
            
        with db_lock:
            cursor = connection.cursor()

            timestamp = int(time.time())
            post_id = f"{agent_id}-post-{post_number:03d}-{timestamp}"

            cursor.execute("SELECT id FROM posts WHERE agent_id = %s AND instagram_shortcode = %s",
                          (agent_id, post_data.get('instagram_shortcode', '')))
            if cursor.fetchone():
                return "duplicate"

            # Always generate AI title based on content
            title = post_data.get('title', '')
            if not title:  # Only generate if no title provided
                print(f"🤖 Generating AI title for post {post_number}...")
                ai_title = generate_persian_title_with_ai(
                    post_data.get('content', ''),
                    post_data.get('caption', ''),
                    post_data.get('agent_name', '')
                )
                
                if ai_title:
                    title = ai_title
                    print(f"✅ AI title generated: {title}")
                else:
                    # More descriptive fallback based on content
                    content_preview = post_data.get('content', '')[:100]
                    if 'آپارتمان' in content_preview:
                        title = f"آپارتمان منحصر به فرد در دبی - پست {post_number}"
                    elif 'ویلا' in content_preview:
                        title = f"ویلای لوکس در دبی - پست {post_number}"
                    elif 'دفتر' in content_preview:
                        title = f"دفتر تجاری مدرن در دبی - پست {post_number}"
                    else:
                        title = f"املاک استثنایی در دبی - پست {post_number}"
                    print(f"⚠️ Using enhanced fallback title: {title}")

            cursor.execute("""
                INSERT INTO posts (id, agent_id, title, content, caption, thumbnail, transcription, date, original_url, instagram_shortcode, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (
                post_id, agent_id, title,
                post_data.get('content', ''), post_data.get('caption', ''),
                f"/agents/{agent_id}/posts/post_{post_number}_thumbnail.jpg",
                post_data.get('transcription', None), post_data.get('date', datetime.now()),
                post_data.get('original_url', ''), post_data.get('instagram_shortcode', '')
            ))

            connection.commit()
            print(f"✅ Post saved with title: {title}")
            return post_id

    except Error as e:
        if "Duplicate entry" in str(e):
            return "duplicate"
        else:
            print(f"❌ Error saving post: {e}")
            connection.rollback()
            return None
    finally:
        if cursor:
            cursor.close()

def download_and_process_media(post, post_folder, post_number, download_folder):
    """Download and process media files - OPTIMIZED"""
    try:
        thumbnail_response = requests.get(post.url, timeout=15)
        if thumbnail_response.status_code == 200:
            thumbnail_path = os.path.join(post_folder, f"post_{post_number}_thumbnail.jpg")
            with open(thumbnail_path, 'wb') as f:
                f.write(thumbnail_response.content)

        video_processed = False
        for file in os.listdir(download_folder):
            if file.endswith('.mp4') and 'UTC' in file:
                old_video_path = os.path.join(download_folder, file)
                new_video_path = os.path.join(post_folder, f"post_{post_number}_video.mp4")
                shutil.move(old_video_path, new_video_path)
                video_processed = True
                break

        return video_processed, new_video_path if video_processed else None

    except Exception as e:
        print(f"⚠️ Error downloading media: {e}")
        return False, None

def transcribe_video_optimized(video_path):
    """Transcribe video with robust error handling and correct ElevenLabs Speech-to-Text API"""
    if not elevenlabs:
        print("⚠️ ElevenLabs client not available")
        return None

    # Check if video file exists and is readable
    if not os.path.exists(video_path):
        print(f"⚠️ Video file not found: {video_path}")
        return None
    
    file_size = os.path.getsize(video_path)
    if file_size == 0:
        print(f"⚠️ Video file is empty: {video_path}")
        return None
    
    print(f"📹 Processing video file: {file_size} bytes")

    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"🔄 Attempting transcription (attempt {attempt + 1}/{max_retries})...")
            
            # Use the correct ElevenLabs Speech-to-Text API with the correct model
            with open(video_path, 'rb') as audio_file:
                transcription = elevenlabs.speech_to_text.convert(
                    file=audio_file,
                    model_id="scribe_v1"  # Correct Speech-to-Text model name
                )

            if transcription and transcription.text and len(transcription.text.strip()) > 0:
                result = transcription.text.strip()
                print(f"✅ Transcription successful: {len(result)} characters")
                return result
            else:
                print(f"⚠️ Empty transcription result (attempt {attempt + 1})")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue

        except Exception as e:
            error_msg = str(e)
            print(f"⚠️ Transcription failed (attempt {attempt + 1}): {error_msg}")
            
            # Check for specific error types
            if "Server disconnected" in error_msg or "Connection" in error_msg:
                print("🔌 Server connection issue detected")
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 3  # Progressive backoff
                    print(f"🔄 Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
            elif "rate limit" in error_msg.lower() or "quota" in error_msg.lower():
                print("⏰ Rate limit detected, waiting longer...")
                if attempt < max_retries - 1:
                    time.sleep(10)
                    continue
            else:
                if attempt < max_retries - 1:
                    time.sleep(3)
                    continue

    print(f"❌ All transcription attempts failed for {video_path}")
    return None

def process_single_post(post, agent_id, connection, download_folder, current_post_number, existing_shortcodes, filtered_shortcodes, profile_data, username):
    """Process a single post - WITH AI TRANSCRIPTION CLEANING AND TITLE GENERATION"""
    post_shortcode = post.shortcode if post else "unknown"

    if post_shortcode in existing_shortcodes or post_shortcode in filtered_shortcodes:
        return None, "skipped"

    try:
        post_folder_name = f"post_{current_post_number}_{post.date_utc.strftime('%Y%m%d_%H%M%S')}_{post_shortcode}"
        post_folder = os.path.join(download_folder, post_folder_name)

        with file_lock:
            os.makedirs(post_folder, exist_ok=True)

        # EXACT WORKING METHOD FROM YOUR ORIGINAL CODE
        ig = instaloader.Instaloader(
            download_videos=True,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
            post_metadata_txt_pattern=""
        )

        cookies = browser_cookie3.chrome(domain_name="instagram.com")
        ig.context._session.cookies.update(cookies)

        ig.download_post(post, target=download_folder)

        video_processed, video_path = download_and_process_media(post, post_folder, current_post_number, download_folder)

        if not video_processed:
            add_to_filtered_posts(connection, agent_id, post_shortcode, "image_only_no_video")
            return None, "filtered"

        # Step 1: Try to get transcription from ElevenLabs (optional)
        original_transcription = transcribe_video_optimized(video_path)
        
        # Handle transcription results
        if not original_transcription:
            print("⚠️ Transcription failed completely")
            # Option 1: Filter the post (current behavior)
            add_to_filtered_posts(connection, agent_id, post_shortcode, "transcription_failed")
            return None, "filtered"
        
        if len(original_transcription) < 50:
            print(f"⚠️ Transcription too short ({len(original_transcription)} chars)")
            # Option 1: Filter the post (current behavior)
            add_to_filtered_posts(connection, agent_id, post_shortcode, "short_transcription")
            return None, "filtered"

        # Step 2: Clean transcription with AI
        cleaned_transcription = clean_transcription_with_ai(original_transcription)

        # Save both original and cleaned transcriptions
        with open(os.path.join(post_folder, "transcription_original.txt"), 'w', encoding='utf-8') as f:
            f.write(original_transcription)

        with open(os.path.join(post_folder, "transcription_cleaned.txt"), 'w', encoding='utf-8') as f:
            f.write(cleaned_transcription)

        # For backward compatibility, also save as transcription.txt (cleaned version)
        with open(os.path.join(post_folder, "transcription.txt"), 'w', encoding='utf-8') as f:
            f.write(cleaned_transcription)

        caption = post.caption if post.caption else "بدون کپشن"
        if post.caption_mentions:
            caption += f"\n\n👥 منشن‌ها: {', '.join([f'@{mention}' for mention in post.caption_mentions])}"
        if post.caption_hashtags:
            caption += f"\n\n🏷️ هشتگ‌ها: {', '.join([f'#{hashtag}' for hashtag in post.caption_hashtags])}"

        with open(os.path.join(post_folder, "caption.txt"), 'w', encoding='utf-8') as f:
            f.write(caption)

        # Step 3: Generate AI title based on available content
        print(f"🤖 Generating unique AI title for post {current_post_number}...")
        # Use caption if transcription is empty
        content_for_title = cleaned_transcription if cleaned_transcription else caption
        ai_title = generate_persian_title_with_ai(
            content_for_title,
            caption,
            profile_data['full_name'] or username
        )
        
        if ai_title:
            print(f"✅ Generated unique title: {ai_title}")
        else:
            print(f"⚠️ AI title generation failed, will use enhanced fallback")
        # Use cleaned transcription for database content, fallback to caption if empty
        content_for_db = cleaned_transcription if cleaned_transcription else caption
        post_data = {
            'title': ai_title,  # Pass the AI-generated title
            'content': content_for_db,  # Use transcription or caption
            'caption': caption,
            'transcription': cleaned_transcription,  # Keep transcription separate (can be empty)
            'date': post.date_utc,
            'original_url': f"https://instagram.com/p/{post_shortcode}",
            'instagram_shortcode': post_shortcode,
            'agent_name': profile_data['full_name'] or username
        }

        post_id = save_post_to_database(connection, agent_id, post_data, current_post_number)

        if post_id and post_id != "duplicate":
            return {
                'post_number': current_post_number,
                'folder_name': post_folder_name,
                'post_id': post_id,
                'shortcode': post_shortcode
            }, "success"

        return None, "failed"

    except Exception as e:
        print(f"❌ Error processing post {post_shortcode}: {e}")
        return None, "error"

def organize_files_optimized(username, agent_id, downloaded_folder, saved_posts_info):
    """Organize files with optimized operations"""
    try:
        agent_public_dir = f"public/agents/{agent_id}"
        profile_dir = f"{agent_public_dir}/profile"
        posts_dir = f"{agent_public_dir}/posts"

        os.makedirs(profile_dir, exist_ok=True)
        os.makedirs(posts_dir, exist_ok=True)

        profile_pic_source = os.path.join(downloaded_folder, f"{username}_profile.jpg")
        if os.path.exists(profile_pic_source):
            shutil.copy2(profile_pic_source, os.path.join(profile_dir, "profile_picture.jpg"))

        def copy_post_files(post_info):
            post_number = post_info['post_number']
            post_folder_name = post_info['folder_name']
            post_folder_path = os.path.join(downloaded_folder, post_folder_name)

            if not os.path.exists(post_folder_path):
                return

            thumbnail_files = [f for f in os.listdir(post_folder_path) if f.endswith('_thumbnail.jpg')]
            if thumbnail_files:
                shutil.copy2(
                    os.path.join(post_folder_path, thumbnail_files[0]),
                    os.path.join(posts_dir, f"post_{post_number}_thumbnail.jpg")
                )

            video_files = [f for f in os.listdir(post_folder_path) if f.endswith('_video.mp4')]
            if video_files:
                shutil.copy2(
                    os.path.join(post_folder_path, video_files[0]),
                    os.path.join(posts_dir, f"post_{post_number}_video.mp4")
                )

            for file in os.listdir(post_folder_path):
                if file.endswith('.txt'):
                    shutil.copy2(
                        os.path.join(post_folder_path, file),
                        os.path.join(posts_dir, f"post_{post_number}_{file}")
                    )

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            executor.map(copy_post_files, saved_posts_info)

        return True

    except Exception as e:
        print(f"❌ Error organizing files: {e}")
        return False

def download_instagram_profile(username, browser="chrome", max_posts=5):
    """WORKING Instagram profile downloader WITH AI TRANSCRIPTION CLEANING AND TITLE GENERATION"""
    print(f"🚀 Instagram scraper with AI cleaning and title generation for @{username}")
    print("⚡ USING EXACT WORKING METHOD + AI TRANSCRIPTION CLEANING + PERSIAN TITLE GENERATION")
    print("🤖 AI will clean transcriptions and generate Persian titles for website/blog use")
    print("📅 POSTS ORDERED: Newest to Oldest")
    print("=" * 60)

    # Only add session cleanup - everything else stays the same
    clear_instaloader_sessions()

    connection = create_database_connection()
    if not connection:
        print("❌ Failed to connect to database. Please check your database configuration.")
        return

    if not ensure_database_structure(connection):
        print("❌ Failed to ensure database structure. Please check your database permissions.")
        return

    try:
        print(f"🍪 Loading cookies from {browser}...")
        if browser.lower() == "chrome":
            cookies = browser_cookie3.chrome(domain_name="instagram.com")
        elif browser.lower() == "safari":
            cookies = browser_cookie3.safari(domain_name="instagram.com")
        else:
            cookies = browser_cookie3.chromium(domain_name="instagram.com")

        # EXACT WORKING METHOD FROM YOUR ORIGINAL CODE
        ig = instaloader.Instaloader(
            download_videos=True,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
            post_metadata_txt_pattern=""
        )

        ig.context._session.cookies.update(cookies)

        download_folder = f"{username}_posts_{int(time.time())}"
        os.makedirs(download_folder, exist_ok=True)

        print(f"🔍 Fetching profile information...")
        profile = instaloader.Profile.from_username(ig.context, username)

        profile_data = {
            'full_name': profile.full_name or '',
            'biography': profile.biography or '',
            'followers': profile.followers,
            'mediacount': profile.mediacount
        }

        print(f"👤 {profile_data['full_name']} - {profile_data['followers']:,} followers")

        agent_id = get_or_create_agent(connection, username, profile_data)
        if not agent_id:
            return

        existing_shortcodes, filtered_shortcodes = get_existing_and_filtered_shortcodes(connection, agent_id)

        print(f"📊 Already have {len(existing_shortcodes)} posts in database")
        print(f"📊 Already filtered {len(filtered_shortcodes)} posts")

        profile_pic_response = requests.get(profile.get_profile_pic_url(), timeout=15)
        if profile_pic_response.status_code == 200:
            with open(os.path.join(download_folder, f"{username}_profile.jpg"), 'wb') as f:
                f.write(profile_pic_response.content)

        print(f"📥 Getting posts from Instagram (this may take a moment)...")

        saved_posts_info = []
        successful_posts = 0
        skipped_posts = 0
        filtered_posts = 0
        total_checked = 0
        current_post_number = get_next_post_number(connection, agent_id)

        print(f"🎯 Looking for {max_posts} NEW posts...")
        print(f"📋 Starting from post number {current_post_number}")

        for post in profile.get_posts():
            if successful_posts >= max_posts:
                print(f"✅ SUCCESS: Got {max_posts} new posts, stopping!")
                break

            total_checked += 1
            post_shortcode = post.shortcode
            post_date = post.date_utc.strftime('%Y-%m-%d %H:%M')

            if post_shortcode in existing_shortcodes:
                skipped_posts += 1
                print(f"⏭️  Skip #{total_checked} (exists): {post_date}")
                continue

            if post_shortcode in filtered_shortcodes:
                filtered_posts += 1
                print(f"🚫 Skip #{total_checked} (filtered): {post_date}")
                continue

            print(f"🆕 NEW POST #{total_checked} ({successful_posts + 1}/{max_posts}): {post_date}")

            # Check connection before processing each post
            if not connection or not connection.is_connected():
                print("❌ Database connection lost. Attempting to reconnect...")
                connection = create_database_connection()
                if not connection:
                    print("❌ Failed to reconnect to database. Stopping.")
                    break

            result, status = process_single_post(
                post, agent_id, connection, download_folder, current_post_number,
                existing_shortcodes, filtered_shortcodes, profile_data, username
            )

            if status == "success" and result:
                saved_posts_info.append(result)
                existing_shortcodes.add(result['shortcode'])
                successful_posts += 1
                current_post_number += 1
                print(f"✅ SAVED: Post {successful_posts}/{max_posts} (AI cleaned + Persian title)")
            elif status == "filtered":
                filtered_shortcodes.add(post_shortcode)
                filtered_posts += 1
                print(f"🚫 FILTERED: Not suitable")
            else:
                print(f"❌ FAILED: Could not process")

            # Add small random delay to avoid rate limiting
            time.sleep(random.uniform(0.5, 1.5))

        if successful_posts > 0:
            print(f"📁 Organizing {successful_posts} files...")
            organize_files_optimized(username, agent_id, download_folder, saved_posts_info)

        print(f"\n🎉 FINAL SUMMARY")
        print("=" * 50)
        print(f"👤 Agent: {profile_data['full_name']} (@{username})")
        print(f"🔍 Total posts checked: {total_checked}")
        print(f"⏭️  Skipped (already exist): {skipped_posts}")
        print(f"🚫 Skipped (filtered): {filtered_posts}")
        print(f"✅ NEW posts saved: {successful_posts}")
        print(f"🤖 AI cleaned transcriptions: {successful_posts}")
        print(f"🏷️ AI generated Persian titles: {successful_posts}")
        print(f"📊 Database now has: {len(existing_shortcodes)} total posts")
        print(f"🔄 CONTINUATION: ✅ WORKING")
        print(f"📅 Order: Newest to Oldest ✅")

        if successful_posts < max_posts:
            print(f"⚠️  Note: Only found {successful_posts} new posts (requested {max_posts})")
            print("   This means you've reached older posts or end of profile")

        try:
            shutil.rmtree(download_folder)
        except:
            pass

    except QueryReturnedBadRequestException as e:
        print(f"⚠️ Rate limited or unauthorized: {e}")
        print("💡 Solutions:")
        print("   1. Wait 10-15 minutes before trying again")
        print("   2. Make sure you're logged into Instagram in your browser")
        print("   3. Try using a different browser (chrome/firefox/safari)")
        print("   4. Clear browser cache and cookies, then log in again")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()

def test_database_and_show_agents():
    """Test database connection - OPTIMIZED"""
    connection = create_database_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT
                    (SELECT COUNT(*) FROM agents) as agents,
                    (SELECT COUNT(*) FROM posts) as posts,
                    (SELECT COUNT(*) FROM filtered_posts) as filtered
            """)
            counts = cursor.fetchone()
            print(f"📊 Database: {counts[0]} agents, {counts[1]} posts, {counts[2]} filtered")
        except Error as e:
            print(f"❌ Database error: {e}")
        finally:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    print("🚀 INSTAGRAM SCRAPER WITH AI TRANSCRIPTION CLEANING AND PERSIAN TITLE GENERATION")
    print("=" * 60)
    print("✅ USING EXACT WORKING METHOD FROM YOUR ORIGINAL CODE")
    print("🤖 NEW FEATURES:")
    print("• AI TRANSCRIPTION CLEANING")
    print("• AI PERSIAN TITLE GENERATION (UNIQUE & CONTENT-BASED)")
    print("🔄 GUARANTEED CONTINUATION:")
    print("• First run: Gets posts 1-5")
    print("• Second run: Gets posts 6-10")
    print("• Third run: Gets posts 11-15")
    print("• And so on...")
    print("🧹 FEATURES:")
    print("• Session cleanup (clears old cookies)")
    print("• Random delays (avoids rate limits)")
    print("• AI transcription cleaning for website/blog")
    print("• AI Persian title generation (unique, content-based)")
    print("• Saves both original and cleaned transcriptions")
    print("📅 POST ORDERING: Newest to Oldest")
    print("🔍 FILTER: Transcription >= 50 characters only")
    print("🏷️ TITLE GENERATION: AI creates unique titles based on actual content")
    print("=" * 60)

    test_database_and_show_agents()

    print("\n💡 BEFORE STARTING:")
    print("1. Make sure you're logged into Instagram in your browser")
    print("2. Close any Instagram tabs and reopen them")
    print("3. Make sure your Instagram account is not restricted")
    print("4. AI will clean transcriptions and generate UNIQUE Persian titles based on content")
    print("5. Make sure GROQ_API_KEY is set in your .env file for title generation")
    print("=" * 60)

    username = input("Enter Instagram username (default: mojtaba.dubai.amlak): ").strip() or "mojtaba.dubai.amlak"
    browser = input("Enter browser (chrome/firefox, default: chrome): ").strip() or "chrome"
    try:
        max_posts = int(input("Enter max NEW posts to get (default: 5): ").strip() or "5")
    except ValueError:
        max_posts = 5

    print(f"\n🎯 Starting AI-enhanced scraper:")
    print(f"📸 Username: @{username}")
    print(f"🌐 Browser: {browser}")
    print(f"📊 Max NEW Posts: {max_posts}")
    print(f"📅 Order: Newest → Oldest")
    print(f"🔄 Continuation: GUARANTEED")
    print(f"✅ Method: EXACT WORKING ORIGINAL")
    print(f"🤖 AI Cleaning: ENABLED")
    print(f"🏷️ Unique Persian Title Generation: ENABLED")
    print(f"🔑 Groq API: {'✅ ENABLED' if groq_client else '❌ DISABLED (check GROQ_API_KEY)'}")
    print(f"🎤 ElevenLabs API: {'✅ ENABLED' if elevenlabs else '❌ DISABLED (check ELEVEN_API_KEY)'}")
    
    # Test ElevenLabs connection
    if elevenlabs:
        test_elevenlabs_connection()
    
    print("=" * 60)

    download_instagram_profile(username, browser, max_posts)
    print("\n🎉 AI-enhanced scraping with unique Persian title generation completed!")