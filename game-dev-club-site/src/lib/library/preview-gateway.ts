import { exampleAdminData, exampleBooks, exampleOwnLoans } from "./preview-data";
import type { PreviewGateway, PreviewScenario, QueryState } from "./screen-contracts";

function exampleQuery<T>(scenario: PreviewScenario, data: T): QueryState<T> {
  if (scenario === "loading") return { status: "loading", source: "example" };
  if (scenario === "error") return { status: "error", source: "example", message: "조회 실패 표본입니다. 빈 목록으로 판정하지 않습니다." };
  return { status: "ready", source: "example", data };
}

// SC03 and SC04 stay separate. Replacing this adapter requires real server contracts.
export const previewGateway: PreviewGateway = {
  readPublicBooks(scenario) {
    const books = scenario === "empty" ? [] : exampleBooks.map((book) => ({
      bookId: book.bookId,
      title: scenario === "long" ? `${book.title} — 협업과 상호작용을 다루는 아주 긴 제목의 확장 표본` : book.title,
      author: scenario === "long" ? `${book.author} · 긴 공동 저자 이름과 번역자 이름 표본` : book.author,
      category: book.category,
    }));
    return exampleQuery(scenario, books);
  },
  readOwnLoans(scenario) {
    // Explicit own-data projection: admin identity, notes and protected photos are absent.
    const loans = scenario === "empty" ? [] : exampleOwnLoans.map((loan) => ({
      loanId: loan.loanId, bookId: loan.bookId,
      title: scenario === "long" ? `${loan.title} — 아주 긴 도서 제목과 부제의 배치 표본` : loan.title,
      author: scenario === "long" ? `${loan.author} · 긴 공동 저자 표본` : loan.author,
      dueDate: loan.dueDate, dueLabel: loan.dueLabel, statusLabel: loan.statusLabel,
      frozen: loan.frozen, returnedAt: loan.returnedAt, renewalCount: loan.renewalCount,
    }));
    return exampleQuery(scenario, loans);
  },
  readAdminData(scenario) {
    const data = scenario === "empty" ? {
      books: [], loans: [], cleanupLoans: [], freezes: [], penalties: [], accounts: [],
      policy: exampleAdminData.policy,
    } : scenario === "long" ? {
      ...exampleAdminData,
      books: exampleAdminData.books.map((book) => ({ ...book, title: `${book.title} — 아주 긴 도서 제목과 부제의 배치 표본`, author: `${book.author} · 긴 공동 저자 표본` })),
      loans: exampleAdminData.loans.map((loan) => ({ ...loan, title: `${loan.title} — 아주 긴 도서 제목과 부제의 배치 표본`, borrowerName: `${loan.borrowerName} · 긴 표시 이름 표본`, note: "긴 검토 메모와 상세 내용의 줄바꿈 표본입니다. 대상 식별 정보는 생략하지 않습니다." })),
      cleanupLoans: exampleAdminData.cleanupLoans.map((loan) => ({ ...loan, title: `${loan.title} — 아주 긴 도서 제목과 부제의 배치 표본`, borrowerName: `${loan.borrowerName} · 긴 표시 이름 표본` })),
    } : exampleAdminData;
    return exampleQuery(scenario, data);
  },
  readResult(_reference) {
    return { status: "not-connected", message: "결과 조회 미연동 · 조회를 전송하지 않았으며 원래 명령을 다시 실행하지 않았습니다." };
  },
  request(_command) {
    return { status: "not-connected", message: "서버 미연동 · 요청을 전송하지 않았으며 자료를 변경하지 않았습니다." };
  },
};
