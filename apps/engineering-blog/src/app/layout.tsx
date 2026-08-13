import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { getAllCourses } from "./lib/content";

export const metadata: Metadata = {
  title: "AI 工程化 · AI Tutorial",
  description: "AI 工程化实战笔记 — MLOps、LLM 工程化、AI 基础设施、质量保障",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courses = getAllCourses();

  return (
    <html lang="zh-CN">
      <body>
        <Sidebar courses={courses} />
        <main className="ml-72 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
