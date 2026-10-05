"use client";

import { useEffect, useRef, useState } from "react";
import type { AdminLoanDTO, AdminPreviewData, PreviewCommand, ScreenId, ScreenNavigation } from "@/lib/library/screen-contracts";
import { Button, Card, Field, FilePicker, LoanIdentity, Notice, RecordTable, SelectField, StatusBadge } from "./library-ui";

export interface AdminScreensProps {
  screen: ScreenId;
  data: AdminPreviewData;
  selectedLoanId: string | null;
  role: "admin" | "master";
  onNavigate: ScreenNavigation;
  onCommand: (command: PreviewCommand) => void;
}

function RecordScreen({ data, selectedLoanId, onNavigate }: AdminScreensProps) {
  const [selectedId, setSelectedId] = useState<string | null>(selectedLoanId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const selected = data.loans.find((loan) => loan.loanId === selectedId);
  const rows = data.loans.filter((loan) => {
    const text = `${loan.title} ${loan.author} ${loan.loanId} ${loan.bookId} ${loan.studentNumber} ${loan.borrowerName}`.toLocaleLowerCase();
    const matchesState = filter === "all" || (filter === "active" && !loan.returnedAt)
      || (filter === "frozen" && loan.frozen) || (filter === "unlinked" && !loan.linked);
    return text.includes(query.toLocaleLowerCase()) && matchesState;
  });
  const selectionHidden = selected && !rows.some((loan) => loan.loanId === selected.loanId);

  return <div className="space-y-5">
    <p className="text-gray-300">대출 상태와 사진 검토가 필요한 항목을 확인합니다.</p>
    <div className="grid gap-4 sm:grid-cols-3">
      <Card title="미반납"><p className="text-2xl font-bold text-brand-green">{data.loans.filter((loan) => !loan.returnedAt).length}건</p></Card>
      <Card title="사진 검토 전"><p className="text-2xl font-bold text-brand-green">{data.loans.filter((loan) => loan.photoState !== "사진 없음" && ["미검토", "미확인", "확인 필요"].includes(loan.reviewStatus)).length}건</p></Card>
      <Card title="자료 확인 필요"><p className="text-2xl font-bold text-brand-green">{data.loans.filter((loan) => loan.statusLabel.includes("확인")).length}건</p></Card>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="admin-record-query" label="검색" value={query} onChange={setQuery} helper="책·도서 ID·대출 ID·학번·이름" />
      <SelectField id="admin-record-filter" label="대출 상태" value={filter} onChange={setFilter} options={[
        { value: "all", label: "전체" }, { value: "active", label: "미반납" },
        { value: "frozen", label: "동결 중" }, { value: "unlinked", label: "회원 미연결" },
      ]} helper="필터 변경 후에도 현재 선택은 유지합니다." />
    </div>
    <RecordTable rows={rows} selectedIds={selectedId ? [selectedId] : []} selection="single" onSelect={setSelectedId} caption="조회된 대출 기록" />
    <Card title={`현재 선택 · ${selected ? "1건" : "0건"}`}>
      {selected ? <LoanIdentity loan={selected} showBorrower /> : <p>상세를 볼 대출 기록을 선택해주세요.</p>}
      {selectedId && !selected && <p className="text-amber-200">이전 선택 {selectedId}를 현재 예시 목록에서 찾을 수 없습니다. 다른 기록으로 대체하지 않습니다.</p>}
      {selectionHidden && <p className="text-amber-200">선택한 기록은 현재 필터에서 숨겨져 있습니다. 선택 대상은 유지됩니다.</p>}
      <p role="status" className="text-sm text-gray-300">현재 보이는 선택 {selected && !selectionHidden ? 1 : 0}건 · 숨겨진 선택 {selectionHidden ? 1 : 0}건 · 전체 선택 {selected ? 1 : 0}건</p>
      <div className="flex flex-wrap gap-3">
        <Button tone="primary" disabled={!selected} onClick={() => selected && onNavigate("A02", { loanId: selected.loanId })}>선택한 기록 상세 보기</Button>
        <Button tone="quiet" disabled={!selectedId} onClick={() => setSelectedId(null)}>선택 해제</Button>
      </div>
    </Card>
  </div>;
}

function DetailScreen({ loan, onNavigate, onCommand }: {
  loan: AdminLoanDTO; onNavigate: ScreenNavigation; onCommand: (command: PreviewCommand) => void;
}) {
  const [review, setReview] = useState(loan.reviewStatus);
  const [note, setNote] = useState(loan.note);
  const [file, setFile] = useState<File | null>(null);
  return <div className="space-y-5">
    <p className="text-gray-300">선택한 기록의 사진 검토·정정·대리 반납 요청 내용을 준비합니다.</p>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Card title="증빙 사진">
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-gray-500 p-4 text-gray-300">사진 표시 영역 · 실제 사진 미연동</div>
        <p>사진 상태 · {loan.photoState}</p>
        <p className="text-sm text-gray-300">권한이 확인된 관리자만 열람하는 자료의 배치 표본입니다.</p>
        <p className="text-sm text-gray-300">촬영 시각·위치: 참고값 표시 미연동. 누락을 진위 판단이나 대출 거부 근거로 삼지 않습니다.</p>
      </Card>
      <Card title="선택한 대출">
        <LoanIdentity loan={loan} showBorrower />
        <p>회원 연결 · {loan.linked ? "연결됨" : "미연결"}</p>
        <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault(); onCommand({ action: "사진 검토 저장", targetIds: [loan.loanId], payload: { review, note } });
        }}>
          <SelectField id="admin-review" label="사진 검토 결과" value={review} onChange={setReview} options={[
            { value: loan.reviewStatus, label: `현재 표본 · ${loan.reviewStatus}` },
            { value: "일치", label: "일치" }, { value: "불일치", label: "불일치" }, { value: "확인 불가", label: "확인 불가" },
          ]} helper="사후 확인이며 대출 승인이 아닙니다." />
          <Field id="admin-note" label="관리자 내부 메모" value={note} onChange={setNote} helper="회원에게 공개되지 않는 예시 입력입니다." />
          <Button type="submit" tone="primary">검토 저장 요청 확인</Button>
        </form>
      </Card>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => onNavigate("A08", { loanId: loan.loanId, bookId: loan.bookId })}>선택 기록 정정</Button>
      <Button tone="quiet" onClick={() => onNavigate("A01")}>대출 기록으로</Button>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="실물 확인 후 대리 반납">
        <p className="text-sm">대출 {loan.loanId} · 도서 {loan.bookId} · {loan.title}</p>
        <Button id="library-proxy-return-trigger" disabled={!!loan.returnedAt} onClick={() => onNavigate("S09", { loanId: loan.loanId })}>선택한 기록 대리 반납 확인</Button>
        {loan.returnedAt && <p className="text-sm text-gray-300">이미 반납된 기록이므로 대리 반납 확인 버튼을 사용할 수 없습니다.</p>}
        <p className="text-sm text-gray-300">서버 미연동으로 반납·점유·제재·알림 상태는 변경되지 않습니다.</p>
      </Card>
      <Card title="새 사진 선택">
        <FilePicker id="admin-photo-replacement" label="교체할 사진" onChange={setFile} />
        <Button disabled={!file} onClick={() => onCommand({ action: "사진 교체", targetIds: [loan.loanId], payload: { fileName: file?.name ?? "" } })}>사진 교체 요청 확인</Button>
        {!file && <p className="text-sm text-gray-300">교체할 사진을 선택해야 요청 내용을 확인할 수 있습니다.</p>}
        <p className="text-sm text-gray-300">파일 선택 상태만 보관합니다. 기존 사진 변경·이미지 처리·업로드는 미연동입니다.</p>
      </Card>
    </div>
  </div>;
}

