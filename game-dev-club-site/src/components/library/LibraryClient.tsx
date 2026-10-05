"use client";

import { useEffect, useRef, useState } from "react";
import { previewGateway } from "@/lib/library/preview-gateway";
import { screenTitles } from "@/lib/library/screen-contracts";
import type { PreviewCommand, PreviewMode, PreviewScenario, RequestState, ScreenId, ScreenNavigation } from "@/lib/library/screen-contracts";
import { MemberScreens } from "./MemberScreens";
import { AdminScreens } from "./AdminScreens";
import StateScreens from "./StateScreens";
import { Button, Notice, SelectField } from "./library-ui";
import styles from "./library.module.css";

const memberNav: readonly ScreenId[] = ["M01", "M04", "M08"];
const adminNav: readonly ScreenId[] = ["A01", "A03", "A04", "A05", "A06", "A08", "A07"];
const memberSamples: readonly ScreenId[] = ["M03", "M06", "S01", "S02", "S03", "S04", "S05", "S06", "S08"];
const adminSamples: readonly ScreenId[] = ["S04", "S10", "S11", "S12"];

// R01 only: preview mode is a display switch, never an ActorContext or authority proof.
export default function LibraryClient() {
  const [mode, setMode] = useState<PreviewMode>("member");
  const [screen, setScreen] = useState<ScreenId>("M01");
  const [memberScreen, setMemberScreen] = useState<ScreenId>("M01");
  const [adminScreen, setAdminScreen] = useState<ScreenId>("A01");
  const [scenario, setScenario] = useState<PreviewScenario>("normal");
  const [lastReadyScenario, setLastReadyScenario] = useState<PreviewScenario>("normal");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [requestState, setRequestState] = useState<RequestState>({ status: "idle" });
  const heading = useRef<HTMLHeadingElement>(null);
  const initialScreen = useRef(true);
  const returnFocusId = useRef<string | null>(null);

  const publicQuery = previewGateway.readPublicBooks(scenario);
  const ownQuery = previewGateway.readOwnLoans(scenario);
  const adminQuery = mode === "member" ? null : previewGateway.readAdminData(scenario);
  const cachedPublic = previewGateway.readPublicBooks(lastReadyScenario);
  const cachedOwn = previewGateway.readOwnLoans(lastReadyScenario);
  const cachedAdmin = mode === "member" ? null : previewGateway.readAdminData(lastReadyScenario);
  const books = cachedPublic.status === "ready" ? cachedPublic.data : [];
  const loans = cachedOwn.status === "ready" ? cachedOwn.data : [];
  const adminData = cachedAdmin?.status === "ready" ? cachedAdmin.data : null;
  const currentQuery = mode === "member" ? (screen === "M01" || screen === "M02" ? publicQuery : ownQuery) : adminQuery;
  const queryUnavailable = currentQuery?.status !== "ready";
  const memberView = screen.startsWith("M") || screen === "S07";
  const adminView = screen.startsWith("A");

  useEffect(() => {
    if (initialScreen.current) { initialScreen.current = false; return; }
    const requestedTarget = returnFocusId.current ? document.getElementById(returnFocusId.current) : null;
    const target = requestedTarget?.closest("[hidden]") ? null : requestedTarget;
    (target ?? heading.current)?.focus();
    returnFocusId.current = null;
  }, [screen, mode]);

  const navigate: ScreenNavigation = (nextScreen, selection) => {
    if (mode === "member" && (nextScreen.startsWith("A") || ["S09", "S10", "S11", "S12"].includes(nextScreen))) return;
    if (mode !== "member" && (nextScreen.startsWith("M") || ["S01", "S02", "S03", "S05", "S06", "S07", "S08"].includes(nextScreen))) return;
    if (screen === "S09" && nextScreen === "A02") returnFocusId.current = "library-proxy-return-trigger";
    if (selection?.bookId !== undefined) setSelectedBookId(selection.bookId);
    if (selection?.loanId !== undefined) setSelectedLoanId(selection.loanId);
    setScreen(nextScreen);
    if (nextScreen.startsWith("M") || nextScreen === "S07") setMemberScreen(nextScreen);
    if (nextScreen.startsWith("A")) setAdminScreen(nextScreen);
    setRequestState({ status: "idle" });
  };

  function request(command: PreviewCommand) {
    setRequestState(previewGateway.request(command));
    // A not-connected command does not select a success screen or mutate example DTOs.
  }

  function changeMode(value: string) {
    const nextMode = value as PreviewMode;
    setMode(nextMode); setScreen(nextMode === "member" ? "M01" : "A01");
    setMemberScreen("M01"); setAdminScreen("A01");
    setSelectedBookId(null); setSelectedLoanId(null); setRequestState({ status: "idle" });
  }

  return <section aria-label="도서관리 프론트 화면 예시" className={`${styles.preview} mt-8 space-y-6`}>
    <a href="#library-screen-title" className="sr-only focus:not-sr-only focus:inline-block focus:rounded focus:bg-dark-bg focus:p-3">현재 화면 본문으로 이동</a>
    <Notice title="프론트 껍데기 · 예시 데이터">화면 모드는 디자인 검토용입니다. 로그인이나 관리 권한을 발급하지 않습니다. 목록·입력·선택을 살펴볼 수 있으며 요청은 서버 미연동으로 끝납니다. 개인정보처럼 보이는 값도 모두 합성 예시입니다.</Notice>
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField id="library-preview-mode" label="화면 모드 · 실제 권한 아님" value={mode} onChange={changeMode} options={[
        { value: "member", label: "회원 화면 예시" }, { value: "admin", label: "관리자 화면 예시" }, { value: "master", label: "마스터 화면 예시" },
      ]} />
      <SelectField id="library-preview-scenario" label="조회 표시 표본" value={scenario} onChange={(value) => {
        const next = value as PreviewScenario;
        setScenario(next); if (next !== "loading" && next !== "error") setLastReadyScenario(next);
        setRequestState({ status: "idle" });
      }} options={[
        { value: "normal", label: "일반 예시" }, { value: "long", label: "긴 값 예시" }, { value: "empty", label: "정상 빈 목록" },
        { value: "loading", label: "조회 처리 중 표본" }, { value: "error", label: "조회 실패 표본" },
      ]} helper="표본 선택은 서버 조회를 실행하지 않습니다. 실패·처리 중에는 이전 입력을 보존합니다." />
    </div>
    <nav aria-label={mode === "member" ? "회원 화면" : "관리 화면"} className="flex flex-wrap gap-2">
      {(mode === "member" ? memberNav : adminNav).map((id) => <button key={id} type="button" aria-current={screen === id ? "page" : undefined} onClick={() => navigate(id)} className={`min-h-11 rounded-lg border px-4 py-2 ${screen === id ? "border-brand-green text-brand-green" : "border-gray-500 text-gray-200"}`}>{screen === id && "● "}{screenTitles[id]}</button>)}
    </nav>
    <details className="rounded-xl border border-gray-600 p-4">
      <summary className="cursor-pointer">결과·오류 상태 표본 보기 · 실제 처리 결과 아님</summary>
      <div className="mt-4 flex flex-wrap gap-2">{(mode === "member" ? memberSamples : adminSamples).map((id) => <Button key={id} tone="quiet" onClick={() => navigate(id)}>{id} · {screenTitles[id]} (표본)</Button>)}</div>
    </details>
    <div className="border-t border-gray-600 pt-6" aria-busy={currentQuery?.status === "loading"}>
      <h2 id="library-screen-title" ref={heading} tabIndex={-1} className="mb-5 rounded text-2xl font-bold">{screenTitles[screen]} <span className="text-base font-normal text-gray-300">· {screen} 예시</span></h2>
      {requestState.status !== "idle" && <div className="mb-5"><Notice title={requestState.status === "invalid" ? "입력 확인" : "서버 미연동"} tone={requestState.status === "invalid" ? "error" : "warning"}>{requestState.message}</Notice></div>}
      {currentQuery?.status === "loading" && <Notice title="조회 처리 중 표본">예시 상태입니다. 실제 조회 작업은 없습니다. 입력과 선택은 유지되며 결과를 확정하지 않습니다.</Notice>}
      {currentQuery?.status === "error" && <Notice title="조회 실패 표본" tone="error">{currentQuery.message} 입력과 선택은 보존합니다. 일반 예시를 다시 선택하면 돌아옵니다.</Notice>}
      {mode === "member" && <div hidden={!memberView || queryUnavailable}>
        <MemberScreens screen={memberScreen} books={books} loans={loans} selectedBookId={selectedBookId} selectedLoanId={selectedLoanId} onNavigate={navigate} onCommand={request} />
      </div>}
      {mode !== "member" && adminData && <div hidden={!adminView || queryUnavailable}>
        <AdminScreens key={mode} screen={adminScreen} data={adminData} selectedLoanId={selectedLoanId} role={mode} onNavigate={navigate} onCommand={request} />
      </div>}
      {!memberView && !adminView && <div hidden={queryUnavailable}><StateScreens key={`${screen}:${selectedLoanId ?? "none"}`} screen={screen} ownLoan={mode === "member" ? loans.find((loan) => loan.loanId === selectedLoanId) ?? null : null} adminLoan={adminData?.loans.find((loan) => loan.loanId === selectedLoanId) ?? null} returnScreen={mode === "member" ? "M04" : "A01"} onNavigate={navigate} onCommand={request} onResultQuery={(reference) => setRequestState(previewGateway.readResult(reference))} /></div>}
    </div>
  </section>;
}
