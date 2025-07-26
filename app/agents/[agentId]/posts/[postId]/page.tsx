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
  const awaitedParams = await params;
  console.log('PostPage: Fetching data for agent:', awaitedParams.agentId, 'post:', awaitedParams.postId);
  
  const [agent, post] = await Promise.all([
    getAgentById(awaitedParams.agentId),
    getPost(awaitedParams.postId)
  ])

  console.log('PostPage: Agent data:', agent);
  console.log('PostPage: Post data:', post);

  if (!agent || !post) {
    console.log('PostPage: Agent or post not found');
    notFound()
  }

  // Verify the post belongs to the agent
  if (post.agentId !== agent.id) {
    console.log('PostPage: Post does not belong to agent');
    notFound()
  }

  return <PostPageClient agent={agent} post={post} />
}