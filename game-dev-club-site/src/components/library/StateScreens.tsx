"use client";

import { useState } from "react";
import type { AdminLoanDTO, OwnLoanDTO, PreviewCommand, ScreenId, ScreenNavigation } from "@/lib/library/screen-contracts";
import { Button, Card, Field, LoanIdentity, Notice, SelectField, StatusBadge } from "./library-ui";

export interface StateScreensProps {
  screen: ScreenId;
  ownLoan: OwnLoanDTO | null;
  adminLoan: AdminLoanDTO | null;
  returnScreen: "M04" | "A01";
  onNavigate: ScreenNavigation;
  onCommand: (command: PreviewCommand) => void;
  onResultQuery: (reference: string) => void;
}

// Result samples are reachable only through the explicitly labelled sample menu.
export default function StateScreens({ screen, ownLoan, adminLoan, returnScreen, onNavigate, onCommand, onResultQuery }: StateScreensProps) {
  const [reasonCase, setReasonCase] = useState("hours");
  const [channelCase, setChannelCase] = useState("unconfirmed");
  const [renewCase, setRenewCase] = useState("qr");
  const [proxyReason, setProxyReason] = useState("");
  const [proxyChecked, setProxyChecked] = useState(false);
  const reasons: Record<string, string> = {
    hours: "허용 시간 밖입니다. 표시 표본이며 현재 시각을 판정하지 않습니다.",
    blocked: "금지일 표본입니다. 실제 달력 판정은 미연동입니다.",
    lookup: "조건 조회 실패 · 대출 불가나 빈 목록으로 확정하지 않습니다.",
    quota: "동시 대출 한도에 도달한 상태 표본입니다.",
    overdue: "연체 기록이 있는 상태 표본입니다. 최종 제재 판정은 보류입니다.",
    penalty: "제재 종료 시각 2026.10.18 14:32 KST · 날짜와 시각을 함께 표시하는 표본입니다.",
  };
  const sample = <Notice title="독립 상태 표본">예시 상태를 열람 중입니다. 현재 입력의 실제 처리 결과가 아니며 업무 판정·저장·발송을 수행하지 않습니다.</Notice>;

  if (screen === "S01") return <div className="space-y-4">{sample}<Card title="검색 결과 0권"><p>조회가 완료됐지만 조건에 맞는 책이 없는 표본입니다. 조회 실패와 구별합니다.</p><Button onClick={() => onNavigate("M01")}>책 찾기로 돌아가기</Button></Card></div>;
  if (screen === "S02") return <div className="space-y-4">{sample}<SelectField id="state-reason-case" label="제한 사유 표본" value={reasonCase} onChange={setReasonCase} options={[
    { value: "hours", label: "허용 시간 밖" }, { value: "blocked", label: "금지일" }, { value: "lookup", label: "조회 실패" },
    { value: "quota", label: "대출 한도" }, { value: "overdue", label: "연체" }, { value: "penalty", label: "제재 종료 시각" },
  ]} /><Notice title="처리 제한 표본" tone={reasonCase === "lookup" ? "error" : "warning"}>{reasons[reasonCase]}</Notice><Button onClick={() => onNavigate("M01")}>책 찾기로 돌아가기</Button></div>;
  if (screen === "S03") return <div className="space-y-4">{sample}<Notice title="사진 확인 실패 표본" tone="error">사진 선택이 필요하거나 사진 처리에 실패한 상황의 문구 표본입니다. 실제 이미지 검사는 하지 않았습니다. 대출 입력 초안은 같은 화면 세션에 보존합니다.</Notice><Button onClick={() => onNavigate("M02")}>대출 입력으로 돌아가기</Button></div>;
  if (screen === "S04") return <div className="space-y-4">{sample}<Card title="확인 중 · 예시 상태"><p>응답이 불명확할 때 완료나 실패로 단정하지 않습니다. 현재 껍데기는 실제 요청 ID나 처리 작업이 없습니다.</p><Button onClick={() => onResultQuery("SAMPLE-OUTCOME")}>결과 조회 연결 확인</Button><p className="text-sm text-gray-300">조회 경계 미연동 · 명령을 다시 제출하지 않습니다.</p><Button onClick={() => onNavigate(returnScreen)}>원래 목록으로 돌아가기</Button></Card></div>;
  if (screen === "S05") return <div className="space-y-4">{sample}<Card title="연장 완료 표본">{ownLoan?.loanId === "L01" ? <LoanIdentity loan={ownLoan} /> : <p>고정 결과 표본 · 대출 L01 / 도서 B01 · 게임 설계의 기초 · 예시 저자 A</p>}<p>이전 예정일 2026.10.17 → 새 예정일 2026.10.20 (고정 예시)</p><p>금지일·동결 처리 의미는 기존 보류 계약을 유지합니다. 실제 기한은 변경되지 않았습니다.</p><Button onClick={() => onNavigate("M04")}>내 대출로 돌아가기</Button></Card></div>;
  if (screen === "S06") return <div className="space-y-4">{sample}<SelectField id="state-channel-case" label="알림 채널 상태 표본" value={channelCase} onChange={setChannelCase} options={[
    { value: "unconfirmed", label: "메일 소유 미확인" }, { value: "denied", label: "Push 권한 거부" }, { value: "unsupported", label: "Push 미지원" },
  ]} /><Card title="채널별 표시"><p>이메일 · {channelCase === "unconfirmed" ? "소유 확인 전 · 발송하지 않음" : "예시 설정 · 발송 미연동"}</p><p>Push · {channelCase === "denied" ? "권한 거부 표본" : channelCase === "unsupported" ? "지원하지 않는 환경 표본" : "미확인 표본"}</p><p>실제 브라우저 권한 요청이나 알림은 발생하지 않습니다.</p><Button onClick={() => onNavigate("M08")}>알림 설정으로 돌아가기</Button></Card></div>;
  if (screen === "S08") return <div className="space-y-4">{sample}<SelectField id="state-renew-case" label="연장 제한 표본" value={renewCase} onChange={setRenewCase} options={[
    { value: "qr", label: "QR 확인 실패" }, { value: "overdue", label: "연체 또는 숨김 도서" }, { value: "limit", label: "최대 연장 횟수" },
  ]} /><Notice title="연장 조건 표본" tone="warning">{renewCase === "qr" ? "운영 QR을 확인할 수 없는 상태 표본입니다. 실제 QR 검증은 미연동입니다." : renewCase === "overdue" ? "연체 또는 숨김 상태의 연장 제한 표본입니다. 신규 대출 비활성과 구분합니다." : "최대 연장 횟수 제한 표본입니다. 실제 횟수 판정은 미연동입니다."}</Notice><Button onClick={() => onNavigate("M07")}>기한 연장으로 돌아가기</Button></div>;
  if (screen === "S09") return <div className="space-y-4">
    <Notice title="대리 반납 확인 · 서버 미연동">현재 선택 기록의 확인 초안입니다. 확인해도 실제 반납 처리나 자료 변경은 발생하지 않습니다.</Notice>
    <Card title="현재 확인 대상">{adminLoan ? <LoanIdentity loan={adminLoan} showBorrower /> : <p>현재 선택 기록이 없습니다. 대출 기록 상세에서 대상을 선택해주세요.</p>}</Card>
    <Field id="proxy-return-reason" label="대리 반납 사유" value={proxyReason} onChange={setProxyReason} required helper="선택 기록에 대한 입력 초안이며 저장하지 않습니다." />
    <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={proxyChecked} onChange={(event) => setProxyChecked(event.target.checked)} />실물을 돌려놓은 것을 확인했습니다.</label>
    <p className="text-sm text-gray-300">{!adminLoan ? "선택 대상이 없어 요청할 수 없습니다." : !proxyReason.trim() || !proxyChecked ? "사유와 실물 확인을 모두 입력하면 미연동 요청 경계를 확인할 수 있습니다." : "확인 대상의 서버 버전·권한·경합 검사는 미연동입니다."}</p>
    <div className="flex flex-wrap gap-3"><Button tone="danger" disabled={!adminLoan || !proxyReason.trim() || !proxyChecked} onClick={() => {
      if (adminLoan) onCommand({ action: "proxy-return", targetIds: [adminLoan.loanId], payload: { reason: proxyReason.trim(), physicalConfirmation: proxyChecked } });
    }}>대리 반납 요청 · 미연동</Button><Button onClick={() => { setProxyChecked(false); onNavigate("A02"); }}>취소 · 상세로 돌아가기</Button></div>
  </div>;
  if (screen === "S10") return <div className="space-y-4">{sample}<Card title="정책 부분 적용 표본"><p>변경 초안 · 대출 기간 20일 → 14일</p><p>정책값 · 확인 중 표본 / 대응 기록 · 적용 실패 표본 / 활성 정책 포인터 · 이전 정책 유효 표본</p><p>미확정 단계는 결과 조회 후 판단하며 자동 재실행하지 않습니다.</p><p>실제 정책은 변경하지 않았습니다. 정책 반영·경합 확인은 서버 책임입니다.</p><Button onClick={() => onResultQuery("SAMPLE-POLICY")}>결과 조회 연결 확인</Button><Button onClick={() => onNavigate("A04")}>운영 정책으로 돌아가기</Button></Card></div>;
  if (screen === "S11") return <div className="space-y-4">{sample}<Card title="항목별 결과 · 예시 작업 SAMPLE-R01">
    {[
      { loanId: "L01", bookId: "B01", title: "게임 설계의 기초", state: "확정 표본" },
      { loanId: "L02", bookId: "B02", title: "플레이와 이야기", state: "실패 표본 · 변경하지 않음" },
      { loanId: "L03", bookId: "B03", title: "게임 프로그래밍 입문", state: "확인 중 표본 · 완료 여부 미확정" },
    ].map((item) => <div key={item.loanId} className="space-y-2 rounded border border-gray-600 p-3"><p>대출 {item.loanId} · 도서 {item.bookId} · {item.title}</p><StatusBadge label={item.state} /><p>효과 · 기한 조정 표본 · {item.loanId === "L01" ? "확정된 새 기한 표본 · 남은 처리 없음" : item.loanId === "L02" ? "기한 변경 없음 · 재검토 필요" : "기한 변경 여부 미확정 · 결과 재조회 필요"}</p></div>)}
    <p>현재 선택·건수와 연결하지 않은 독립 결과 표본입니다.</p><Button onClick={() => onResultQuery("SAMPLE-R01")}>결과 조회 연결 확인</Button><Button onClick={() => onNavigate("A05")}>예외 · 제재로 돌아가기</Button></Card></div>;
  if (screen === "S12") return <div className="space-y-4">{sample}<Card title="활성 기록 포함 확인 표본"><p>범위 · 기록과 사진 · 선택 2건 · 활성 1건</p><p>대출 L11 / 도서 B01 · 반납 완료 표본</p><p>대출 L02 / 도서 B02 · 활성 기록 표본</p><p>이 표본의 대상은 고정 예시입니다. 현재 A06 선택의 확인은 자료 정리 화면 안의 확인 패널을 사용합니다.</p><Button onClick={() => onNavigate("A06")}>현재 자료 정리로 돌아가기</Button></Card></div>;
  return null;
}
