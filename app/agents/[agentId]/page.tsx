import { getAgentById, getAllAgents } from "@/lib/data";
import AgentPageClient from "./AgentPageClient";

interface Agent {
  id: string;
  name: string;
  address: string;
  bio: string;
  phone: string;
  email: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  profileImage?: string;
}

interface AgentPageProps {
  params: { agentId: string };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const awaitedParams = await params;
  console.log('AgentPage: Fetching agent with ID:', awaitedParams.agentId);
  
  const agent: Agent | null = await getAgentById(awaitedParams.agentId);
  console.log('AgentPage: Agent data received:', agent);

  if (!agent) {
    console.log('AgentPage: Agent not found');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Agent Not Found</h1>
          <p className="text-gray-600">
            The agent with ID "{awaitedParams.agentId}" does not exist.
          </p>
          <a
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <AgentPageClient agent={agent} />;
}

export async function generateStaticParams() {
  try {
    console.log('generateStaticParams: Fetching all agents...');
    const agents = await getAllAgents();
    console.log('generateStaticParams: Found agents:', agents?.length || 0);
    
    return agents.map((agent) => ({
      agentId: agent.id,
    }));
  } catch (error) {
    console.error('generateStaticParams: Error fetching agents:', error);
    return [];
  }
}