import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface LectureMeta {
  slug: string;
  courseSlug: string;
  order: number;
  title: string;
  description: string;
  date?: string;
  tags: string[];
  content: string;
  raw: string;
}

export interface CourseMeta {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  border: string;
  accent: string;
  topics: string[];
  lectures: LectureMeta[];
}

const courseMetaOverrides: Record<
  string,
  {
    title: string;
    subtitle: string;
    description: string;
    color: string;
    border: string;
    accent: string;
    topics: string[];
  }
> = {
  "mlops-basics": {
    title: "MLOps 基础",
    subtitle: "MLOps Fundamentals",
    description: "从实验到生产的完整链路：数据版本管理、模型注册、CI/CD、监控告警。",
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    accent: "text-cyan-400",
    topics: ["数据版本", "模型注册", "流水线", "监控", "成本"],
  },
  "llm-engineering": {
    title: "LLM 工程化",
    subtitle: "LLM Engineering",
    description: "RAG 检索增强、Agent 架构、Prompt Engineering、向量数据库实战。",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/30",
    accent: "text-violet-400",
    topics: ["RAG", "Agent", "Prompt", "Embedding", "向量库"],
  },
  "ai-infra": {
    title: "AI 基础设施",
    subtitle: "AI Infrastructure",
    description: "推理加速、量化压缩、分布式训练、GPU 调度、缓存策略。",
    color: "from-emerald-500/20 to-green-500/20",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
    topics: ["推理优化", "模型压缩", "分布式", "GPU", "缓存"],
  },
  "quality-assurance": {
    title: "质量保障",
    subtitle: "Quality Assurance",
    description: "模型评估、LLM-as-a-Judge、安全对齐、红蓝对抗、A/B 测试。",
    color: "from-rose-500/20 to-red-500/20",
    border: "border-rose-500/30",
    accent: "text-rose-400",
    topics: ["评估", "安全", "监控", "A/B 测试", "成本"],
  },
};

function parseLectureFromFile(filePath: string, courseSlug: string): LectureMeta {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content: frontmatterContent } = matter(raw);

  const baseName = path.basename(filePath, ".md");
  const orderMatch = baseName.match(/^(\d+)-/);
  const frontmatterLecture = data.lecture as number | undefined;
  const order = orderMatch
    ? parseInt(orderMatch[1], 10)
    : frontmatterLecture
      ? frontmatterLecture
      : 999;
  const slug = baseName.replace(/^\d+-/, "");

  let title: string = data.title ?? "";
  let content = frontmatterContent;

  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
      content = content.replace(/^#\s+.+\n?/m, "");
    } else {
      title = slug;
    }
  }

  return {
    slug,
    courseSlug,
    order,
    title,
    description: data.description ?? "",
    date: data.date ? String(data.date) : undefined,
    tags: data.tags ?? [],
    content,
    raw,
  };
}

export function getAllCourses(): CourseMeta[] {
  const slugOrder = Object.keys(courseMetaOverrides);
  const bySlug = new Map<string, CourseMeta>();

  for (const slug of slugOrder) {
    const meta = courseMetaOverrides[slug];
    bySlug.set(slug, {
      slug,
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      color: meta.color,
      border: meta.border,
      accent: meta.accent,
      topics: meta.topics,
      lectures: [],
    });
  }

  if (fs.existsSync(CONTENT_DIR)) {
    const courseDirs = fs
      .readdirSync(CONTENT_DIR)
      .filter((d) => fs.statSync(path.join(CONTENT_DIR, d)).isDirectory())
      .sort();

    for (const dirName of courseDirs) {
      const coursePath = path.join(CONTENT_DIR, dirName);
      const mdFiles = fs
        .readdirSync(coursePath)
        .filter((f) => f.endsWith(".md"))
        .sort();

      const lectures = mdFiles.map((file) =>
        parseLectureFromFile(path.join(coursePath, file), dirName)
      );

      lectures.sort((a, b) => a.order - b.order);

      const existing = bySlug.get(dirName);
      if (existing) {
        existing.lectures = lectures;
      } else {
        const override = courseMetaOverrides[dirName];
        bySlug.set(dirName, {
          slug: dirName,
          title: override?.title ?? dirName,
          subtitle: override?.subtitle ?? dirName,
          description: override?.description ?? lectures[0]?.title ?? dirName,
          color: override?.color ?? "from-neutral-500/20 to-neutral-500/20",
          border: override?.border ?? "border-neutral-500/30",
          accent: override?.accent ?? "text-neutral-400",
          topics: override?.topics ?? [],
          lectures,
        });
      }
    }
  }

  const ordered: CourseMeta[] = [];
  for (const slug of slugOrder) {
    const c = bySlug.get(slug);
    if (c) ordered.push(c);
    bySlug.delete(slug);
  }
  for (const [, c] of bySlug) {
    ordered.push(c);
  }

  return ordered;
}

export function getCourse(slug: string): CourseMeta | undefined {
  return getAllCourses().find((c) => c.slug === slug);
}

export function getLecture(
  courseSlug: string,
  lectureSlug: string
): LectureMeta | undefined {
  const course = getCourse(courseSlug);
  return course?.lectures.find((l) => l.slug === lectureSlug);
}

export interface FlatLecture extends LectureMeta {
  courseSlug: string;
  courseTitle: string;
  courseAccent: string;
}

export function getAllLecturesFlat(): FlatLecture[] {
  const flat: FlatLecture[] = [];
  for (const course of getAllCourses()) {
    for (const lecture of course.lectures) {
      flat.push({
        ...lecture,
        courseSlug: course.slug,
        courseTitle: course.title,
        courseAccent: course.accent,
      });
    }
  }
  return flat;
}

export function getAdjacentLectures(
  courseSlug: string,
  lectureSlug: string
): { prev: FlatLecture | null; next: FlatLecture | null } {
  const flat = getAllLecturesFlat();
  const index = flat.findIndex(
    (l) => l.courseSlug === courseSlug && l.slug === lectureSlug
  );
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}