function CatalogScreen({ data, onCommand }: AdminScreensProps) {
  const firstBook = data.books[0];
  const [selectedId, setSelectedId] = useState<string | null>(firstBook?.bookId ?? null);
  const [title, setTitle] = useState(firstBook?.title ?? "");
  const [author, setAuthor] = useState(firstBook?.author ?? "");
  const [category, setCategory] = useState(firstBook?.category ?? "");
  const [hidden, setHidden] = useState(firstBook?.hidden ?? false);
  const [disabled, setDisabled] = useState(firstBook?.newBorrowDisabled ?? false);
  const [file, setFile] = useState<File | null>(null);
  const selected = data.books.find((book) => book.bookId === selectedId);
  function selectBook(id: string | null) {
    const book = data.books.find((candidate) => candidate.bookId === id);
    setSelectedId(id); setTitle(book?.title ?? ""); setAuthor(book?.author ?? ""); setCategory(book?.category ?? "");
    setHidden(book?.hidden ?? false); setDisabled(book?.newBorrowDisabled ?? false); setFile(null);
  }
  return <div className="space-y-5">
    <p className="text-gray-300">실물 한 권을 하나의 도서 항목으로 등록합니다.</p>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title={`전체 도서 · ${data.books.length}권`}>
        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm text-gray-300">수정할 도서 선택</legend>
          {data.books.map((book) => <label key={book.bookId} className={`flex min-w-0 gap-3 rounded-xl border p-4 ${selectedId === book.bookId ? "border-brand-green bg-emerald-950/30" : "border-gray-500"}`}>
            <input type="radio" name="admin-book-selection" checked={selectedId === book.bookId} onChange={() => selectBook(book.bookId)} aria-label={`도서 ${book.bookId} ${book.title} 선택`} className="mt-1" />
            <span className="min-w-0 space-y-2 break-words"><span className="block font-semibold">{book.title}</span><span className="block text-sm">{book.author} · {book.category}</span><StatusBadge label={book.statusLabel} /><span className="block text-sm">{selectedId === book.bookId ? "● 선택됨" : "○ 미선택"} · 도서 {book.bookId}</span></span>
          </label>)}
          {data.books.length === 0 && <p role="status">표시할 도서가 없습니다.</p>}
        </fieldset>
        <Button tone="quiet" onClick={() => selectBook(null)}>새 도서 등록 입력</Button>
      </Card>
      <Card title={selectedId ? "선택한 도서 수정" : "새 도서 등록"}>
        <p role="status" className="break-words">{selected ? `선택 1권 · 도서 ${selected.bookId} · ${selected.title} · ${selected.author}` : selectedId ? "현재 표본에서 선택 도서를 찾을 수 없습니다." : "새 도서 입력 · 아직 등록되지 않음"}</p>
        {selectedId && !selected && <p className="text-sm text-amber-200">선택한 도서가 현재 목록에 없어 저장 요청이 비활성입니다. 목록의 도서를 다시 선택하거나 새 도서 등록 입력을 사용해주세요.</p>}
        <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault(); onCommand({ action: selectedId ? "도서 수정" : "도서 등록", targetIds: selectedId ? [selectedId] : [], payload: { title, author, category, hidden, newBorrowDisabled: disabled, fileName: file?.name ?? "" } });
        }}>
          <Field id="admin-book-title" label="제목" required value={title} onChange={setTitle} />
          <Field id="admin-book-author" label="저자" required value={author} onChange={setAuthor} />
          <Field id="admin-book-category" label="분야" required value={category} onChange={setCategory} />
          <FilePicker key={selectedId ?? "new-book"} id="admin-catalog-photo" label="등록 사진 추가 · 선택" onChange={setFile} />
          <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} /><span>공개 목록에서 숨김</span></label>
          <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} /><span>신규 대출 불가</span></label>
          <p className="text-sm text-gray-300">숨김은 회원 연장도 제한합니다. 신규 대출 불가만 설정한 책의 기존 연장은 허용합니다.</p>
          <Button type="submit" tone="primary" disabled={!!selectedId && !selected}>도서 저장 요청 확인</Button>
        </form>
        <p className="text-sm text-gray-300">현재 목록의 값은 유지됩니다. 이 입력은 서버 저장과 분리된 변경 초안입니다.</p>
      </Card>
    </div>
  </div>;
}

