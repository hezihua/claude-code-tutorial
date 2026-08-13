"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const isProd = process.env.NODE_ENV === "production";
const portalUrl = isProd
  ? "https://ai-portal-tww0.onrender.com"
  : "http://localhost:3000";

interface CourseMeta {
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
  lectures: LectureMeta[];
}

interface LectureMeta {
  slug: string;
  title: string;
  order: number;
}

export default function Sidebar({ courses }: { courses: CourseMeta[] }) {
  const pathname = usePathname();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(() => {
    const match = pathname.match(/^\/courses\/([^/]+)/);
    return new Set(match ? [match[1]] : []);
  });

  const currentCourseSlug = useMemo(() => {
    const match = pathname.match(/^\/courses\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const currentLectureSlug = useMemo(() => {
    const match = pathname.match(/^\/courses\/[^/]+\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const toggleCourse = (slug: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const isActive = (courseSlug: string, lectureSlug?: string) => {
    if (!lectureSlug) return currentCourseSlug === courseSlug && !currentLectureSlug;
    return currentCourseSlug === courseSlug && currentLectureSlug === lectureSlug;
  };

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-72 flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 p-5">
        <Link href="/" className="block">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              AI Tutorial
            </span>
          </div>
          <h1 className="text-lg font-semibold text-neutral-100">
            课程笔记
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            李宏毅老师 · ML 系列
          </p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
          课程导航
        </div>

        {courses.map((course) => {
          const isExpanded = expandedCourses.has(course.slug);
          const hasLectures = course.lectures.length > 0;

          return (
            <div key={course.slug} className="mb-1">
              <button
                onClick={() => toggleCourse(course.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  currentCourseSlug === course.slug
                    ? "bg-neutral-800/60 text-neutral-100"
                    : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`shrink-0 text-xs ${course.accent}`}
                  >
                    ●
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {course.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {course.subtitle}
                    </div>
                  </div>
                </div>
                <svg
                  className={`h-3.5 w-3.5 shrink-0 text-neutral-600 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {isExpanded && hasLectures && (
                <ul className="mt-1 ml-4 space-y-0.5 border-l border-neutral-800 pl-3">
                  {course.lectures.map((lecture) => (
                    <li key={lecture.slug}>
                      <Link
                        href={`/courses/${course.slug}/${lecture.slug}`}
                        className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                          isActive(course.slug, lecture.slug)
                            ? "bg-neutral-800 text-neutral-100 font-medium"
                            : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                        }`}
                      >
                        {lecture.order < 999 && (
                          <span className="text-neutral-600 mr-1.5">
                            {String(lecture.order).padStart(2, "0")}
                          </span>
                        )}
                        {lecture.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {isExpanded && !hasLectures && (
                <div className="ml-4 pl-3 py-1.5 text-[10px] text-neutral-600 border-l border-neutral-800">
                  暂无笔记
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-neutral-800 p-4">
        <a
          href={portalUrl}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <span>←</span>
          <span>返回导航首页</span>
        </a>
      </div>
    </aside>
  );
}