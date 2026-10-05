import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import LibraryClient from "@/components/library/LibraryClient";

export const metadata: Metadata = {
  title: "도서관리 | EDGE",
  description: "EDGE 도서관리 프론트 화면 예시 · 서버 미연동",
};

export default function LibraryPage() {
  return (
    <div lang="ko" className="min-h-screen bg-dark-bg p-4 sm:p-8">
      <main className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center rounded text-brand-green hover:text-white mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-4 focus-visible:ring-offset-dark-bg"
        >
          <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
          홈으로 돌아가기
        </Link>

        <header className="mb-8">
          <BookOpen size={40} className="text-brand-green mb-4" aria-hidden="true" />
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tighter">
            도서관리
          </h1>
          <p className="text-brand-green text-lg mt-3">EDGE 동아리 도서 대출</p>
        </header>

        <section
          aria-labelledby="library-service-status"
          className="bg-light-bg border border-gray-700 rounded-xl p-6 sm:p-8"
        >
          <h2 id="library-service-status" className="text-xl font-semibold text-white">
            서비스 준비 중
          </h2>
          <p className="mt-3 text-gray-300 leading-relaxed">
            도서 대출 서비스를 준비하고 있습니다. 아래 화면은 예시 데이터로 작성한
            프론트 껍데기입니다. 실제 대출·반납·저장은 서버 연동 후 이용할 수 있습니다.
          </p>
        </section>
        <LibraryClient />
      </main>
    </div>
  );
}