function PolicyScreen({ data, onCommand }: AdminScreensProps) {
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(data.policy.map((field) => [field.id, field.currentValue])));
  return <div className="space-y-5">
    <p className="text-gray-300">현재 유효 정책의 예시값과 변경 입력을 구별합니다.</p>
    <Notice title="정책 변경의 적용 범위"><p>새 최대 기간은 이후 신규 대출에 적용됩니다. 기존 예정일과 이미 발생한 제재 종료는 유지됩니다. 화면의 숫자는 운영 확정값이 아닙니다.</p></Notice>
    <form className="space-y-5" onSubmit={(event) => {
      event.preventDefault(); onCommand({ action: "운영 정책 변경", payload: draft });
    }}>
      <div className="grid gap-5 lg:grid-cols-2">
        {data.policy.map((field) => <Card key={field.id} title={field.label}>
          <p className="break-words text-sm text-gray-300">현재 예시값 · {field.currentValue}</p>
          <Field id={`admin-policy-${field.id}`} label={`${field.label} 변경 입력`} type={field.type} value={draft[field.id] ?? field.currentValue} onChange={(value) => setDraft((previous) => ({ ...previous, [field.id]: value }))} helper={field.helper} />
        </Card>)}
      </div>
      <Button type="submit" tone="primary">변경 내용 확인</Button>
    </form>
    <Notice title="시간·알림 판정 미연동" tone="warning"><p>알림 구간·동결과 시간 알림의 결합·후속 연체 안내 등 보류된 의미를 이 입력으로 확정하지 않습니다. 정책 적용·주소 확인·실제 발송은 수행하지 않습니다.</p></Notice>
  </div>;
}

