"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { OwnLoanDTO, PreviewCommand, PublicBookDTO, ScreenId, ScreenNavigation } from "@/lib/library/screen-contracts";
import { Button, Card, Field, FilePicker, LoanIdentity, Notice, SelectField, StatusBadge } from "./library-ui";

export interface MemberScreensProps {
  screen: ScreenId;
  books: readonly PublicBookDTO[];
  loans: readonly OwnLoanDTO[];
  selectedBookId: string | null;
  selectedLoanId: string | null;
  onNavigate: ScreenNavigation;
  onCommand: (command: PreviewCommand) => void;
}

// R01 / SC01, SC03, SC05~07: local display drafts only. No business approval or storage.
export function MemberScreens({ screen, books, loans, selectedBookId, selectedLoanId, onNavigate, onCommand }: MemberScreensProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [studentNumber, setStudentNumber] = useState("202600001");
  const [borrowerName, setBorrowerName] = useState("회원 예시");
  const [dueDate, setDueDate] = useState("2026-10-17");
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [physicalConfirmation, setPhysicalConfirmation] = useState(false);
  const [qrDraft, setQrDraft] = useState("");
  const [email, setEmail] = useState("member@example.com");
  const [emailSelected, setEmailSelected] = useState(false);
  const [browserSelected, setBrowserSelected] = useState(false);
  const selectedBook = books.find((book) => book.bookId === selectedBookId);
  const selectedLoan = loans.find((loan) => loan.loanId === selectedLoanId);
  const activeLoans = loans.filter((loan) => loan.returnedAt === null);
  const returnedLoans = loans.filter((loan) => loan.returnedAt !== null);

  useEffect(() => {
    setPhysicalConfirmation(false);
    setErrors({});
  }, [screen, selectedLoanId, selectedBookId]);

  useEffect(() => {
    // The input leaves the DOM when switching screens; do not keep an invisible selection.
    setPhoto(null);
  }, [screen, selectedBookId]);

  function showErrors(nextErrors: Record<string, string>) {
    setErrors(nextErrors);
    const firstId = Object.keys(nextErrors)[0];
    if (firstId) document.getElementById(firstId)?.focus();
  }

  function clearError(id: string) {
    setErrors((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }

  function submitBorrow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!/^[0-9]{9}$/.test(studentNumber)) nextErrors["member-student-number"] = "학번은 9자리 숫자로 입력해주세요.";
    if (!borrowerName.replace(/\s/g, "")) nextErrors["member-borrower-name"] = "이름을 입력해주세요.";
    if (!photo) nextErrors["member-evidence-photo"] = "선택한 책의 사진 한 장을 선택해주세요.";
    if (!dueDate) nextErrors["member-due-date"] = "반납 예정일을 선택해주세요.";
    showErrors(nextErrors);
    if (Object.keys(nextErrors).length || !selectedBook) return;
    onCommand({ action: "borrow", targetIds: [selectedBook.bookId], payload: {
      studentNumber, borrowerName: borrowerName.replace(/\s/g, ""), dueDate, photoSelected: true,
    } });
  }

  function submitNotifications(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const emailInput = event.currentTarget.querySelector<HTMLInputElement>("#member-email");
    if (emailSelected && !email.trim()) nextErrors["member-email"] = "이메일 채널을 선택했다면 주소를 입력해주세요.";
    else if (email.trim() && emailInput?.validity.typeMismatch) nextErrors["member-email"] = "이메일 주소 형식을 확인해주세요.";
    showErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onCommand({ action: "update-notifications", payload: { email, emailSelected, browserSelected } });
  }

  if (screen === "M01") {
    const search = query.trim().toLocaleLowerCase();
    const visibleBooks = books.filter((book) => (!category || book.category === category) &&
      (!search || `${book.title} ${book.author}`.toLocaleLowerCase().includes(search)));
    const categories = Array.from(new Set(books.map((book) => book.category)));
    return <div className="space-y-5">
      <p className="text-gray-300">동방에서 함께 읽고, 함께 만드는 책.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="member-book-search" label="책 검색" value={query} onChange={setQuery} helper="제목 또는 저자로 예시 목록을 검색합니다." />
        <SelectField id="member-book-category" label="분야" value={category} onChange={setCategory} options={[{ value: "", label: "전체" }, ...categories.map((value) => ({ value, label: value }))]} />
      </div>
      <p role="status" className="text-sm text-gray-300">지금 빌릴 수 있는 책 예시 · 검색 결과 {visibleBooks.length}권</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleBooks.map((book) => <Card key={book.bookId}>
          <div className="flex min-w-0 items-start gap-4">
            <div aria-hidden="true" className="shrink-0 rounded-xl bg-emerald-950/40 p-3 text-xs text-brand-green">EDGE<br /><span className="text-gray-300">BOOK</span></div>
            <div className="min-w-0 space-y-2">
              <p className="text-sm text-brand-green">{book.category}</p>
              <h3 className="break-words text-lg font-semibold">{book.title}</h3>
              <p className="break-words text-sm text-gray-300">{book.author}</p>
              <p className="text-sm text-gray-300">도서 {book.bookId}</p>
            </div>
          </div>
          <Button tone="quiet" onClick={() => onNavigate("M02", { bookId: book.bookId })}><span className="sr-only">{book.title} · 도서 {book.bookId} </span>이 책의 대출 입력 →</Button>
        </Card>)}
      </div>
      {visibleBooks.length === 0 && <Notice title="조건에 맞는 책이 없습니다">현재 검색어와 분야에 맞는 예시 자료가 없습니다. 조회 실패와는 다른 정상 빈 결과입니다.</Notice>}
      <Button tone="quiet" onClick={() => { setQuery(""); setCategory(""); }}>검색 조건 초기화</Button>
    </div>;
  }

  if (screen === "M02") return <div className="space-y-5">
    <p className="text-gray-300">한 권의 책과 사진을 함께 기록하는 입력 화면입니다.</p>
    {selectedBook ? <Notice title="선택한 책"><p>도서 {selectedBook.bookId} · {selectedBook.title}</p><p>{selectedBook.author} · {selectedBook.category}</p></Notice> : <Notice title="선택한 책이 없습니다" tone="warning">책 찾기에서 대상 도서를 먼저 선택해주세요.</Notice>}
    <form noValidate onSubmit={submitBorrow} className="space-y-5">
      {Object.keys(errors).length > 0 && <Notice title="입력을 확인해주세요" tone="error">표시된 필드를 수정해주세요. 다른 입력은 유지됩니다.</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="member-student-number" label="학번" value={studentNumber} onChange={(value) => { setStudentNumber(value); clearError("member-student-number"); }} required pattern="[0-9]{9}" helper="9자리 숫자 · 관리자 기록 확인용입니다. 예시 초기값은 운영 프로필이 아닙니다." error={errors["member-student-number"]} />
        <Field id="member-borrower-name" label="이름" value={borrowerName} onChange={(value) => { setBorrowerName(value); clearError("member-borrower-name"); }} required helper="공백을 제외한 이름을 요청 초안에 사용합니다. 본인 인증 수단이 아닙니다." error={errors["member-borrower-name"]} />
      </div>
      <Card title="책 사진">
        <FilePicker key={selectedBookId ?? "no-book"} id="member-evidence-photo" label="선택한 책이 보이는 사진 한 장" required onChange={(file) => { setPhoto(file); clearError("member-evidence-photo"); }} helper="10MiB 이하라는 기존 입력 안내입니다. 현재는 파일 선택 상태만 다루며 내용·용량·형식 검사, 이미지 처리와 업로드는 미연동입니다." error={errors["member-evidence-photo"]} />
      </Card>
      <Field id="member-due-date" label="반납 예정일" value={dueDate} onChange={(value) => { setDueDate(value); clearError("member-due-date"); }} type="date" required helper="최종 허용 날짜·기간·금지일 판정은 서버 연동 뒤 수행합니다." error={errors["member-due-date"]} />
      <Notice title="기한 안내">선택한 날의 23:59 마지막 분까지 유효하고 다음 날 00:00부터 연체로 처리하는 기존 규칙입니다. 이 화면의 입력이 실제 대출을 허용한다는 뜻은 아닙니다.</Notice>
      {!selectedBook && <p className="text-sm text-gray-300">도서를 선택하기 전에는 요청 내용을 확인할 수 없습니다.</p>}
      <div className="flex flex-wrap gap-3"><Button type="submit" tone="primary" disabled={!selectedBook}>대출 요청 내용 확인</Button><Button onClick={() => onNavigate("M01")}>책 목록으로</Button></div>
    </form>
  </div>;

  if (screen === "M03") {
    const sampleLoan = activeLoans[0];
    return <div className="space-y-5">
      <Notice title="대출 결과 예시">완료 표현을 검토하는 독립 표본입니다. 방금 입력한 도서나 요청의 저장 결과가 아닙니다.</Notice>
      {sampleLoan ? <Card title="대출 완료 표본"><LoanIdentity loan={sampleLoan} /><p className="text-sm">기한 날짜의 23:59 마지막 분까지 · 한국 시간</p></Card> : <Notice title="대출 결과 표본 없음">현재 예시 자료에는 결과에 사용할 대출이 없습니다.</Notice>}
      <Notice title="이 브라우저에서 이어서 이용해요">운영 서비스의 쿠키가 사라지면 이전 내 대출에 다시 접근할 수 없습니다. 책과 기록은 남아 있으며 학번·이름으로 자동 복구하지 않습니다. 현재 껍데기는 쿠키를 발급하지 않습니다.</Notice>
      <Notice title="연체 안내">기한이 지난 미반납 도서나 유효한 반납 제재가 있으면 새 대출이 제한됩니다. 실제 판정은 미연동입니다.</Notice>
      <div className="flex flex-wrap gap-3"><Button tone="primary" onClick={() => onNavigate("M04")}>내 대출 보기</Button><Button onClick={() => onNavigate("M08")}>반납 알림 설정</Button><Button tone="quiet" onClick={() => onNavigate("M01")}>나중에 설정 · 책 찾기</Button></div>
    </div>;
  }

  if (screen === "M04") return <div className="space-y-5">
    <p className="text-gray-300">이 브라우저의 본인 조회를 표현하는 합성 예시입니다. 실제 소유 검사는 미연동입니다.</p>
    <div className="flex flex-wrap gap-3"><StatusBadge label={`대출 중 ${activeLoans.length}건`} /><Button onClick={() => onNavigate("S07")}>반납 이력</Button><Button onClick={() => onNavigate("M08")}>알림 설정</Button></div>
    <div className="grid gap-4 lg:grid-cols-2">{activeLoans.map((loan) => <Card key={loan.loanId}>
      <LoanIdentity loan={loan} />
      <p className="text-sm">{loan.frozen ? "동결 전 예정일" : "반납 예정일"} · {loan.dueDate}</p>
      {selectedLoanId === loan.loanId && <p className="text-brand-green" role="status">● 현재 선택한 대출</p>}
      {loan.frozen && <Notice title="날짜 진행 동결 표본">기한 진행이 잠시 멈췄습니다. 이미 발생한 연체는 없어지지 않습니다. 최종 기한을 이 화면에서 계산하지 않습니다.</Notice>}
      <div className="flex flex-wrap gap-3">
        <Button tone="primary" onClick={() => onNavigate("M05", { loanId: loan.loanId })}><span className="sr-only">대출 {loan.loanId} </span>실물을 돌려놓고 반납</Button>
        <Button onClick={() => onNavigate("M07", { loanId: loan.loanId })}><span className="sr-only">대출 {loan.loanId} </span>연장 조건 확인</Button>
      </div>
    </Card>)}</div>
    {activeLoans.length === 0 && <Notice title="현재 대출 예시 없음">현재 연결된 대출 예시가 없습니다. 실제 쿠키 유실과 정상 0건은 서버 연동 후 구분하며 학번·이름으로 다른 기록을 연결하지 않습니다.</Notice>}
  </div>;

  if (screen === "M05") return <div className="space-y-5">
    <p className="text-gray-300">책을 먼저 동방에 돌려놓아 주세요.</p>
    {selectedLoan ? <Card title="반납할 대상"><LoanIdentity loan={selectedLoan} /></Card> : <Notice title="선택한 대출이 없습니다" tone="warning">내 대출에서 반납할 한 건을 선택해주세요.</Notice>}
    <Notice title="실물 반납 확인">선택한 책을 원래 자리에 돌려놓았는지 확인해주세요. 껍데기의 확인은 실제 반납 처리나 실물 확인 증명을 만들지 않습니다.</Notice>
    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-500 p-3"><input type="checkbox" checked={physicalConfirmation} onChange={(event) => setPhysicalConfirmation(event.target.checked)} disabled={!selectedLoan} />책을 동방에 돌려놓았습니다.</label>
    <Notice title="완료 후에는 직접 취소할 수 없어요">운영 서비스에서는 잘못 표시한 경우 관리자에게 문의해야 합니다. 최종 이용 시간·반납 금지일·연체 판정은 미연동입니다.</Notice>
    {(!selectedLoan || !physicalConfirmation) && <p className="text-sm text-gray-300">대출 대상과 실물 반환 확인이 있어야 요청 내용을 확인할 수 있습니다.</p>}
    <div className="flex flex-wrap gap-3"><Button tone="primary" disabled={!selectedLoan || !physicalConfirmation} onClick={() => { if (selectedLoan) onCommand({ action: "return", targetIds: [selectedLoan.loanId], payload: { physicalConfirmation } }); }}>반납 요청 내용 확인</Button><Button onClick={() => onNavigate("M04")}>아직 반납하지 않았어요</Button></div>
  </div>;

  if (screen === "M06") {
    const sampleLoan = returnedLoans[0];
    return <div className="space-y-5">
      <Notice title="반납 결과 예시">완료 표현을 검토하는 독립 표본입니다. 반납 요청이 실행되거나 선택한 대출의 상태가 바뀐 결과가 아닙니다.</Notice>
      {sampleLoan ? <Card title="반납 완료 표본"><LoanIdentity loan={sampleLoan} /><p className="break-words">반납 처리 시각 표본 · {sampleLoan.returnedAt}</p></Card> : <Notice title="반납 결과 표본 없음">현재 예시 자료에는 보관 중인 반납 기록이 없습니다.</Notice>}
      <Notice title="이 책의 새 알림은 중단됩니다">운영 반납이 확정된 뒤 적용하는 안내입니다. 이미 전달 중인 알림은 도착할 수 있습니다. 현재 실제 발송이나 중단은 수행하지 않습니다.</Notice>
      <div className="flex flex-wrap gap-3"><Button tone="primary" onClick={() => onNavigate("M04")}>내 대출로 돌아가기</Button><Button onClick={() => onNavigate("M01")}>다른 책 찾기</Button></div>
    </div>;
  }

  if (screen === "M07") return <div className="space-y-5">
    <p className="text-gray-300">동방 QR 확인과 회원 연장 입력을 표현하는 화면입니다.</p>
    {selectedLoan ? <Card title="연장할 대상"><LoanIdentity loan={selectedLoan} /><p>{selectedLoan.frozen ? "동결 전 예정일" : "현재 반납 예정일"} · {selectedLoan.dueDate}</p><p>현재 성공 연장 횟수 표본 · {selectedLoan.renewalCount}회</p></Card> : <Notice title="선택한 대출이 없습니다" tone="warning">내 대출에서 연장할 한 건을 선택해주세요.</Notice>}
    <Notice title="연장 날짜 미리보기 경계">기간 예시 +3일이며 실제 연장 가능 여부나 새 기한은 계산하지 않습니다. 기존 기한과 현재 정책을 서버에서 검증한 뒤 확정해야 합니다.</Notice>
    <Card title="동방 QR 입력">
      <Field id="member-qr-draft" label="QR 확인용 예시 문구" value={qrDraft} onChange={setQrDraft} helper="운영 QR 대신 예시 문구를 입력하세요. 입력은 확인 완료·10분 유효 시간·권한을 만들지 않습니다." />
      <StatusBadge label="QR 확인 미연동" />
      <Button disabled={!selectedLoan} onClick={() => { if (selectedLoan) onCommand({ action: "check-qr", targetIds: [selectedLoan.loanId], payload: { qrDraft } }); }}>QR 확인 요청 내용 보기</Button>
    </Card>
    <Notice title="연장 조건">대상 책의 연체·숨김 여부, 이용 시간과 현재 연장 횟수 상한을 확인하는 기존 규칙입니다. 동결 중 비연체 대출은 연장해도 동결이 유지됩니다. 현재 화면은 이 조건을 최종 판정하지 않습니다.</Notice>
    <Notice title="연장일이 반납 금지일이면" tone="warning">계산된 기한은 유지하고 해당 날짜에 회원 반납은 할 수 없다는 기존 안내입니다. 기간 확대·동결과 결합한 미확정 업무 판정은 보류되어 있습니다.</Notice>
    <div className="flex flex-wrap gap-3"><Button tone="primary" disabled={!selectedLoan} onClick={() => { if (selectedLoan) onCommand({ action: "renew", targetIds: [selectedLoan.loanId], payload: { qrInputPresent: Boolean(qrDraft.trim()) } }); }}>연장 요청 내용 확인</Button><Button onClick={() => onNavigate("M04")}>내 대출로</Button></div>
  </div>;

  if (screen === "M08") return <div className="space-y-5">
    <p className="text-gray-300">채널별 수신 선택과 주소 입력 초안입니다.</p>
    <Notice title="알림을 받지 않아도 대출할 수 있어요">현재 선택은 저장되지 않는 예시입니다. 운영 서비스의 수신 설정은 본인 프로필에 연결되며 실제 소유 확인과 저장은 미연동입니다.</Notice>
    <form noValidate onSubmit={submitNotifications} className="space-y-5">
      {errors["member-email"] && <Notice title="주소를 확인해주세요" tone="error">이메일 입력을 수정해주세요. 채널 선택과 다른 입력은 유지됩니다.</Notice>}
      <Field id="member-email" label="이메일" value={email} onChange={(value) => { setEmail(value); clearError("member-email"); }} type="email" required={emailSelected} helper="새 주소는 실제 서버 소유 확인이 필요합니다. 형식 검사만으로 확인 완료를 표시하지 않습니다." error={errors["member-email"]} />
      <Card title="이메일 수신">
        <StatusBadge label="이메일 소유 확인 미연동" />
        <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={emailSelected} onChange={(event) => setEmailSelected(event.target.checked)} />이메일 채널 사용 선택 초안</label>
        <Button onClick={() => onCommand({ action: "verify-email", payload: { email } })}>이메일 소유 확인 요청 내용 보기</Button>
        <Button tone="quiet" onClick={() => { setEmail(""); clearError("member-email"); }}>주소 입력 지우기</Button>
      </Card>
      <Card title="브라우저 알림">
        <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={browserSelected} onChange={(event) => setBrowserSelected(event.target.checked)} />브라우저 채널 사용 선택 초안</label>
        <StatusBadge label="지원·권한·구독 미확인" />
        <p className="text-sm text-gray-300">실제 권한 요청이나 구독을 실행하지 않습니다. 선택만으로 수신 가능 상태가 되지 않습니다.</p>
      </Card>
      <Notice title="수신 해제와 주소 변경">이메일 채널을 끄는 것과 주소 입력을 지우는 것은 별개입니다. 새 주소에는 기존 소유 확인이 승계되지 않습니다. 현재 proof·메일·Push는 생성하거나 발송하지 않습니다.</Notice>
      <div className="flex flex-wrap gap-3"><Button type="submit" tone="primary">알림 설정 요청 내용 확인</Button><Button onClick={() => onNavigate("M04")}>나중에 설정 · 내 대출로</Button></div>
    </form>
  </div>;

  if (screen === "S07") return <div className="space-y-5">
    <p className="text-gray-300">본인 조회 범위의 보관 중 반납 기록 예시입니다.</p>
    <p role="status">반납 이력 예시 · {returnedLoans.length}건</p>
    <div className="grid gap-4 lg:grid-cols-2">{returnedLoans.map((loan) => <Card key={loan.loanId}><LoanIdentity loan={loan} /><p className="break-words">반납 처리 · {loan.returnedAt}</p></Card>)}</div>
    {returnedLoans.length === 0 && <Notice title="반납 이력 예시 없음">현재 표시할 반납 기록 예시가 없습니다. 삭제된 원본의 별도 개인정보 이력을 만들지 않습니다.</Notice>}
    <Notice title="내 대출이 비어 있으면">운영 서비스에서 쿠키가 없거나 연결된 기록이 없을 수 있습니다. 학번·이름으로 다른 기록을 찾아 연결하지 않습니다. 실제 접근 검사는 미연동입니다.</Notice>
    <Button tone="primary" onClick={() => onNavigate("M04")}>대출 중인 책</Button>
  </div>;

  return null;
}
