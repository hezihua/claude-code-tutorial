"use client";

interface SubProject {
  name: string;
  description: string;
  url: string;
  tags: string[];
  status: "active" | "planned";
  port: number;
}

const projects: SubProject[] = [
  {
    name: "Claude Code Tutorial",
    description: "交互式的 AI Agent 课程学习平台，包含 20 个循序渐进的章节、代码对比、模拟运行器和多语言支持。",
    url: "http://localhost:3001",
    tags: ["Next.js", "React", "TypeScript", "多语言"],
    status: "active",
    port: 3001,
  },
  {
    name: "Blog 博客",
    description: "Agent 开发经验、技术分享和深度文章的博客平台。即将推出。",
    url: "#",
    tags: ["Planned"],
    status: "planned",
    port: 3002,
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
      <div className="flex items-start justify-between mb-4">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            isActive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-neutral-500/10 text-neutral-400"
          }`}
        >
          {isActive ? "● 在线" : "○ 规划中"}
        </span>
        <span className="text-xs text-neutral-500">:{project.port}</span>
      </div>

      <h2 className="text-xl font-semibold text-neutral-100 mb-2">
        {project.name}
      </h2>

      <p className="text-sm text-neutral-400 leading-relaxed mb-6">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-neutral-800/60 px-2 py-1 text-xs text-neutral-400"
          >
            {tag}
          </span>
        ))}
      </div>

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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-4 py-1.5 text-xs text-neutral-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Monorepo · pnpm workspace
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-100 sm:text-5xl">
            AI Tutorial
          </h1>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            Harness Engineering for Real Agents —
            从 0 到 1 构建真实可用的 AI Agent 产品。
          </p>
        </header>

        <section>
          <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-500">
            子项目
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </section>

        <footer className="mt-20 text-center text-xs text-neutral-600">
          <p>© 2026 AI Tutorial · Built with Next.js + pnpm monorepo</p>
        </footer>
      </div>
    </main>
  );
}