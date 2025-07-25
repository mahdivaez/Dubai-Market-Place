import { getAgentById, getPost } from "@/lib/data"
import { notFound } from "next/navigation"
import PostPageClient from "./PostPageClient"

interface PostPageProps {
  params: {
    agentId: string
    postId: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  console.log('PostPage: Fetching data for agent:', params.agentId, 'post:', params.postId);
  
  const [agent, post] = await Promise.all([
    getAgentById(params.agentId),
    getPost(params.postId)
  ])

  console.log('PostPage: Agent data:', agent);
  console.log('PostPage: Post data:', post);

  if (!agent || !post) {
    console.log('PostPage: Agent or post not found');
    notFound()
  }

  if (post.agentId !== agent.id) {
    console.log('PostPage: Post does not belong to agent');
    notFound()
  }

  return <PostPageClient agent={agent} post={post} />
}