import { getAgentById, getPost } from "@/lib/data";
import { notFound } from "next/navigation";
import PostPageClient from "./PostPageClient";

interface PostPageProps {
  params: {
    agentId: string;
    postId: string;
  };
}

export async function generateStaticParams() {
  try {
    console.log("generateStaticParams: Fetching all posts...");
    const response = await fetch(`${process.env.API_BASE_URL || "https://dubai-market-place.vercel.app"}/api/posts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MY_API_KEY || "",
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    const data = await response.json();
    console.log("generateStaticParams: Posts fetched:", data.posts?.length || 0);
    return data.posts?.map((post: { id: string; agentId: string }) => ({
      agentId: post.agentId,
      postId: post.id,
    })) || [];
  } catch (error) {
    console.error("generateStaticParams: Error:", error);
    return [];
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { agentId, postId } = params;
  console.log("PostPage: Fetching data for agent:", agentId, "post:", postId);

  const [agent, post] = await Promise.all([
    getAgentById(agentId),
    getPost(postId),
  ]);

  console.log("PostPage: Agent data:", agent);
  console.log("PostPage: Post data:", post);

  if (!agent || !post) {
    console.log("PostPage: Agent or post not found");
    notFound();
  }

  if (post.agentId !== agent.id) {
    console.log("PostPage: Post does not belong to agent");
    notFound();
  }

  return <PostPageClient agent={agent} post={post} />;
}