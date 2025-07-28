import { getAgentById, getAllAgents } from "@/lib/data";
import { notFound } from "next/navigation";
import AgentPageClient from "./AgentPageClient";

export const dynamic = "force-dynamic";

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