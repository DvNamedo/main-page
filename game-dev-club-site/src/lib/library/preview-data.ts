import type { AdminPreviewData, OwnLoanDTO, PublicBookDTO } from "./screen-contracts";

// Entirely synthetic, bundled examples. No member or service data is read here.
export const exampleBooks: readonly PublicBookDTO[] = [
  { bookId: "B04", title: "게임 설계의 기초", author: "예시 저자 A", category: "게임 디자인" },
  { bookId: "B05", title: "게임 프로그래밍 입문", author: "예시 저자 B", category: "개발" },
  { bookId: "B06", title: "플레이와 이야기", author: "예시 저자 C", category: "기획" },
];

export const exampleOwnLoans: readonly OwnLoanDTO[] = [
  { loanId: "L01", bookId: "B01", title: "게임 설계의 기초", author: "예시 저자 A", dueDate: "2026-10-17", dueLabel: "2026.10.17", statusLabel: "대출 중", frozen: false, returnedAt: null, renewalCount: 0 },
  { loanId: "L02", bookId: "B02", title: "플레이와 이야기", author: "예시 저자 C", dueDate: "2026-10-13", dueLabel: "2026.10.13 · 동결 예시", statusLabel: "기한 동결", frozen: true, returnedAt: null, renewalCount: 1 },
  { loanId: "L13", bookId: "B03", title: "게임 프로그래밍 입문", author: "예시 저자 B", dueDate: "2026-09-30", dueLabel: "2026.09.30", statusLabel: "반납 완료", frozen: false, returnedAt: "2026-09-28T18:03:00+09:00", renewalCount: 0 },
];

export const exampleAdminData: AdminPreviewData = {
  books: [
    { bookId: "B01", title: "게임 설계의 기초", author: "예시 저자 A", category: "게임 디자인", hidden: false, newBorrowDisabled: false, statusLabel: "대출 중" },
    { bookId: "B02", title: "플레이와 이야기", author: "예시 저자 C", category: "기획", hidden: true, newBorrowDisabled: false, statusLabel: "공개 목록에서 숨김" },
    { bookId: "B03", title: "게임 프로그래밍 입문", author: "예시 저자 B", category: "개발", hidden: false, newBorrowDisabled: true, statusLabel: "신규 대출 불가" },
    ...exampleBooks.map((book) => ({ ...book, hidden: false, newBorrowDisabled: false, statusLabel: "대출 가능 표본" })),
  ],
  loans: [
    { ...exampleOwnLoans[0], category: "게임 디자인", studentNumber: "202600001", borrowerName: "회원 예시 1", linked: true, photoState: "보호 사진 표본", reviewStatus: "미검토", note: "", source: "일반 대출 예시" },
    { ...exampleOwnLoans[1], category: "기획", studentNumber: "202600002", borrowerName: "회원 예시 2", linked: true, photoState: "보호 사진 표본", reviewStatus: "확인 필요", note: "동방 점검", source: "일반 대출 예시" },
    { loanId: "L03", bookId: "B03", category: "개발", title: "게임 프로그래밍 입문", author: "예시 저자 B", dueDate: "2026-10-01", dueLabel: "2026.10.01", statusLabel: "연체 표본", frozen: false, returnedAt: null, renewalCount: 0, studentNumber: "202600003", borrowerName: "보충 기록 예시", linked: false, photoState: "사진 없음", reviewStatus: "미검토", note: "자동 회원 연결 없음", source: "보충 기록 예시" },
  ],
  cleanupLoans: [
    { ...exampleOwnLoans[0], category: "게임 디자인", loanId: "L11", statusLabel: "반납 완료", returnedAt: "2026-10-02T18:03:00+09:00", studentNumber: "202600001", borrowerName: "회원 예시 1", linked: true, photoState: "보호 사진 표본", reviewStatus: "검토 완료", note: "", source: "일반 대출 예시" },
    { ...exampleOwnLoans[2], category: "개발", loanId: "L12", returnedAt: "2026-10-03T19:10:00+09:00", studentNumber: "202600003", borrowerName: "회원 예시 3", linked: true, photoState: "보호 사진 표본", reviewStatus: "검토 완료", note: "", source: "일반 대출 예시" },
    { ...exampleOwnLoans[1], category: "기획", studentNumber: "202600002", borrowerName: "회원 예시 2", linked: true, photoState: "보호 사진 표본", reviewStatus: "확인 필요", note: "동방 점검", source: "일반 대출 예시" },
  ],
  freezes: [
    { freezeId: "F01", loanId: "L02", reason: "동방 점검", startedAt: "2026.10.05 10:00 KST", statusLabel: "동결 중" },
    { freezeId: "F02", loanId: "L02", reason: "자료 확인", startedAt: "2026.10.05 11:00 KST", statusLabel: "동결 중" },
  ],
  penalties: [
    { penaltyId: "P01", sourceLoanId: "L11", subjectLabel: "회원 예시 1", reason: "이전 기록의 제재 표본", expiresAt: "2026.10.18 14:32 KST" },
    { penaltyId: "P02", sourceLoanId: null, subjectLabel: "독립 프로필 참조 예시 2", reason: "독립 제재 표본", expiresAt: "2026.10.20 18:00 KST" },
  ],
  accounts: [
    { accountId: "ACCOUNT01", label: "관리자 예시", role: "admin" },
    { accountId: "ACCOUNT02", label: "회원 예시", role: "none" },
    { accountId: "MASTER00", label: "마스터 예시", role: "master" },
  ],
  policy: [
    { id: "loanDays", label: "기본 대출 기간", currentValue: "20", type: "number", helper: "일 · 예시 정책값" },
    { id: "maxLoans", label: "동시 대출 수", currentValue: "2", type: "number", helper: "권 · 최종 판정은 서버 계약 보류" },
    { id: "renewDays", label: "1회 연장 기간", currentValue: "3", type: "number", helper: "일 · 예시 정책값" },
    { id: "renewLimit", label: "최대 연장 횟수", currentValue: "2", type: "number", helper: "회 · 최종 판정은 서버 계약 보류" },
    { id: "penaltyHours", label: "제재 기간", currentValue: "48", type: "number", helper: "시간 · 업무 의미를 확정하지 않는 표본" },
    { id: "allowedHours", label: "허용 시간", currentValue: "09:00–22:00", type: "text", helper: "KST · 판정 및 저장 미연동" },
    { id: "blockedDates", label: "금지일", currentValue: "2026-10-09", type: "text", helper: "날짜 표시 표본 · 새 업무 규칙 없음" },
    { id: "notificationRule", label: "알림 정책", currentValue: "반납 기한 안내", type: "text", helper: "문구 표본 · 발송/설정 저장 미연동" },
  ],
};
