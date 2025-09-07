# Dubai Agents Marketplace MVP

A minimal, professional marketplace platform for real estate agents in Dubai.

## Features

### Homepage
- Clean grid layout with agent cards (3 per row on desktop, 1 on mobile)
- Functional search bar to filter agents by name
- Minimal header with logo placeholder and navigation
- Simple footer with text links

### Agent Profile Pages
- Large circular profile image placeholder
- Agent details (name, address, bio, contact info)
- Social media icon placeholders
- Grid of post previews with thumbnails and excerpts
- Unique URLs for each agent

### Individual Post Pages
- Post title and large media placeholder
- Full post content and video transcription (if applicable)
- Post date and "Back to Profile" link
- Clean, content-focused design

## Design Specifications

- **Color Scheme**: White background, gray text, blue accents
- **Typography**: System font, 16px body text, 24px headings
- **Layout**: Generous white space, subtle borders, hover effects
- **Responsive**: Mobile-first design with proper grid layouts

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Data**: Mock data structure with TypeScript interfaces
- **Deployment**: Vercel-ready

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                    # Homepage
│   ├── agents/
│   │   └── [agentId]/
│   │       ├── page.tsx            # Agent profile
│   │       └── posts/
│   │           └── [postId]/
│   │               └── page.tsx    # Individual post
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── not-found.tsx              # 404 page
├── lib/
│   └── data.ts                     # Mock data and interfaces
└── README.md
\`\`\`

## Data Structure

### Agent Interface
\`\`\`typescript
interface Agent {
  id: string
  name: string
  address: string
  bio: string
  contact: {
    phone: string
    email: string
  }
  socialMedia: {
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}
\`\`\`

### Post Interface
\`\`\`typescript
interface Post {
  id: string
  agentId: string
  title: string
  content: string
  transcription?: string
  date: string
}
\`\`\`

## Getting Started

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open browser**
   Navigate to `http://localhost:3000`

## Sample Data

The platform includes 6 sample agents with realistic Dubai addresses and contact information, plus 5 sample posts with content and transcriptions.

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

#### Environment Variables
Set these in Vercel Project Settings → Environment Variables (and locally in a `.env` file):

```
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=

NEXT_PUBLIC_API_BASE_URL=https://dubai-market-place.vercel.app
```

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm start`

## Customization

### Adding New Agents
Edit `lib/data.ts` and add new agent objects to the `agents` array.

### Adding New Posts
Edit `lib/data.ts` and add new post objects to the `posts` array, ensuring the `agentId` matches an existing agent.

### Styling Changes
Modify `app/globals.css` or component-level Tailwind classes to adjust the design.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Static generation for all pages
- Optimized images with Next.js Image component
- Minimal CSS and JavaScript bundle
- Fast loading times

## Maintenance

### Regular Tasks
- Update agent information as needed
- Add new posts for agents
- Monitor site performance
- Update dependencies

### Content Management
Currently uses static data. For dynamic content management, consider integrating:
- Headless CMS (Strapi, Contentful)
- Database (PostgreSQL, MongoDB)
- Admin interface for content updates

---

**Built for Dubai's real estate community with a focus on simplicity and professionalism.**
