import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getCourse, getAllCourses } from "../../lib/content";

export function generateStaticParams() {
  return getAllCourses().map((c) => ({ course: c.slug }));
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: courseSlug } = await params;
  const course = getCourse(courseSlug);

  if (!course) {
    notFound();
  }

  if (course.lectures.length > 0) {
    redirect(`/courses/${course.slug}/${course.lectures[0].slug}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-neutral-500">该课程暂无笔记内容</p>
    </div>
  );
}