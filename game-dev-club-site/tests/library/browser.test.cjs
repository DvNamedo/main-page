const { describe, test, before, beforeEach, afterEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const playwrightPath = process.env.LIBRARY_PLAYWRIGHT_PATH || 'playwright';
const { chromium } = require(playwrightPath);
const { expect } = require(playwrightPath === 'playwright' ? 'playwright/test' : path.join(playwrightPath, 'test.js'));
const baseURL = process.env.LIBRARY_BASE_URL || 'http://127.0.0.1:3100';
const output = path.resolve('.library-test-output');
const onePixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6ZaAAAAAASUVORK5CYII=', 'base64');
let browser, context, page, pageErrors, externalAttempts;
const observations = [];

async function screen(id) { await expect(page.locator('#library-screen-title')).toContainText(`${id} 예시`); }
async function mode(value) { await page.locator('#library-preview-mode').selectOption(value); await screen(value === 'member' ? 'M01' : 'A01'); }
async function scenario(value) { await page.locator('#library-preview-scenario').selectOption(value); }
async function nav(label, admin = false) {
  await page.getByRole('navigation', { name: admin ? '관리 화면' : '회원 화면' }).getByRole('button', { name: new RegExp(label) }).click();
}
async function sample(id) {
  const details = page.locator('details');
  if (await details.getAttribute('open') === null) await details.locator('summary').click();
  await details.getByRole('button', { name: new RegExp(`^${id} ·`) }).click(); await screen(id);
}
async function disconnected() {
  await expect(page.getByText('서버 미연동 · 요청을 전송하지 않았으며 자료를 변경하지 않았습니다.', { exact: true })).toBeVisible();
}
async function borrow(bookId = 'B05') {
  await page.getByRole('button', { name: new RegExp(`도서 ${bookId} .*대출 입력`) }).click(); await screen('M02');
}
async function loanAction(id, action) {
  await nav('내 대출');
  await page.getByRole('button', { name: new RegExp(`대출 ${id} ${action}`) }).click();
}
async function adminDetail(id = 'L02') {
  await mode('admin');
  await page.getByRole('radio', { name: new RegExp(`^대출 ${id} ·`) }).check();
  await page.getByRole('button', { name: '선택한 기록 상세 보기', exact: true }).click(); await screen('A02');
}

describe('Library frontend: synthetic member and administrator UC scenarios', { concurrency: false }, () => {
  before(async () => {
    fs.mkdirSync(output, { recursive: true });
    browser = await chromium.launch({ channel: process.env.LIBRARY_BROWSER_CHANNEL || 'msedge', headless: true });
    const playwrightVersion = require(playwrightPath === 'playwright' ? 'playwright/package.json' : path.join(playwrightPath, 'package.json')).version;
    console.log(`Browser: ${browser.version()} / Playwright ${playwrightVersion}`);
  });
  beforeEach(async () => {
    pageErrors = []; externalAttempts = [];
    context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(baseURL).origin || ['data:', 'blob:'].includes(url.protocol)) await route.continue();
      else { externalAttempts.push(url.origin); await route.abort(); }
    });
    page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.setDefaultTimeout(12000);
    await page.goto(`${baseURL}/library`, { waitUntil: 'load' }); await screen('M01');
  });
  afterEach(async (t) => {
    const name = t.name.replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 120);
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
    observations.push({ case: t.name, viewport: page.viewportSize(), pageErrors: [...pageErrors], blockedExternalOrigins: [...new Set(externalAttempts)] });
    await context.close();
    assert.deepEqual(pageErrors, [], 'The tested page must not raise uncaught browser errors');
  });
  after(async () => {
    fs.writeFileSync(path.join(output, 'browser-observations.json'), JSON.stringify({ browser: browser?.version(), baseURL, observations }, null, 2));
    await browser?.close();
  });

  test('TC-SHELL-01 public search AND category and private-field exclusion', async () => {
    await page.locator('#member-book-search').fill('예시 저자 B');
    await page.locator('#member-book-category').selectOption('개발');
    await expect(page.getByRole('button', { name: /이 책의 대출 입력/ })).toHaveCount(1);
    await expect(page.getByText('도서 B05', { exact: true })).toBeVisible();
    await page.locator('#member-book-category').selectOption('기획');
    await expect(page.getByRole('button', { name: /이 책의 대출 입력/ })).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('202600002');
  });
  test('TC-SHELL-02 empty successful search differs from failed query', async () => {
    await page.locator('#member-book-search').fill('존재하지 않는 제목');
    await expect(page.getByText('조건에 맞는 책이 없습니다', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: '검색 조건 초기화', exact: true }).click();
    await expect(page.getByRole('button', { name: /이 책의 대출 입력/ })).toHaveCount(3);
    await scenario('empty'); await expect(page.getByRole('button', { name: /이 책의 대출 입력/ })).toHaveCount(0);
    await sample('S01');
  });
  test('TC-SHELL-03 loading and error preserve the member draft', async () => {
    await borrow(); await page.locator('#member-borrower-name').fill('입력 보존 예시');
    await scenario('loading'); await expect(page.getByText('안내 · 조회 처리 중 표본', { exact: true })).toBeVisible();
    await expect(page.locator('#member-borrower-name')).toBeHidden();
    await scenario('error'); await expect(page.getByRole('alert').filter({ hasText: '조회 실패 표본' })).toBeVisible();
    await scenario('normal'); await expect(page.locator('#member-borrower-name')).toHaveValue('입력 보존 예시');
    await adminDetail('L02'); await page.locator('#admin-note').fill('관리 입력 보존 예시');
    await scenario('error'); await expect(page.locator('#admin-note')).toBeHidden();
    await scenario('normal'); await expect(page.locator('#admin-note')).toHaveValue('관리 입력 보존 예시');
    await expect(page.getByText('대출 L02 · 도서 B02', { exact: true })).toBeVisible();
  });
  test('TC-SHELL-04 book list target equals borrow input target', async () => {
    await borrow('B05'); await expect(page.getByText('도서 B05 · 게임 프로그래밍 입문', { exact: true })).toBeVisible();
    await expect(page.locator('#library-screen-title')).toBeFocused();
  });
  test('TC-SHELL-05 invalid member input labels and first-error focus', async () => {
    await borrow(); await page.locator('#member-student-number').fill('12345678');
    await page.locator('#member-borrower-name').fill('   '); await page.locator('#member-due-date').fill('');
    await page.getByRole('button', { name: '대출 요청 내용 확인', exact: true }).click();
    await expect(page.locator('#member-student-number')).toBeFocused();
    for (const id of ['member-student-number', 'member-borrower-name', 'member-due-date', 'member-evidence-photo']) await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true');
    await page.locator('#member-student-number').fill('012345678');
    await expect(page.locator('#member-student-number')).toHaveValue('012345678');
    await page.locator('#member-student-number').fill('12345678A');
    await page.getByRole('button', { name: '대출 요청 내용 확인', exact: true }).click();
    await expect(page.locator('#member-student-number')).toBeFocused();
    await expect(page.locator('#member-student-number')).toHaveAttribute('aria-invalid', 'true');
  });
  test('TC-SHELL-06 photo selection persists through S03 and clears for a different book', async () => {
    await borrow('B05'); await page.locator('#member-evidence-photo').setInputFiles({ name: 'synthetic-book.png', mimeType: 'image/png', buffer: onePixelPng });
    await expect(page.locator('#member-evidence-photo-selection')).toContainText('synthetic-book.png');
    await sample('S03'); await page.getByRole('button', { name: '대출 입력으로 돌아가기', exact: true }).click();
    await expect(page.locator('#member-evidence-photo-selection')).toContainText('synthetic-book.png');
    await nav('책 찾기'); await borrow('B04');
    await expect(page.locator('#member-evidence-photo-selection')).toHaveText('선택한 파일 없음');
  });
  test('TC-SHELL-07 borrow command stays disconnected and M03 is independent', async () => {
    await borrow(); await page.locator('#member-evidence-photo').setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: onePixelPng });
    await page.getByRole('button', { name: '대출 요청 내용 확인', exact: true }).click(); await disconnected(); await screen('M02');
    await sample('M03'); await expect(page.getByText('완료 표현을 검토하는 독립 표본입니다.', { exact: false })).toBeVisible();
  });
  test('TC-SHELL-08 own active list and returned L13 history', async () => {
    await nav('내 대출'); await expect(page.getByRole('button', { name: /실물을 돌려놓고 반납/ })).toHaveCount(2);
    await page.getByRole('button', { name: '반납 이력', exact: true }).click(); await screen('S07');
    await expect(page.getByText('대출 L13 · 도서 B03', { exact: true })).toBeVisible();
    await scenario('empty'); await expect(page.getByText('반납 이력 예시 없음', { exact: false })).toBeVisible();
  });
  test('TC-SHELL-09 return confirmation resets between L02 and L01', async () => {
    await loanAction('L02', '실물을'); await screen('M05');
    const check = page.getByRole('checkbox', { name: '책을 동방에 돌려놓았습니다.' }); await check.check();
    await page.getByRole('button', { name: '아직 반납하지 않았어요', exact: true }).click();
    await page.getByRole('button', { name: /대출 L01 실물을/ }).click(); await expect(check).not.toBeChecked();
    await expect(page.getByText('대출 L01 · 도서 B01', { exact: true })).toBeVisible();
  });
  test('TC-SHELL-10 return never changes loans and M06 is a sample', async () => {
    await loanAction('L01', '실물을');
    const request = page.getByRole('button', { name: '반납 요청 내용 확인', exact: true }); await expect(request).toBeDisabled();
    await page.getByRole('checkbox', { name: '책을 동방에 돌려놓았습니다.' }).check(); await request.click(); await disconnected(); await screen('M05');
    await sample('M06'); await expect(page.getByText('대출 L13 · 도서 B03', { exact: true })).toBeVisible();
  });
  test('TC-SHELL-11 QR and renewal requests do not create approval', async () => {
    await loanAction('L02', '연장'); await screen('M07');
    await page.locator('#member-qr-draft').fill('예시 QR 입력');
    await page.getByRole('button', { name: 'QR 확인 요청 내용 보기', exact: true }).click(); await disconnected();
    await page.getByRole('button', { name: '연장 요청 내용 확인', exact: true }).click(); await screen('M07');
    await sample('S05'); await expect(page.getByText('고정 결과 표본 · 대출 L01', { exact: false })).toBeVisible();
  });
  test('TC-SHELL-12 notification address errors and separate channel samples', async () => {
    await nav('알림 설정');
    await page.getByRole('checkbox', { name: /이메일.*사용 선택/ }).check();
    await page.locator('#member-email').fill('invalid-address');
    await page.getByRole('button', { name: '알림 설정 요청 내용 확인', exact: true }).click();
    await expect(page.locator('#member-email')).toHaveAttribute('aria-invalid', 'true'); await expect(page.locator('#member-email')).toBeFocused();
    await page.locator('#member-email').fill('synthetic@example.com');
    await page.getByRole('button', { name: '알림 설정 요청 내용 확인', exact: true }).click(); await disconnected();
    await sample('S06');
    for (const [value, message] of [['unconfirmed', '소유 확인 전 · 발송하지 않음'], ['denied', '권한 거부 표본'], ['unsupported', '지원하지 않는 환경 표본']]) {
      await page.locator('#state-channel-case').selectOption(value);
      await expect(page.getByText(message, { exact: false }).filter({ hasNot: page.locator('option') })).toBeVisible();
    }
  });
  test('TC-SHELL-13 administrator row selection, hidden selection and same detail', async () => {
    await mode('admin'); await expect(page.getByRole('columnheader')).toHaveCount(6);
    await page.getByRole('radio', { name: /^대출 L02 ·/ }).check();
    await page.locator('#admin-record-query').fill('L01');
    await expect(page.getByText('선택한 기록은 현재 필터에서 숨겨져 있습니다.', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: '선택한 기록 상세 보기', exact: true }).click(); await screen('A02');
    await expect(page.getByText('대출 L02 · 도서 B02', { exact: true })).toBeVisible();
    await expect(page.getByText('대출자 202600002 · 회원 예시 2', { exact: true })).toBeVisible();
  });
  test('TC-SHELL-14 protected evidence placeholder, review and replacement drafts', async () => {
    await adminDetail();
    await expect(page.getByText('사진 표시 영역 · 실제 사진 미연동', { exact: true })).toBeVisible();
    await page.locator('#admin-review').selectOption('확인 불가'); await page.locator('#admin-note').fill('합성 검토 메모');
    await page.getByRole('button', { name: '검토 저장 요청 확인', exact: true }).click(); await disconnected();
    await page.locator('#admin-photo-replacement').setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: onePixelPng });
    await page.getByRole('button', { name: '사진 교체 요청 확인', exact: true }).click(); await disconnected();
  });
  test('TC-SHELL-15 catalog identity, separate flags and native required input', async () => {
    await mode('admin'); await nav('도서 관리', true);
    await page.getByRole('radio', { name: /^도서 B02 / }).check();
    await expect(page.locator('#admin-book-title')).toHaveValue('플레이와 이야기');
    await expect(page.getByRole('checkbox', { name: '공개 목록에서 숨김' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: '신규 대출 불가' })).not.toBeChecked();
    await page.getByRole('button', { name: '새 도서 등록 입력', exact: true }).click();
    await page.getByRole('button', { name: '도서 저장 요청 확인', exact: true }).click(); await expect(page.locator('#admin-book-title')).toBeFocused();
    await page.locator('#admin-book-title').fill('합성 새 책'); await page.locator('#admin-book-author').fill('합성 저자'); await page.locator('#admin-book-category').fill('개발');
    await page.getByRole('button', { name: '도서 저장 요청 확인', exact: true }).click(); await disconnected();
  });
  test('TC-SHELL-16 policy draft never changes current policy', async () => {
    await mode('admin'); await nav('운영 정책', true); await page.locator('#admin-policy-loanDays').fill('14');
    await page.getByRole('button', { name: '변경 내용 확인', exact: true }).click(); await disconnected();
    await expect(page.getByText('현재 예시값 · 20', { exact: true })).toBeVisible();
    await sample('S10'); await expect(page.getByText('활성 정책 포인터', { exact: false })).toBeVisible();
  });
  test('TC-SHELL-17 selected loan set and extension day/reason constraints', async () => {
    await mode('admin'); await nav('예외 · 제재', true);
    await page.getByRole('checkbox', { name: /^대출 L01 ·/ }).check(); await page.getByRole('checkbox', { name: /^대출 L02 ·/ }).check();
    await expect(page.getByText('현재 대출 선택 · 2건', { exact: false })).toBeVisible();
    await page.locator('#admin-extend-days').fill('0'); await page.locator('#admin-extend-reason').fill('합성 확대 사유');
    await page.getByRole('button', { name: '대상 · 추가 기간 확인', exact: true }).click(); await expect(page.locator('#admin-extend-days')).toBeFocused();
    await page.locator('#admin-extend-days').fill('3'); await page.getByRole('button', { name: '대상 · 추가 기간 확인', exact: true }).click(); await disconnected();
  });
  test('TC-SHELL-18 independent freeze and penalty selection identity', async () => {
    await mode('admin'); await nav('예외 · 제재', true);
    await page.locator('#admin-freeze-selection').selectOption('F01'); await page.locator('#admin-freeze-selection').selectOption('F02');
    await expect(page.getByText('선택 동결 F02 · 대출 L02', { exact: true })).toBeVisible();
    await expect(page.getByText('현재 동결 선택 · 1건', { exact: true })).toHaveCount(1);
    await page.locator('#admin-penalty-selection').selectOption('P01'); await expect(page.getByText('원 대출 · L11', { exact: true })).toBeVisible();
    await page.locator('#admin-penalty-selection').selectOption('P02'); await expect(page.getByText('원 대출 · 원본 기록 없음 · 독립 제재', { exact: true })).toBeVisible();
    await page.locator('#admin-clear-reason').fill('합성 해제 사유'); await page.getByRole('button', { name: '선택 제재 해제 요청 확인', exact: true }).click(); await disconnected();
  });
  test('TC-SHELL-19 inclusive returned-date filter retains hidden active selection', async () => {
    await mode('admin'); await nav('자료 정리', true);
    await page.getByRole('checkbox', { name: /^대출 L02 ·/ }).check();
    await page.locator('#cleanup-from').fill('2026-10-02'); await page.locator('#cleanup-to').fill('2026-10-03');
    await expect(page.getByRole('checkbox', { name: /^대출 L11 ·/ })).toBeVisible(); await expect(page.getByRole('checkbox', { name: /^대출 L12 ·/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /^대출 L02 ·/ })).toHaveCount(0);
    await expect(page.getByText('숨겨진 선택 1건', { exact: false }).first()).toBeVisible();
  });
  test('TC-SHELL-20 cleanup snapshot invalidates on scope, dates, target and sample changes', async () => {
    await mode('admin'); await nav('자료 정리', true); await page.getByRole('checkbox', { name: /^대출 L11 ·/ }).check();
    const trigger = page.locator('#library-cleanup-trigger'); const title = page.locator('#cleanup-confirm-title');
    await trigger.click(); await expect(title).toBeVisible();
    await page.locator('#cleanup-scope').selectOption('loanAndPhotos'); await expect(title).toHaveCount(0);
    await trigger.click(); await page.locator('#cleanup-from').fill('2026-10-02'); await expect(title).toHaveCount(0);
    await trigger.click(); await page.getByRole('checkbox', { name: /^대출 L12 ·/ }).check(); await expect(title).toHaveCount(0);
    await trigger.click(); await scenario('long'); await expect(title).toHaveCount(0);
  });
  test('TC-SHELL-21 cleanup active confirmation, missing reason, cancel focus and no deletion', async () => {
    await mode('admin'); await nav('자료 정리', true); await page.getByRole('checkbox', { name: /^대출 L02 ·/ }).check();
    await page.locator('#cleanup-scope').selectOption('loanAndPhotos'); await page.locator('#library-cleanup-trigger').click();
    const request = page.getByRole('button', { name: '정리 요청 확인 · 서버 미연동', exact: true }); await expect(request).toBeDisabled();
    await page.getByRole('checkbox', { name: /선택한 활성 기록과 정리 범위/ }).check(); await request.click(); await expect(page.locator('#cleanup-reason')).toBeFocused();
    await page.locator('#cleanup-reason').fill('합성 정리 사유'); await request.click(); await disconnected();
    await expect(page.getByRole('checkbox', { name: /^대출 L02 ·/ })).toBeVisible();
    await page.getByRole('button', { name: '확인 취소', exact: true }).click(); await expect(page.locator('#library-cleanup-trigger')).toBeFocused();
    await sample('S12'); await expect(page.getByText('현재 A06 선택의 확인은', { exact: false })).toBeVisible();
  });
  test('TC-SHELL-22 display modes do not grant real authority; master target excluded', async () => {
    await mode('admin'); await nav('접근 · 권한', true); await page.locator('#admin-account-selection').selectOption('ACCOUNT02');
    await expect(page.getByRole('button', { name: '선택 계정 관리자 권한 부여', exact: true })).toBeDisabled();
    await expect(page.locator('#admin-account-selection option[value="MASTER00"]')).toHaveCount(0);
    await mode('master'); await nav('접근 · 권한', true); await page.locator('#admin-account-selection').selectOption('ACCOUNT02');
    await page.getByRole('button', { name: '선택 계정 관리자 권한 부여', exact: true }).click(); await disconnected();
    await expect(page.getByText('현재 예시 역할 none', { exact: false })).toBeVisible();
  });
  test('TC-SHELL-23 supplemental record native validation and unlinked draft', async () => {
    await mode('admin'); await nav('보충 기록 · 정정', true); await page.locator('#admin-supplement-book').selectOption('B04');
    await page.getByRole('button', { name: '기록 내용 확인', exact: true }).click(); await expect(page.locator('#admin-supplement-number')).toBeFocused();
    await page.locator('#admin-supplement-number').fill('012345678'); await page.locator('#admin-supplement-name').fill('합성 입력');
    await page.locator('#admin-supplement-time').fill('2026-10-04T10:00'); await page.locator('#admin-supplement-due').fill('2026-10-17'); await page.locator('#admin-supplement-reason').fill('사진 없는 합성 보충 사유');
    await page.getByRole('button', { name: '기록 내용 확인', exact: true }).click(); await disconnected();
    await expect(page.getByText('미연결 보충 기록', { exact: false })).toBeVisible();
    await adminDetail('L01'); await page.getByRole('button', { name: '선택 기록 정정', exact: true }).click();
    await page.locator('#admin-record-mode').selectOption('correction');
    await expect(page.getByText('대출 L01 · 도서 B01', { exact: true })).toBeVisible();
    await page.locator('#admin-supplement-time').fill('');
    await expect(page.locator('#admin-supplement-time')).not.toHaveAttribute('required', '');
    await page.locator('#admin-supplement-reason').fill('합성 정정 사유');
    await page.getByRole('button', { name: '기록 내용 확인', exact: true }).click(); await disconnected();
  });
  test('TC-SHELL-24 proxy return draft, query preservation and cancel focus', async () => {
    await adminDetail('L01'); await page.locator('#library-proxy-return-trigger').click(); await screen('S09');
    await page.locator('#proxy-return-reason').fill('합성 대리 반납 사유'); await page.getByRole('checkbox', { name: '실물을 돌려놓은 것을 확인했습니다.' }).check();
    await scenario('loading'); await scenario('normal'); await expect(page.locator('#proxy-return-reason')).toHaveValue('합성 대리 반납 사유');
    await page.getByRole('button', { name: '대리 반납 요청 · 미연동', exact: true }).click(); await disconnected();
    await page.getByRole('button', { name: '취소 · 상세로 돌아가기', exact: true }).click(); await expect(page.locator('#library-proxy-return-trigger')).toBeFocused();
    await page.locator('#library-proxy-return-trigger').click(); await expect(page.getByRole('checkbox', { name: '실물을 돌려놓은 것을 확인했습니다.' })).not.toBeChecked();
  });
  test('TC-SHELL-25 outcome lookup stays separate and partial effects are labelled', async () => {
    await sample('S04'); await page.getByRole('button', { name: '결과 조회 연결 확인', exact: true }).click();
    await expect(page.getByText('원래 명령을 다시 실행하지 않았습니다.', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: '원래 목록으로 돌아가기', exact: true }).click(); await screen('M04');
    await mode('admin'); await sample('S11'); await expect(page.getByText('기한 변경 여부 미확정', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: '결과 조회 연결 확인', exact: true }).click();
    await expect(page.getByText('원래 명령을 다시 실행하지 않았습니다.', { exact: false })).toBeVisible();
  });
  test('TC-SHELL-26 independent rejection reason samples', async () => {
    await sample('S02');
    for (const [value, message] of [['hours', '허용 시간 밖입니다.'], ['blocked', '금지일 표본입니다.'], ['lookup', '조건 조회 실패 ·'], ['quota', '동시 대출 한도에 도달한'], ['overdue', '연체 기록이 있는'], ['penalty', '2026.10.18 14:32 KST']]) {
      await page.locator('#state-reason-case').selectOption(value); await expect(page.getByText(message, { exact: false })).toBeVisible();
    }
    await sample('S08');
    for (const [value, message] of [['qr', '운영 QR을 확인할 수 없는'], ['overdue', '연체 또는 숨김 상태의'], ['limit', '최대 연장 횟수 제한 표본']]) {
      await page.locator('#state-renew-case').selectOption(value); await expect(page.getByText(message, { exact: false })).toBeVisible();
    }
  });
  test('TC-SHELL-27 responsive widths and long-value rows', async () => {
    await mode('admin'); await scenario('long');
    for (const width of [320, 390, 639, 640, 641, 1022, 1023, 1024, 1025, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const metrics = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth, row: getComputedStyle(document.querySelector('tbody tr')).display }));
      assert.ok(metrics.scroll <= metrics.client + 1, `Horizontal overflow at ${width}px: ${JSON.stringify(metrics)}`);
      assert.equal(metrics.row, width <= 1023 ? 'block' : 'table-row');
    }
    await page.setViewportSize({ width: 390, height: 1000 }); await page.screenshot({ path: path.join(output, 'admin-mobile-long.png'), fullPage: true });
    await mode('member'); await scenario('long');
    for (const width of [320, 390, 640, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `Member overflow at ${width}px`);
    }
    await page.setViewportSize({ width: 390, height: 1000 }); await page.screenshot({ path: path.join(output, 'member-mobile-long.png'), fullPage: true });
  });
  test('TC-SHELL-28 keyboard activation, visible focus and 200 percent text', async () => {
    const button = page.getByRole('button', { name: /도서 B04 .*대출 입력/ });
    await button.focus(); await page.keyboard.press('Enter'); await screen('M02'); await expect(page.locator('#library-screen-title')).toBeFocused();
    await page.keyboard.press('Tab'); await expect(page.locator('#member-student-number')).toBeFocused();
    const outline = await page.locator('#member-student-number').evaluate((element) => getComputedStyle(element).outlineWidth); assert.notEqual(outline, '0px');
    await page.keyboard.press('Tab'); await expect(page.locator('#member-borrower-name')).toBeFocused();
    await page.keyboard.press('Shift+Tab'); await expect(page.locator('#member-student-number')).toBeFocused();
    await loanAction('L01', '실물을');
    const check = page.getByRole('checkbox', { name: '책을 동방에 돌려놓았습니다.' });
    await check.focus(); await page.keyboard.press('Space'); await expect(check).toBeChecked();
    await page.keyboard.press('Space'); await expect(check).not.toBeChecked();
    await page.addStyleTag({ content: 'html { font-size: 32px !important; }' }); await page.setViewportSize({ width: 640, height: 1000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), 'Overflow at 200% root text size');
    await page.screenshot({ path: path.join(output, 'member-text-200-percent.png'), fullPage: true });
  });
  test('TC-SHELL-29 no business endpoint or persistent identity on shell commands', async () => {
    const requests = []; page.on('request', (request) => { if (request.method() !== 'GET') requests.push(`${request.method()} ${request.url()}`); });
    await loanAction('L01', '연장'); await page.getByRole('button', { name: '연장 요청 내용 확인', exact: true }).click(); await disconnected();
    await mode('master'); await nav('접근 · 권한', true); await page.locator('#admin-account-selection').selectOption('ACCOUNT02');
    await page.getByRole('button', { name: '선택 계정 관리자 권한 회수', exact: true }).click(); await disconnected();
    assert.deepEqual(requests, []); assert.deepEqual(await context.cookies(), []);
    assert.deepEqual(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })), { local: 0, session: 0 });
  });
  test('TC-SHELL-30 library entry metadata and home navigation', async () => {
    await expect(page).toHaveTitle('도서관리 | EDGE');
    const home = page.getByRole('link', { name: '홈으로 돌아가기', exact: true }); await expect(home).toHaveAttribute('href', '/');
    await home.click(); await expect(page).toHaveURL(`${baseURL}/`);
    const menu = page.getByRole('navigation', { name: '주요 메뉴' });
    await expect(menu.getByRole('link')).toHaveCount(3);
    await expect(menu.getByRole('link', { name: 'About Us', exact: true })).toHaveAttribute('href', '/about');
    await expect(menu.getByRole('link', { name: 'Game Archive', exact: true })).toHaveAttribute('href', '/archive');
    await menu.getByRole('link', { name: 'Library', exact: true }).click(); await screen('M01');
  });
});
