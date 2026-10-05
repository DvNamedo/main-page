"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { AdminLoanDTO, OwnLoanDTO } from "@/lib/library/screen-contracts";
import styles from "./library.module.css";

export function Button({ children, onClick, type = "button", disabled, tone = "secondary", id }: {
  children: ReactNode; onClick?: () => void; type?: "button" | "submit" | "reset";
  disabled?: boolean; tone?: "primary" | "secondary" | "quiet" | "danger"; id?: string;
}) {
  const colors = tone === "primary" ? "bg-brand-green text-dark-bg" : tone === "danger"
    ? "bg-red-950 text-red-100 border-red-400" : tone === "quiet"
      ? "bg-transparent text-gray-200" : "bg-light-bg text-white border-gray-500";
  return <button id={id} type={type} onClick={onClick} disabled={disabled} className={`min-h-11 rounded-lg border px-4 py-2 font-semibold ${colors} disabled:cursor-not-allowed disabled:opacity-50`}>{children}</button>;
}

export function Field({ id, label, value, onChange, type = "text", required, pattern, min, step, helper, error, disabled }: {
  id: string; label: string; value: string; onChange: (value: string) => void;
  type?: string; required?: boolean; pattern?: string; min?: string | number;
  step?: string | number; helper?: string; error?: string; disabled?: boolean;
}) {
  const describedBy = [helper && `${id}-helper`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <div className="min-w-0 space-y-2">
    <label htmlFor={id} className="block font-medium text-white">{label}{required && <span className="ml-2 text-sm text-gray-300">(필수)</span>}</label>
    <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} pattern={pattern} min={min} step={step} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className="w-full min-w-0 rounded-lg border border-gray-500 bg-dark-bg px-3 py-3 text-white disabled:opacity-50" />
    {helper && <p id={`${id}-helper`} className="text-sm text-gray-300">{helper}</p>}
    {error && <p id={`${id}-error`} className="text-sm text-red-200">오류 · {error}</p>}
  </div>;
}

export function SelectField({ id, label, value, onChange, options, helper, disabled }: {
  id: string; label: string; value: string; onChange: (value: string) => void;
  options: readonly { value: string; label: string }[]; helper?: string; disabled?: boolean;
}) {
  return <div className="min-w-0 space-y-2">
    <label htmlFor={id} className="block font-medium text-white">{label}</label>
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} aria-describedby={helper ? `${id}-helper` : undefined} className="w-full min-w-0 rounded-lg border border-gray-500 bg-dark-bg px-3 py-3 text-white">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    {helper && <p id={`${id}-helper`} className="text-sm text-gray-300">{helper}</p>}
  </div>;
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return <section className="min-w-0 space-y-4 rounded-xl border border-gray-600 bg-light-bg p-4 sm:p-6">
    {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}{children}
  </section>;
}

export function Notice({ title, children, tone = "info" }: { title: string; children: ReactNode; tone?: "info" | "warning" | "error" }) {
  const colors = tone === "error" ? "border-red-400 bg-red-950/40" : tone === "warning" ? "border-amber-400 bg-amber-950/30" : "border-brand-green bg-emerald-950/30";
  return <div role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} className={`space-y-2 rounded-xl border p-4 text-gray-100 ${colors}`}>
    <p className="font-semibold">{tone === "error" ? "오류 · " : tone === "warning" ? "주의 · " : "안내 · "}{title}</p>
    <div className="text-sm leading-relaxed">{children}</div>
  </div>;
}

