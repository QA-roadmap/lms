import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { ModuleAccordion } from "@/components/marketing/ModuleAccordion";
import { Pricing } from "@/components/marketing/Pricing";
import { Badge } from "@/components/ui/Badge";
import { getCourses, getCourseBySlug } from "@/lib/sanity";
import { courseLessonCount } from "@/lib/courses";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course: { slug: string }) => ({ slug: course.slug }));
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const isAvailable = course.status === "available";
  const lessonCount = courseLessonCount(course);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-16">
        <Link
          href="/courses"
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Усі курси
        </Link>

        <div className="mt-6 mb-12">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {course.title}
            </h1>
            {isAvailable ? (
              <Badge variant="free">Доступний</Badge>
            ) : (
              <Badge variant="default">Скоро</Badge>
            )}
          </div>
          <p className="mt-3 text-lg text-zinc-400">{course.tagline}</p>
          <p className="mt-4 max-w-2xl text-zinc-500">{course.description}</p>
          <p className="mt-4 text-sm text-zinc-600">
            {course.modules.length} модулів · {lessonCount} уроків
          </p>

          <div className="mt-8">
            {isAvailable ? (
              course.priceUSD !== undefined ? (
                <a
                  href="#pricing"
                  className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-colors"
                >
                  Отримати доступ · ${course.priceUSD}
                </a>
              ) : null
            ) : (
              <span className="inline-flex cursor-not-allowed rounded-xl border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-600">
                Скоро з’явиться
              </span>
            )}
          </div>
        </div>

        <ModuleAccordion modules={course.modules} defaultOpenId={course.modules[0]?._id ?? null} />
      </main>

      {isAvailable && course.priceUSD !== undefined && <Pricing course={course} />}

      <Footer />
    </div>
  );
}
