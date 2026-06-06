export type Lesson = {
  slug: string;
  title: string;
  duration: string;
  isFree: boolean;
  isCapstone?: boolean;
  videoUrl?: string;
  content?: string;
};

export type Module = {
  id: string;
  code: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export const MODULES: Module[] = [
  {
    id: "m1",
    code: "M1",
    title: "Local AI App Development",
    description:
      "Build production-ready AI apps locally with streaming, memory, and tool use.",
    lessons: [
      {
        slug: "ollama-setup",
        title: "Setting Up Ollama for Local LLMs",
        duration: "18 min",
        isFree: true,
      },
      {
        slug: "langchain-basics",
        title: "LangChain Fundamentals",
        duration: "24 min",
        isFree: true,
      },
      {
        slug: "streaming-responses",
        title: "Implementing Streaming Responses",
        duration: "31 min",
        isFree: false,
      },
      {
        slug: "conversation-memory",
        title: "Conversation Memory & History",
        duration: "27 min",
        isFree: false,
      },
      {
        slug: "tool-use",
        title: "Tool Use & Function Calling",
        duration: "35 min",
        isFree: false,
      },
      {
        slug: "chat-ui",
        title: "Building a Chat UI with Next.js",
        duration: "42 min",
        isFree: false,
      },
      {
        slug: "local-app-capstone",
        title: "Capstone: Full Local Chat App",
        duration: "60 min",
        isFree: false,
        isCapstone: true,
      },
    ],
  },
  {
    id: "m2",
    code: "M2",
    title: "RAG & Context Engineering",
    description:
      "Master retrieval-augmented generation, embeddings, and vector databases.",
    lessons: [
      {
        slug: "embeddings-intro",
        title: "Understanding Embeddings",
        duration: "22 min",
        isFree: false,
      },
      {
        slug: "vector-databases",
        title: "Vector Databases Deep Dive",
        duration: "38 min",
        isFree: false,
      },
      {
        slug: "document-loaders",
        title: "Document Loaders & Chunking Strategies",
        duration: "33 min",
        isFree: false,
      },
      {
        slug: "retrieval-pipeline",
        title: "Building a Retrieval Pipeline",
        duration: "45 min",
        isFree: false,
      },
      {
        slug: "reranking",
        title: "Reranking & Hybrid Search",
        duration: "29 min",
        isFree: false,
      },
      {
        slug: "rag-evaluation",
        title: "Evaluating RAG Quality",
        duration: "36 min",
        isFree: false,
      },
      {
        slug: "rag-capstone",
        title: "Capstone: Document Q&A System",
        duration: "75 min",
        isFree: false,
        isCapstone: true,
      },
    ],
  },
  {
    id: "m3",
    code: "M3",
    title: "AI Agents & Workflows",
    description:
      "Design and implement autonomous agents, multi-agent systems, and complex workflows.",
    lessons: [
      {
        slug: "agent-architecture",
        title: "Agent Architecture Patterns",
        duration: "28 min",
        isFree: false,
      },
      {
        slug: "langgraph-intro",
        title: "Introduction to LangGraph",
        duration: "41 min",
        isFree: false,
      },
      {
        slug: "tool-design",
        title: "Designing Agent Tools",
        duration: "34 min",
        isFree: false,
      },
      {
        slug: "multi-agent",
        title: "Multi-Agent Coordination",
        duration: "47 min",
        isFree: false,
      },
      {
        slug: "human-in-loop",
        title: "Human-in-the-Loop Workflows",
        duration: "31 min",
        isFree: false,
      },
      {
        slug: "agents-capstone",
        title: "Capstone: Research Agent",
        duration: "90 min",
        isFree: false,
        isCapstone: true,
      },
    ],
  },
  {
    id: "m4",
    code: "M4",
    title: "AI Systems Engineering",
    description:
      "Build scalable, reliable AI systems with proper architecture and APIs.",
    lessons: [
      {
        slug: "system-design",
        title: "AI System Design Principles",
        duration: "32 min",
        isFree: false,
      },
      {
        slug: "api-design",
        title: "Designing AI-powered APIs",
        duration: "39 min",
        isFree: false,
      },
      {
        slug: "caching-strategies",
        title: "Caching for AI Workloads",
        duration: "26 min",
        isFree: false,
      },
      {
        slug: "async-processing",
        title: "Async Processing & Queues",
        duration: "44 min",
        isFree: false,
      },
      {
        slug: "observability",
        title: "Observability & Tracing",
        duration: "37 min",
        isFree: false,
      },
      {
        slug: "systems-capstone",
        title: "Capstone: Production AI API",
        duration: "80 min",
        isFree: false,
        isCapstone: true,
      },
    ],
  },
  {
    id: "m5",
    code: "M5",
    title: "MLOps & Production Systems",
    description:
      "Deploy, monitor, and maintain AI models in production environments.",
    lessons: [
      {
        slug: "model-serving",
        title: "Model Serving Patterns",
        duration: "35 min",
        isFree: false,
      },
      {
        slug: "containerization",
        title: "Containerizing AI Apps",
        duration: "28 min",
        isFree: false,
      },
      {
        slug: "ci-cd-ai",
        title: "CI/CD for AI Pipelines",
        duration: "42 min",
        isFree: false,
      },
      {
        slug: "monitoring",
        title: "Production Monitoring & Alerts",
        duration: "33 min",
        isFree: false,
      },
      {
        slug: "cost-optimization",
        title: "Cost Optimization Strategies",
        duration: "29 min",
        isFree: false,
      },
      {
        slug: "mlops-capstone",
        title: "Capstone: Full MLOps Pipeline",
        duration: "85 min",
        isFree: false,
        isCapstone: true,
      },
    ],
  },
  {
    id: "m6",
    code: "M6",
    title: "ML Foundations",
    description:
      "Core machine learning concepts every AI engineer must understand deeply.",
    lessons: [
      {
        slug: "transformers",
        title: "Transformers Architecture Explained",
        duration: "48 min",
        isFree: false,
      },
      {
        slug: "fine-tuning",
        title: "Fine-tuning & PEFT Methods",
        duration: "55 min",
        isFree: false,
      },
      {
        slug: "evaluation-metrics",
        title: "Evaluation Metrics for LLMs",
        duration: "31 min",
        isFree: false,
      },
      {
        slug: "prompt-engineering",
        title: "Advanced Prompt Engineering",
        duration: "38 min",
        isFree: false,
      },
      {
        slug: "ml-capstone",
        title: "Capstone: Custom Fine-tuned Model",
        duration: "100 min",
        isFree: false,
        isCapstone: true,
      },
    ],
  },
];

export const TOTAL_LESSONS = MODULES.reduce(
  (acc, m) => acc + m.lessons.length,
  0
);

export function getLessonBySlug(slug: string) {
  for (const module of MODULES) {
    const lesson = module.lessons.find((l) => l.slug === slug);
    if (lesson) return { module, lesson };
  }
  return null;
}
