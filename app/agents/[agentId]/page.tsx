import { getAgentById } from "@/lib/data";
import { db } from "@/lib/db";
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
  console.log('AgentPage: Fetching agent with ID:', params.agentId);
  
  const agent: Agent | null = await getAgentById(params.agentId);
  console.log('AgentPage: Agent data received:', agent);

  if (!agent) {
    console.log('AgentPage: Agent not found');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Agent Not Found</h1>
          <p className="text-gray-600">
            The agent with ID "{params.agentId}" does not exist.
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
  let connection;
  try {
    console.log('generateStaticParams: Getting database connection...');
    connection = await db.getConnection();
    
    const [agents] = await connection.query('SELECT id FROM agents');
    console.log('generateStaticParams: Found agents:', agents);
    
    return (agents as any[]).map((agent) => ({
      agentId: agent.id,
    }));
  } catch (error) {
    console.error('generateStaticParams: Error:', error);
    return [];
  } finally {
    if (connection) {
      connection.release();
    }
  }
}