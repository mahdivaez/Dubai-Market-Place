import { getAgentById } from "@/lib/data";
import { notFound } from "next/navigation";
import AgentPageClient from "./AgentPageClient";

interface Agent {
  id: string;
  name: string;
  address: string;
  bio: string;
  phone?: string;
  email?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  profileImage?: string;
}

interface AgentPageProps {
  params: { agentId: string };
}

export default async function AgentPage({ params }: AgentPageProps) {
  console.log("AgentPage: Fetching agent with ID:", params.agentId);
  
  const agent: Agent | null = await getAgentById(params.agentId);
  console.log("AgentPage: Agent data received:", agent);

  if (!agent) {
    console.log("AgentPage: Agent not found");
    notFound();
  }

  return <AgentPageClient agent={agent} />;
}

export async function generateStaticParams() {
  try {
    console.log("generateStaticParams: Fetching all agents...");
    const response = await fetch(
      `${process.env.API_BASE_URL || "https://dubai-market-place.vercel.app"}/api/agents`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.MY_API_KEY || "",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status}`);
    }

    const data = await response.json();
    console.log("generateStaticParams: Agents fetched:", data.agents?.length || 0);

    return data.agents?.map((agent: { id: string }) => ({
      agentId: agent.id,
    })) || [];
  } catch (error) {
    console.error("generateStaticParams: Error:", error);
    return [];
  }
}