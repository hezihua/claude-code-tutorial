"use client";

const isProd = process.env.NODE_ENV === "production";

const prodUrls = {
  web: "https://ai-web-hubd.onrender.com",
  blog: "https://ai-blog-lwfn.onrender.com",
  engineering: "https://ai-engineering-blog.onrender.com",
};

const devUrls = {
  web: "http://localhost:3001",
  blog: "http://localhost:3002",
  engineering: "http://localhost:3003",
};

const urls = isProd ? prodUrls : devUrls;

interface SubProject {
  name: string;
  description: string;
  url: string;
  status: "active" | "planned";
}

const projects: SubProject[] = [
  {
    name: "Claude Code Tutorial",
    description: "交互式的 AI Agent 课程学习平台，包含 20 个循序渐进的章节、代码对比、模拟运行器和多语言支持。",
    url: urls.web,
    status: "active",
  },
  {
    name: "ML 课程笔记",
    description: "李宏毅老师机器学习课程学习笔记，涵盖机器学习、深度学习、强化学习、生成式 AI 等。",
    url: urls.blog,
    status: "active",
  },
  {
    name: "AI 工程化",
    description: "AI 工程化实战笔记，涵盖 MLOps 基础、LLM 工程化、AI 基础设施、质量保障等主题。",
    url: urls.engineering,
    status: "active",
  },
];

function ProjectCard({ project }: { project: SubProject }) {
  const isActive = project.status === "active";

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 ${
        isActive
          ? "border-neutral-800 bg-neutral-900/60 hover:border-neutral-600 hover:bg-neutral-900"
          : "border-neutral-800/50 bg-neutral-900/20 opacity-60 cursor-not-allowed"
      }`}
      onClick={(e) => !isActive && e.preventDefault()}
    >
      <div className="mb-4">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            isActive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-neutral-500/10 text-neutral-400"
          }`}
        >
          {isActive ? "● 在线" : "○ 规划中"}
        </span>
      </div>

      <h2 className="text-xl font-semibold text-neutral-100 mb-2">
        {project.name}
      </h2>

      <p className="text-sm text-neutral-400 leading-relaxed mb-8">
        {project.description}
      </p>

      {isActive && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 group-hover:text-emerald-300">
          <span>打开项目</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      )}
    </a>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-100 sm:text-5xl">
            AI Tutorial
          </h1>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            Harness Engineering for Real Agents —
            从 0 到 1 构建真实可用的 AI Agent 产品。
          </p>
        </header>

        <section>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </section>

        <footer className="mt-20 text-center text-xs text-neutral-600">
          <p>© 2026 AI Tutorial</p>
        </footer>
      </div>
    </main>
  );
}