export function FilePicker({ id, label, required, helper, error, onChange }: {
  id: string; label: string; required?: boolean; helper?: string; error?: string; onChange?: (file: File | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  return <div className="space-y-2">
    <label htmlFor={id} className="block font-medium">{label}{required && " (필수)"}</label>
    <input key={inputKey} id={id} type="file" accept="image/*" required={required} aria-invalid={error ? true : undefined} aria-describedby={`${id}-helper ${id}-selection${error ? ` ${id}-error` : ""}`} className="block w-full rounded border border-gray-500 p-3 text-sm" onChange={(event) => {
      const selected = event.target.files?.[0] ?? null;
      setFile(selected); onChange?.(selected);
    }} />
    <p id={`${id}-helper`} className="text-sm text-gray-300">{helper ?? "사진 파일 선택만 가능합니다. 이미지 처리·업로드는 미연동입니다."}</p>
    <p id={`${id}-selection`} role="status" className="break-words text-sm">{file ? `선택: ${file.name} · ${file.type || "형식 정보 없음"} · ${file.size.toLocaleString()} bytes` : "선택한 파일 없음"}</p>
    {error && <p id={`${id}-error`} className="text-sm text-red-200">오류 · {error}</p>}
    {file && <Button tone="quiet" onClick={() => { setFile(null); setInputKey((previous) => previous + 1); onChange?.(null); }}>파일 선택 해제</Button>}
  </div>;
}

export function StatusBadge({ label }: { label: string }) {
  return <span className="inline-block rounded border border-gray-400 px-2 py-1 text-sm text-gray-100">상태 · {label}</span>;
}

export function LoanIdentity({ loan, showBorrower = false }: { loan: OwnLoanDTO | AdminLoanDTO; showBorrower?: boolean }) {
  return <div className="space-y-2">
    <p className="text-sm text-gray-300">대출 {loan.loanId} · 도서 {loan.bookId}</p>
    <p className="break-words font-semibold">{loan.title}</p><p className="text-gray-300">{loan.author}</p>
    {showBorrower && "studentNumber" in loan && <p className="break-words">대출자 {loan.studentNumber} · {loan.borrowerName}</p>}
    <p>{loan.frozen ? "동결 전 예정일" : "반납 예정일"} {loan.dueLabel}</p><StatusBadge label={loan.statusLabel} />
  </div>;
}

export function RecordTable({ rows, selectedIds, selection, onSelect, caption, emptyMessage = "조건에 맞는 대출 기록이 없습니다." }: {
  rows: readonly AdminLoanDTO[]; selectedIds: readonly string[]; selection: "single" | "multiple";
  onSelect: (id: string) => void; caption: string; emptyMessage?: string;
}) {
  return <div className="min-w-0">
    <table className={styles.recordTable}>
      <caption className="mb-3 text-left text-sm text-gray-300">{caption} · 표시 {rows.length}건</caption>
      <thead><tr>{["선택", "도서 · 기록", "대출자", "기한 · 반납일", "상태", "사진"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map((loan) => <tr key={loan.loanId} className={selectedIds.includes(loan.loanId) ? styles.selectedRow : undefined}>
        <td data-label="선택"><label className="inline-flex min-h-11 items-center gap-2">
          <input type={selection === "single" ? "radio" : "checkbox"} name={selection === "single" ? "library-record-selection" : undefined} checked={selectedIds.includes(loan.loanId)} onChange={() => onSelect(loan.loanId)} aria-label={`대출 ${loan.loanId} · 도서 ${loan.bookId} ${loan.title} 선택`} />
          <span>{selectedIds.includes(loan.loanId) ? "● 선택됨" : "○ 미선택"}</span>
        </label></td>
        <td data-label="도서 · 기록"><p className="font-semibold">{loan.title}</p><p>{loan.author} · {loan.category}</p><p className="text-sm text-gray-300">대출 {loan.loanId} · 도서 {loan.bookId}</p></td>
        <td data-label="대출자"><p>{loan.studentNumber}</p><p>{loan.borrowerName}</p><p className="text-sm">{loan.linked ? "회원 연결 예시" : "회원 미연결"}</p></td>
        <td data-label="기한 · 반납일"><p>{loan.frozen ? "동결 전 예정일" : "반납 예정일"} {loan.dueLabel}</p><p className="text-sm">{loan.returnedAt ? `반납 ${loan.returnedAt}` : "반납 전"}</p></td>
        <td data-label="상태"><StatusBadge label={loan.statusLabel} /></td>
        <td data-label="사진">{loan.photoState}</td>
      </tr>)}</tbody>
    </table>
    {rows.length === 0 && <p className="rounded border border-gray-600 p-4" role="status">{emptyMessage}</p>}
  </div>;
}
