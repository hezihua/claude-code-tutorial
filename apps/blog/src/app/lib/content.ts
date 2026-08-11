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
  "machine-learning": {
    title: "机器学习",
    subtitle: "Machine Learning",
    description: "从最基础的线性回归到深度学习入门，系统理解机器学习的核心概念与数学基础。",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    accent: "text-blue-400",
    topics: ["线性回归", "分类问题", "神经网络", "CNN", "RNN"],
  },
  "reinforcement-learning": {
    title: "强化学习",
    subtitle: "Reinforcement Learning",
    description: "从动态规划到深度强化学习，理解 Agent 如何通过与环境交互学习最优策略。",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
    topics: ["MDP", "Q-Learning", "Policy Gradient", "Actor-Critic", "RLHF"],
  },
  "generative-ai": {
    title: "生成式 AI",
    subtitle: "Generative AI",
    description: "GAN、VAE、Diffusion Model、大语言模型等生成式 AI 的核心原理与最新进展。",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    accent: "text-amber-400",
    topics: ["GAN", "Diffusion", "Transformer", "LLM", "Fine-tuning"],
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

  // 没有 frontmatter title 时，从正文第一个 H1 提取标题，并从正文中移除该行
  // 这样作者可以直接用 "# 标题" 开头，无需写 frontmatter
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

// 将所有课程的所有讲座展平为一个有序列表，用于跨课程的上一篇/下一篇导航
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