function ExceptionScreen({ data, onCommand }: AdminScreensProps) {
  const [loanIds, setLoanIds] = useState<readonly string[]>([]);
  const [freezeId, setFreezeId] = useState("");
  const [penaltyId, setPenaltyId] = useState("");
  const [freezeReason, setFreezeReason] = useState("");
  const [resumeReason, setResumeReason] = useState("");
  const [extendReason, setExtendReason] = useState("");
  const [clearReason, setClearReason] = useState("");
  const [days, setDays] = useState("");
  const selectedFreeze = data.freezes.find((freeze) => freeze.freezeId === freezeId);
  const selectedPenalty = data.penalties.find((penalty) => penalty.penaltyId === penaltyId);
  const activeLoans = data.loans.filter((loan) => !loan.returnedAt);
  const selectedLoans = activeLoans.filter((loan) => loanIds.includes(loan.loanId));
  return <div className="space-y-5">
    <p className="text-gray-300">대출·동결·제재를 각각 선택하고 대상의 ID와 사유를 확인합니다.</p>
    <RecordTable rows={activeLoans} selectedIds={loanIds} selection="multiple" caption="동결·기간 확대 대상 대출" onSelect={(id) => setLoanIds((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id])} />
    <Notice title={`현재 대출 선택 · ${selectedLoans.length}건`}><p className="break-words">{selectedLoans.length ? selectedLoans.map((loan) => `${loan.loanId} · ${loan.bookId} · ${loan.title}`).join(" / ") : "대출 미선택"}</p><p>동결·제재 해제 대상은 아래에서 독립적으로 선택합니다. 이후 새 대출은 현재 선택 집합에 자동 포함하지 않습니다.</p></Notice>
    {!selectedLoans.length && <p className="text-sm text-gray-300">대출을 선택해야 동결과 기간 확대 요청을 사용할 수 있습니다.</p>}
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="기한 동결">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onCommand({ action: "선택 대출 동결", targetIds: selectedLoans.map((loan) => loan.loanId), payload: { reason: freezeReason } }); }}>
          <Field id="admin-freeze-reason" label="동결 사유" required value={freezeReason} onChange={setFreezeReason} />
          <Button type="submit" disabled={!selectedLoans.length}>선택 대출 동결 요청 확인</Button>
        </form>
        <p className="text-sm text-gray-300">겹친 날짜는 한 번만 계산합니다. 해제는 선택한 동결만 대상으로 합니다.</p>
      </Card>
      <Card title="관리자 기간 확대">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onCommand({ action: "관리자 기간 확대", targetIds: selectedLoans.map((loan) => loan.loanId), payload: { days, reason: extendReason } }); }}>
          <Field id="admin-extend-days" label="추가 일수" type="number" min={1} step={1} required value={days} onChange={setDays} helper="양의 정수 · 회원 연장 횟수와 별개" />
          <Field id="admin-extend-reason" label="기간 확대 사유" required value={extendReason} onChange={setExtendReason} />
          <Button type="submit" disabled={!selectedLoans.length}>대상 · 추가 기간 확인</Button>
        </form>
        <p className="text-sm text-amber-200">이미 발생한 연체는 유지됩니다. 연체 확대 이후 누적·회원 차단 결합 판정은 보류되어 있습니다.</p>
      </Card>
      <Card title="선택한 동결만 해제">
        <p role="status">현재 동결 선택 · {selectedFreeze ? "1건" : "0건"}</p>
        <SelectField id="admin-freeze-selection" label="해제할 동결" value={freezeId} onChange={setFreezeId} options={[
          { value: "", label: "동결 미선택" }, ...data.freezes.map((freeze) => ({ value: freeze.freezeId, label: `${freeze.freezeId} · 대출 ${freeze.loanId} · ${freeze.reason}` })),
        ]} />
        {selectedFreeze && <div className="space-y-2 break-words"><p>선택 동결 {selectedFreeze.freezeId} · 대출 {selectedFreeze.loanId}</p><p>사유 · {selectedFreeze.reason}</p><p>시작 · {selectedFreeze.startedAt}</p><StatusBadge label={selectedFreeze.statusLabel} /></div>}
        {!selectedFreeze && <p className="text-sm text-gray-300">해제할 동결을 선택해야 동결 해제 요청을 사용할 수 있습니다.</p>}
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (selectedFreeze) onCommand({ action: "선택 동결 해제", targetIds: [selectedFreeze.freezeId], payload: { loanId: selectedFreeze.loanId, reason: resumeReason } }); }}>
          <Field id="admin-resume-reason" label="동결 해제 사유" required value={resumeReason} onChange={setResumeReason} />
          <Button type="submit" disabled={!selectedFreeze}>선택한 동결만 해제 요청 확인</Button>
        </form>
        <p className="text-sm text-gray-300">다른 동결은 유지합니다. 선택 대출만으로 해제할 동결을 추정하지 않습니다.</p>
      </Card>
      <Card title="선택 제재 해제">
        <p role="status">현재 제재 선택 · {selectedPenalty ? "1건" : "0건"}</p>
        <SelectField id="admin-penalty-selection" label="해제할 제재" value={penaltyId} onChange={setPenaltyId} options={[
          { value: "", label: "제재 미선택" }, ...data.penalties.map((penalty) => ({ value: penalty.penaltyId, label: `${penalty.penaltyId} · ${penalty.subjectLabel} · ${penalty.reason}` })),
        ]} />
        {selectedPenalty && <div className="space-y-2 break-words"><p>선택 제재 {selectedPenalty.penaltyId} · {selectedPenalty.subjectLabel}</p><p>원 대출 · {selectedPenalty.sourceLoanId ?? "원본 기록 없음 · 독립 제재"}</p><p>사유 · {selectedPenalty.reason}</p><p>종료 · {selectedPenalty.expiresAt}</p></div>}
        {!selectedPenalty && <p className="text-sm text-gray-300">해제할 제재를 선택해야 제재 해제 요청을 사용할 수 있습니다.</p>}
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (selectedPenalty) onCommand({ action: "선택 제재 해제", targetIds: [selectedPenalty.penaltyId], payload: { reason: clearReason } }); }}>
          <Field id="admin-clear-reason" label="제재 해제 사유" required value={clearReason} onChange={setClearReason} />
          <Button type="submit" disabled={!selectedPenalty}>선택 제재 해제 요청 확인</Button>
        </form>
        <p className="text-sm text-gray-300">다른 제재와 대출 연체는 유지됩니다. Loan 원본이나 사진을 제재 상세에서 재구성하지 않습니다.</p>
      </Card>
    </div>
  </div>;
}

