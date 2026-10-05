/** R01 / SC03, SC05~07: preview DTOs. These are not server authorization contracts. */
export type ScreenId =
  | "M01" | "M02" | "M03" | "M04" | "M05" | "M06" | "M07" | "M08"
  | "A01" | "A02" | "A03" | "A04" | "A05" | "A06" | "A07" | "A08"
  | "S01" | "S02" | "S03" | "S04" | "S05" | "S06" | "S07" | "S08"
  | "S09" | "S10" | "S11" | "S12";

export type PreviewScenario = "normal" | "long" | "empty" | "loading" | "error";
export type PreviewMode = "member" | "admin" | "master";

export interface PublicBookDTO {
  bookId: string;
  title: string;
  author: string;
  category: string;
}

export interface OwnLoanDTO {
  loanId: string;
  bookId: string;
  title: string;
  author: string;
  dueDate: string;
  dueLabel: string;
  statusLabel: string;
  frozen: boolean;
  returnedAt: string | null;
  renewalCount: number;
}

export interface AdminBookDTO extends PublicBookDTO {
  hidden: boolean;
  newBorrowDisabled: boolean;
  statusLabel: string;
}

export interface AdminLoanDTO extends OwnLoanDTO {
  category: string;
  studentNumber: string;
  borrowerName: string;
  linked: boolean;
  photoState: string;
  reviewStatus: string;
  note: string;
  source: string;
}

export interface FreezeDTO {
  freezeId: string;
  loanId: string;
  reason: string;
  startedAt: string;
  statusLabel: string;
}

export interface PenaltyDTO {
  penaltyId: string;
  sourceLoanId: string | null;
  subjectLabel: string;
  reason: string;
  expiresAt: string;
}

export interface AdminAccountDTO {
  accountId: string;
  label: string;
  role: "none" | "admin" | "master";
}

export interface PolicyFieldDTO {
  id: string;
  label: string;
  currentValue: string;
  helper: string;
  type: "text" | "number";
}

export interface AdminPreviewData {
  books: readonly AdminBookDTO[];
  loans: readonly AdminLoanDTO[];
  cleanupLoans: readonly AdminLoanDTO[];
  freezes: readonly FreezeDTO[];
  penalties: readonly PenaltyDTO[];
  accounts: readonly AdminAccountDTO[];
  policy: readonly PolicyFieldDTO[];
}

export type QueryState<T> =
  | { status: "ready"; source: "example"; data: T }
  | { status: "loading"; source: "example" }
  | { status: "error"; source: "example"; message: string };

export type RequestState =
  | { status: "idle" }
  | { status: "invalid"; message: string; fields: readonly { id: string; label: string; message: string }[] }
  | { status: "not-connected"; message: string };

// Only serializable input drafts; a selected File never enters the command boundary.
export interface PreviewCommand {
  action: string;
  targetIds?: readonly string[];
  payload?: Readonly<Record<string, string | number | boolean | null | readonly string[]>>;
}

export type ScreenNavigation = (
  screen: ScreenId,
  selection?: { bookId?: string; loanId?: string },
) => void;

export interface PreviewGateway {
  readPublicBooks(scenario: PreviewScenario): QueryState<readonly PublicBookDTO[]>;
  readOwnLoans(scenario: PreviewScenario): QueryState<readonly OwnLoanDTO[]>;
  readAdminData(scenario: PreviewScenario): QueryState<AdminPreviewData>;
  readResult(reference: string): RequestState;
  request(command: PreviewCommand): RequestState;
}

export const screenTitles: Record<ScreenId, string> = {
  M01: "책 찾기", M02: "지금 대출하기", M03: "대출을 기록했어요",
  M04: "내 대출", M05: "반납을 확인해주세요", M06: "반납을 기록했어요",
  M07: "기한 연장", M08: "알림 설정",
  A01: "대출 기록", A02: "대출 기록 상세", A03: "도서 관리",
  A04: "운영 정책", A05: "예외 · 제재", A06: "자료 정리",
  A07: "접근 · 권한", A08: "보충 기록 · 정정",
  S01: "조건에 맞는 책이 없어요", S02: "지금은 처리할 수 없어요",
  S03: "사진을 다시 확인해주세요", S04: "처리 결과 확인 중",
  S05: "기한을 연장했어요", S06: "알림 설정 결과", S07: "반납 이력",
  S08: "연장 조건을 확인해주세요", S09: "대리 반납 확인",
  S10: "정책 적용을 확인해주세요", S11: "항목별 적용 결과",
  S12: "활성 기록 정리 확인",
};