function CleanupScreen({ data, onCommand }: AdminScreensProps) {
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [scope, setScope] = useState("photoOnly");
  const [reason, setReason] = useState("");
  const [forceConfirmed, setForceConfirmed] = useState(false);
  const [preview, setPreview] = useState<{ ids: readonly string[]; scope: string; from: string; to: string; dataSignature: string } | null>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const dataSignature = JSON.stringify(data.cleanupLoans.map((loan) => [
    loan.loanId, loan.bookId, loan.title, loan.author, loan.category,
    loan.studentNumber, loan.borrowerName, loan.linked, loan.dueDate, loan.dueLabel,
    loan.statusLabel, loan.frozen, loan.returnedAt, loan.photoState, loan.reviewStatus,
  ]));
  const previewSignature = preview?.dataSignature;
  useEffect(() => {
    if (previewSignature !== undefined && previewSignature !== dataSignature) {
      setPreview(null); setForceConfirmed(false);
    }
  }, [dataSignature, previewSignature]);
  useEffect(() => { if (preview) confirmationRef.current?.focus(); }, [preview]);
  const rangeError = from && to && from > to ? "시작 날짜가 종료 날짜보다 늦습니다." : "";
  const rows = data.cleanupLoans.filter((loan) => {
    if (!from && !to) return true;
    const returnedDate = loan.returnedAt?.slice(0, 10);
    return !!returnedDate && (!from || returnedDate >= from) && (!to || returnedDate <= to);
  });
  const selectedLoans = data.cleanupLoans.filter((loan) => selectedIds.includes(loan.loanId));
  const hiddenCount = selectedLoans.filter((loan) => !rows.some((row) => row.loanId === loan.loanId)).length;
  const activeCount = selectedLoans.filter((loan) => !loan.returnedAt).length;
  const scopeLabel = scope === "photoOnly" ? "사진만" : "대출 DB 항목 + 사진";
  function invalidatePreview() { setPreview(null); setForceConfirmed(false); }
  return <div className="space-y-5">
    <p className="text-gray-300">현재 선택한 대출 기록과 사진의 정리 범위를 확인합니다. 실제 삭제는 미연동입니다.</p>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Field id="cleanup-from" label="반납 처리 시작 날짜" type="date" value={from} onChange={(value) => { setFrom(value); invalidatePreview(); }} helper="반납 처리 날짜를 기준으로 합니다. 빈 값은 하한 없음." />
      <Field id="cleanup-to" label="반납 처리 종료 날짜" type="date" value={to} onChange={(value) => { setTo(value); invalidatePreview(); }} error={rangeError} helper="종료 날짜 포함. 날짜 조건이 있으면 미반납 기록은 제외합니다." />
      <SelectField id="cleanup-scope" label="정리 범위" value={scope} onChange={(value) => { setScope(value); invalidatePreview(); }} options={[{ value: "photoOnly", label: "사진만" }, { value: "loanAndPhotos", label: "대출 DB 항목 + 사진" }]} />
    </div>
    <RecordTable rows={rows} selectedIds={selectedIds} selection="multiple" caption="정리할 대상" onSelect={(id) => {
      setSelectedIds((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]); invalidatePreview();
    }} />
    <Card title={`현재 선택 · ${selectedLoans.length}건`}>
      <p className="break-words">{selectedLoans.length ? selectedLoans.map((loan) => `${loan.loanId} · ${loan.bookId} · ${loan.title}`).join(" / ") : "선택한 대출 기록 없음"}</p>
      <p>정리 범위 · {scopeLabel} / 활성 기록 {activeCount}건</p>
      <p role="status">현재 보이는 선택 {selectedLoans.length - hiddenCount}건 · 숨겨진 선택 {hiddenCount}건 · 전체 선택 {selectedLoans.length}건</p>
      {!selectedLoans.length && <p className="text-sm text-gray-300">현재 선택한 기록이 없어 정리 확인을 열 수 없습니다.</p>}
      {selectedIds.length > selectedLoans.length && <p className="text-amber-200">현재 예시 자료에서 찾을 수 없는 이전 선택 {selectedIds.length - selectedLoans.length}건 · 확인 대상에 포함하지 않습니다.</p>}
      {!!rangeError && <p className="text-sm text-gray-300">날짜 범위를 수정한 뒤 정리 확인을 열어주세요.</p>}
      <div className="flex flex-wrap gap-3">
        <Button id="library-cleanup-trigger" tone="danger" disabled={!selectedLoans.length || !!rangeError} onClick={() => {
          setForceConfirmed(false); setPreview({ ids: selectedLoans.map((loan) => loan.loanId), scope, from, to, dataSignature });
        }}>선택 대상 · 정리 범위 확인</Button>
        <Button tone="quiet" disabled={!selectedIds.length} onClick={() => { setSelectedIds([]); invalidatePreview(); }}>전체 선택 해제</Button>
      </div>
    </Card>
    <Notice title="사진만 정리할 경우"><p>대출 기록·기한·점유·제재·촬영 참고값·검토 결과·메모는 유지합니다. 현재 화면은 정리 요청 전의 표본입니다.</p></Notice>
    {preview && preview.dataSignature === dataSignature && <div ref={confirmationRef} tabIndex={-1} className="space-y-4 rounded-xl border border-amber-400 p-4 sm:p-6" aria-labelledby="cleanup-confirm-title">
      <h3 id="cleanup-confirm-title" className="text-xl font-semibold">선택 대상 정리 확인 · 화면 검토 표본</h3>
      <p className="break-words">대출 {preview.ids.join(", ")} · {preview.ids.length}건 · {scopeLabel}</p>
      <div className="grid gap-4 lg:grid-cols-2">{selectedLoans.filter((loan) => preview.ids.includes(loan.loanId)).map((loan) => <div key={loan.loanId} className="rounded-lg border border-gray-600 p-3"><LoanIdentity loan={loan} showBorrower /></div>)}</div>
      <p>반납 처리 날짜 조건 · {preview.from || "하한 없음"} ~ {preview.to || "상한 없음"}</p>
      <p>현재 필터에서 숨겨진 선택 {hiddenCount}건을 포함합니다.</p>
      {scope === "loanAndPhotos" && activeCount > 0 && <Notice title={`활성 기록 ${activeCount}건 포함`} tone="warning"><p>반납과 같은 제재 판정과 점유 해제가 필요한 정리입니다. 실물 반납이 확인되었다는 뜻은 아닙니다. 실제 서버 판정·삭제는 미연동입니다.</p></Notice>}
      <form className="space-y-4" onSubmit={(event) => {
        event.preventDefault();
        if (preview.dataSignature !== dataSignature) return;
        onCommand({ action: "선택 자료 정리", targetIds: preview.ids, payload: { scope: preview.scope, from: preview.from, to: preview.to, reason, forceConfirmation: forceConfirmed } });
      }}>
        <Field id="cleanup-reason" label="정리 사유" required value={reason} onChange={setReason} />
        {scope === "loanAndPhotos" && activeCount > 0 && <label className="flex min-h-11 items-start gap-3"><input type="checkbox" checked={forceConfirmed} onChange={(event) => setForceConfirmed(event.target.checked)} className="mt-1" /><span>선택한 활성 기록과 정리 범위·경고를 확인했습니다.</span></label>}
        {scope === "loanAndPhotos" && activeCount > 0 && !forceConfirmed && <p className="text-sm text-gray-300">활성 기록과 범위·경고 확인을 체크해야 요청 내용을 확인할 수 있습니다.</p>}
        <div className="flex flex-wrap gap-3"><Button type="submit" tone="danger" disabled={scope === "loanAndPhotos" && activeCount > 0 && !forceConfirmed}>정리 요청 확인 · 서버 미연동</Button><Button tone="quiet" onClick={() => { invalidatePreview(); document.getElementById("library-cleanup-trigger")?.focus(); }}>확인 취소</Button></div>
      </form>
      <p className="text-sm text-gray-300">선택·범위·날짜 조건 또는 대상 표시·상태 표본을 바꾸면 이 확인을 취소합니다. 대상 상태·버전·현재 권한의 서버 재검사는 미연동입니다.</p>
    </div>}
    <Card title="이전 정리 작업 R-00 · 부분 결과 표본">
      <p>현재 선택과 별개의 예시 결과입니다.</p>
      <ul className="list-disc space-y-2 pl-5 text-sm"><li>항목 01: 사진 영구 삭제 확인 · 대출 기록 유지</li><li>항목 02: DB 항목 삭제 확인 · 사진 정리 미완료</li></ul>
      <p className="text-sm text-gray-300">남은 작업이 있어 전체 정리 완료로 표시하지 않습니다. 삭제된 원본의 이름·학번·사진을 복원하지 않습니다.</p>
    </Card>
  </div>;
}

function AccessScreen({ data, role, onCommand }: AdminScreensProps) {
  const [loginId, setLoginId] = useState("");
  const [credential, setCredential] = useState("");
  const [accountId, setAccountId] = useState("");
  const account = data.accounts.find((candidate) => candidate.accountId === accountId);
  return <div className="space-y-5">
    <p className="text-gray-300">관리자 접근과 마스터의 역할 관리를 구별합니다. 현재 역할은 화면 탐색용 예시입니다.</p>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="관리자 접근 · 미연동">
        <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault(); onCommand({ action: "관리자 인증", payload: { loginId, credentialEntered: !!credential } });
        }}>
          <Field id="admin-login-id" label="관리 접근 계정" required value={loginId} onChange={setLoginId} helper="회원 화면은 로그인 없이 이용합니다." />
          <Field id="admin-credential" label="예시 인증 정보" type="password" required value={credential} onChange={setCredential} helper="서버 인증·세션 발급과 연결되지 않은 입력 표본입니다." />
          <Button type="submit" tone="primary">관리자 인증 요청 확인</Button>
        </form>
        <Button tone="quiet" onClick={() => onCommand({ action: "관리자 접근 종료" })}>관리자 접근 종료 요청 확인</Button>
      </Card>
      <Card title="마스터 역할 관리 · 예시">
        <SelectField id="admin-account-selection" label="역할 변경 대상 계정" value={accountId} onChange={setAccountId} options={[
          { value: "", label: "계정 미선택" }, ...data.accounts.filter((candidate) => candidate.role !== "master").map((candidate) => ({ value: candidate.accountId, label: `${candidate.accountId} · ${candidate.label}` })),
        ]} />
        {account && <div className="space-y-2 break-words"><p>선택 계정 · {account.accountId} · {account.label}</p><StatusBadge label={`현재 예시 역할 ${account.role}`} /></div>}
        <div className="flex flex-wrap gap-3"><Button disabled={role !== "master" || !account} onClick={() => account && onCommand({ action: "관리자 권한 부여", targetIds: [account.accountId], payload: { role: "admin" } })}>선택 계정 관리자 권한 부여</Button><Button tone="danger" disabled={role !== "master" || !account} onClick={() => account && onCommand({ action: "관리자 권한 회수", targetIds: [account.accountId], payload: { role: "none" } })}>선택 계정 관리자 권한 회수</Button></div>
        <p className="text-sm text-gray-300">역할 관리는 마스터만 사용할 수 있습니다. 실제 권한 확인·변경은 미연동이며 마스터는 변경 대상에서 제외합니다.</p>
      </Card>
    </div>
    <Notice title="회원 접근과 관리자 접근은 별도"><p>회원 쿠키를 관리자 권한으로 취급하지 않습니다. 후보 계정 발급·회원 계정 연결의 의미는 보류되어 있으며 이 화면에서 계정을 생성하지 않습니다.</p></Notice>
  </div>;
}

function SupplementalScreen({ data, selectedLoanId, onCommand, onNavigate }: AdminScreensProps) {
  const existing = data.loans.find((loan) => loan.loanId === selectedLoanId);
  const [mode, setMode] = useState(existing ? "correction" : "supplemental");
  const [bookId, setBookId] = useState(existing?.bookId ?? "");
  const [studentNumber, setStudentNumber] = useState(existing?.studentNumber ?? "");
  const [name, setName] = useState(existing?.borrowerName ?? "");
  const [sourceTime, setSourceTime] = useState("");
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? "");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const book = data.books.find((candidate) => candidate.bookId === bookId);
  return <div className="space-y-5">
    <p className="text-gray-300">현실에서 확인한 기록의 보충·정정 입력을 준비합니다. 입력값이 회원 소유를 만들지 않습니다.</p>
    <SelectField id="admin-record-mode" label="작성 방식" value={mode} onChange={setMode} options={[
      { value: "supplemental", label: "미연결 대출 보충 입력" }, ...(existing ? [{ value: "correction", label: `선택 기록 ${existing.loanId} 정정 입력` }] : []),
    ]} />
    {mode === "correction" && existing && <Card title="정정 대상"><LoanIdentity loan={existing} showBorrower /><Button tone="quiet" onClick={() => onNavigate("A02", { loanId: existing.loanId })}>해당 기록 상세로</Button></Card>}
    <form className="space-y-5" onSubmit={(event) => {
      event.preventDefault();
      const payload: Record<string, string | boolean> = { bookId, studentNumber, name, dueDate, reason, fileName: file?.name ?? "", hasPhoto: !!file };
      if (sourceTime) payload.sourceTime = sourceTime;
      onCommand({ action: mode === "correction" ? "대출 기록 정정" : "미연결 대출 보충", targetIds: mode === "correction" && existing ? [existing.loanId] : [bookId], payload });
    }}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="도서 · 기록 입력">
          <SelectField id="admin-supplement-book" label="도서" value={bookId} onChange={setBookId} options={[{ value: "", label: "도서 미선택" }, ...data.books.map((candidate) => ({ value: candidate.bookId, label: `${candidate.bookId} · ${candidate.title} · ${candidate.author}` }))]} helper="실물 점유 충돌과 현재 상태는 서버에서 재검사해야 합니다." />
          {book && <p className="break-words" role="status">현재 도서 · {book.bookId} · {book.title}</p>}
          <Field id="admin-supplement-number" label="학번" required value={studentNumber} onChange={setStudentNumber} pattern="[0-9]{9}" helper="9자리 문자열 · 회원 소유 자동 연결 없음" />
          <Field id="admin-supplement-name" label="이름" required value={name} onChange={setName} />
          <Field id="admin-supplement-time" label="확인한 실제 대출 시각" type="datetime-local" value={sourceTime} onChange={setSourceTime} required={mode === "supplemental"} helper={mode === "correction" ? "한국 시간 입력 표본 · 비워두면 시각 변경 초안에서 제외 · 과거 시각 검증 미연동" : "한국 시간 입력 표본 · 과거 시각 검증 미연동"} />
          <Field id="admin-supplement-due" label="반납 예정일" type="date" required value={dueDate} onChange={setDueDate} helper="관리자 보충의 확인한 기한 · 현재 최대 기간과 별개" />
        </Card>
        <Card title="사유 · 사진 선택">
          <Field id="admin-supplement-reason" label="보충 / 정정 사유" required value={reason} onChange={setReason} helper="사진을 선택하지 않으면 사진 없음의 사유도 남겨주세요." />
          <FilePicker id="admin-supplement-photo" label="사진 추가 · 선택" onChange={setFile} />
          <Notice title={mode === "correction" ? "정정 대상의 연결 관계 유지" : "미연결 보충 기록"}><p>{mode === "correction" ? "정정 입력만으로 기존 회원 연결을 생성·해제하거나 다른 회원에게 소유를 이전하지 않습니다." : "실물 점유에 포함되며 관리자가 관리합니다. 같은 학번으로 회원 소유·알림·권수·제재에 자동 귀속하지 않습니다."}</p></Notice>
          <Notice title="기록 정정의 범위"><p>선택한 기록의 입력만 대상으로 합니다. 다른 대출이나 프로필을 일괄 수정하거나 소유를 이전하지 않습니다.</p></Notice>
        </Card>
      </div>
      <Button type="submit" tone="primary" disabled={!book || (mode === "correction" && !existing)}>기록 내용 확인</Button>
    </form>
  </div>;
}

// R01 / SC06~07: all state changes here are local input/selection changes.
// onCommand is the explicit not-connected boundary, never an optimistic success.
export function AdminScreens(props: AdminScreensProps) {
  const selectedLoan = props.data.loans.find((loan) => loan.loanId === props.selectedLoanId);
  let content;
  switch (props.screen) {
    case "A01": content = <RecordScreen {...props} />; break;
    case "A02": content = selectedLoan
      ? <DetailScreen key={selectedLoan.loanId} loan={selectedLoan} onNavigate={props.onNavigate} onCommand={props.onCommand} />
      : <Notice title="대출 기록 미선택"><p>상세를 볼 기록을 선택해주세요.</p><Button onClick={() => props.onNavigate("A01")}>대출 기록으로</Button></Notice>; break;
    case "A03": content = <CatalogScreen {...props} />; break;
    case "A04": content = <PolicyScreen {...props} />; break;
    case "A05": content = <ExceptionScreen {...props} />; break;
    case "A06": content = <CleanupScreen {...props} />; break;
    case "A07": content = <AccessScreen {...props} />; break;
    case "A08": content = <SupplementalScreen key={props.selectedLoanId ?? "supplemental"} {...props} />; break;
    default: return null;
  }
  return <div className="min-w-0 space-y-5 break-words">
    <p className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300">관리 화면 예시 · {props.role === "master" ? "마스터" : "관리자"} 표시용 역할 · 인증·서버 조회·저장 미연동</p>
    {content}
  </div>;
}

export default AdminScreens;
