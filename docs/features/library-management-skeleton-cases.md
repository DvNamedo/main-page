# 도서관리 프론트 껍데기 — 유스케이스 기반 테스트 케이스

2026-10-05 · **최신: 회원·관리자 브라우저 표본 30/30, DTO/gateway 단위 8/8, 외부 fetch 차단 단위 1/1 통과**. 타입·린트·빌드 결과와 시험 한계는 §4가 정본이다. §1~3은 실행 전 계획/기록이며 당시의 전부 미실행·실행 보류를 현재 프론트에 다시 적용하지 않는다. 운영 업무·실서비스 검증은 제외한다.

## 1. 목적·선택 방법·범위

사용자의 5단계 요청에 있는 대안 중 **기존 유스케이스 기반 케이스 작성**을 선택했다. 기존 Next/React 껍데기에 C++ Google Test/새 실행 환경을 추가하지 않는다. 기존 [UC01~25](library-management-use-cases.md), [SD SC01~08](library-management-design.md#structural-boundaries), [28종 화면 계약](library-management-ui-draft.md#screen-contracts)을 재사용한다. 업무 성공·권한·저장·경합의 운영 AC를 이번 표본으로 통과 처리하지 않는다.

P02의 통합 기록 범위를 적용하며 T01의 검증 수준/수동 방식, T02/03의 입력 경계·선택 전이 표본, T10의 UI·접근성 범위, T12의 요구→계약→소스 정적 대조를 선택한다. 실행 자동화·Google Test·새 업무 유스케이스는 현재 요청을 만족하는 데 필요하지 않고 실행도 보류되어 생략한다. 테스트 방법 ID의 정본은 [방법론 목록](../METHOD_CATALOG.md)이다.

준비 조건은 추후 보류 해제 후 로컬 `/library`에서 합성 예시만 사용하는 것이다. 기본 표본은 회원, 일반 예시, 공개 B04~06·본인 L01/L02·반납 L13, 관리 L01~03·정리 L11/L12/L02이다. 같은 제목의 별도 실물 ID를 같은 책 항목으로 합치지 않는다. 예시 문구와 실제 상태를 구분하고 실행 환경/시각/입력/관찰/실제 결과/결함을 실행 시 기록한다.

## 2. 케이스

각 행의 `UC01` 표기는 `UC-LIBRARY-01`이다. 아래는 실행 전 기대 결과이고, 각 자동화 표본의 최신 실제 결과는 §4를 따른다. 행의 모든 상황·기기·보조기술을 빠짐없이 검증했다는 뜻은 아니다.

| ID · 연결 | Given / When (향후 절차) | Then (관찰할 기대 결과) | 실제 코드 연결 |
| --- | --- | --- | --- |
| TC-SHELL-01 · UC21 · M01 · SC03/07 | 회원 일반 예시에서 제목/저자 검색과 분야를 함께 선택 | 두 조건이 함께 적용되고 공개 B04~06만 표시. 관리 학번·이름·검토·사진 원본 노출 없음 | MemberScreens M01, readPublicBooks |
| TC-SHELL-02 · UC21 · M01/S01 · SC03/05 | 없는 검색어 또는 정상 빈 목록 표본 선택 | 정상 결과 0권 안내. 조회 실패 문구로 바꾸지 않음. 검색 조건 초기화 가능 | MemberScreens M01, StateScreens S01 |
| TC-SHELL-03 · UC21/23 · M01/A01 · SC03/05 | 조회 처리 중, 조회 실패 표본을 각각 선택 | 처리 중/오류 문구 구분. 자동 완료·명령 재시도 없음. 이전 입력과 선택을 보존 | LibraryClient currentQuery/lastReadyScenario |
| TC-SHELL-04 · UC01 · M01→M02 · SC06 | B05의 대출 입력 버튼 선택 | M02에 동일 B05·제목·저자·분야 표시. 도서 미선택 상태에는 다른 책을 기본 선택하지 않음 | MemberScreens, ScreenNavigation |
| TC-SHELL-05 · UC01 · M02 · SC01/05 | 학번 8자리/문자/앞자리0 포함9자리, 공백뿐인 이름, 날짜 누락을 독립 입력 | 로컬 형식·필수 오류만 판정, 첫 오류 필드 포커스/라벨 연결. 앞자리0은 문자열로 보존. 다른 입력 유지 | submitBorrow, Field |
| TC-SHELL-06 · UC01 · M02/S03 · SC07 | 사진 선택/해제 후 대출 요청 내용 확인; 사진 오류 표본으로 이동 후 복귀 | 선택 파일명·종류·크기만 표시, 읽기/변환/업로드 없음. S03 중 숨겨진 M02의 입력·선택 파일 유지. 도서/회원 화면 변경 시 사진 선택 해제 | FilePicker, MemberScreens photo 수명, LibraryClient hidden |
| TC-SHELL-07 · UC01 · M02/M03 · SC04/07 | 유효 입력·선택 사진으로 대출 요청 내용 확인 | not-connected 표시, 현재 M02 유지. 새 Loan/쿠키/사진/성공 결과 없음. M03은 표본 메뉴에서만 별도 열람 | previewGateway.request, LibraryClient request/memberSamples |
| TC-SHELL-08 · UC03 · M04/S07 · SC03/06 | 본인 대출·반납 이력 전환 및 빈 목록 선택 | 활성 L01/L02와 반환 L13 구분. ID·기한/반납시각과 색상 외 상태 표시. 학번 자동 소유복구 없음 | MemberScreens M04/S07, readOwnLoans |
| TC-SHELL-09 · UC02 · M04→M05 · SC06 | L02 반납 입력 열고 실물 확인 후 취소, L01로 다시 열기 | 선택/확인에 L02 동일 표시, 새 대상 L01에는 이전 체크 없음. 취소는 기록 변경 없이 목록 복귀 | MemberScreens physicalConfirmation/useEffect |
| TC-SHELL-10 · UC02 · M05/M06 · SC07 | 실물 확인 없이/확인 후 요청, M06 표본 열기 | 누락 때 disabled와 이유. 확인 후도 not-connected. M06의 L13은 실제 선택 반납 결과가 아닌 독립 표본 | MemberScreens M05/M06 |
| TC-SHELL-11 · UC09 · M07/S08/S05 · SC06/07/08 | L01/L02 연장 입력에서 QR 문구 입력하고 요청; 제한/완료 표본 전환 | QR 확인 완료·운영 유효시간·새 기한을 만들지 않음. 제한 사유는 개별 표본. S05는 L01 고정 결과이며 L02기한과 혼합하지 않음 | MemberScreens M07, StateScreens S05/S08 |
| TC-SHELL-12 · UC04/24 · M08/S06 · SC01/07 | 이메일/Push 선택과 주소 변경, 오류 주소 제출; 채널 상태 표본 선택 | 주소 형식 오류와 소유 미확인 구별. 실제 permission/구독/메일 발송 없음. 채널 상태를 각각 문자로 표시 | submitNotifications, StateScreens S06 |
| TC-SHELL-13 · UC23 · A01→A02 · SC06 | 관리 모드에서 L01/L02/L03 실제 행 라디오 선택·상세 열기; 선택을 숨기는 필터 적용 | 헤더 선택 불가. 표시/선택/숨겨진 선택 건수 분리. 상세가 동일 Loan ID·Book ID·대출자·연결 상태 유지 | AdminScreens A01/A02, RecordTable |
| TC-SHELL-14 · UC07/13 · A02/A08 · SC01/07 | 검토 상태·메모·정정 사유·교체 사진 입력 후 요청 | 보호 사진은 원본 대신 자리표시/누락 안내. 선택 파일만 표시. 검토/사진 교체/정정은 미연동, 기존 fixture 불변 | AdminScreens A02/A08, FilePicker |
| TC-SHELL-15 · UC05 · A03 · SC01/06 | B02/B03 선택 및 신규 도서 입력 전환; 필수 서지 누락/사진 선택 | 선택 ID·상세 일치. 숨김과 신규 대출 불가 별개 체크. 등록 사진 선택은 선택 사항, 저장은 미연동 | AdminScreens A03 |
| TC-SHELL-16 · UC06 · A04/S10 · SC01/05/08 | 정책 현재값/초안을 비교해 변경 요청, S10 표본 열기 | 현재 정책/초안 분리, 실제 활성화 없음. 값/대응 기록/활성 포인터 효과를 구별, 이전 유효 정책 유지 표본 | AdminScreens A04, StateScreens S10 |
| TC-SHELL-17 · UC16 · A05 · SC01/06 | 대출 2건 선택해 확대 일수/사유 누락 및 유효 초안 제출 | Loan 선택 건수와 각 대상 서지 유지. 일수/사유 입력 검사 후에도 not-connected. 실제 기한/연체 계산 없음 | AdminScreens A05 |
| TC-SHELL-18 · UC17/18 · A05 · SC06 | F01→F02와 P01→P02를 각각 단일 선택하고 해제 사유 입력 | 동결/제재/대출 ID·건수 별도. P01 원천 L11, P02는 독립 참조이며 삭제된 학번·책 복원 없음 | AdminScreens A05, FreezeDTO/PenaltyDTO |
| TC-SHELL-19 · UC15 · A06 · SC06 | 반납일 필터 경계 2026-10-02/03 및 전체 기간 선택; L02 선택 후 반납일 필터 적용 | 반납일 양 끝 포함, 기간 필터에 활성 항목 제외/전체에는 포함. 기존 선택 유지·숨겨진 선택 건수 고지 | AdminScreens A06 |
| TC-SHELL-20 · UC15 · A06/S12 · SC06 | L11/L02 선택, 사진만/기록+사진 범위 검토. 날짜·선택·범위 변경 | 검토 snapshot은 동일 대상·범위·건수. 변경 시 기존 확인 무효화. 실제 previewRef/서버 revision 검사 없음 | AdminScreens A06 인라인 확인 |
| TC-SHELL-21 · UC15 · A06/S12 · SC07 | 활성 포함 기록+사진 확인에서 확인 체크/사유 누락 및 유효 초안 요청 | 누락 이유 표시, 취소는 자료 불변. 유효 초안도 미연동. 이전 R00 최소 결과는 현재 선택과 별도이며 원본 개인정보 복원 없음 | AdminScreens A06, StateScreens S12 독립 표본 |
| TC-SHELL-22 · UC20/25 · A07 · SC02/07 | 관리/마스터 모드 탐색, 기존 계정 역할 요청, 마스터가 대상 목록에서 제외됐는지 확인 | 예시 모드는 인증 아님. 실제 세션/권한 변화 없음. 일반 관리자의 역할 명령·마스터 일반 승격/박탈 제외. 새 계정 발급 보류 | LibraryClient mode, AdminScreens A07 |
| TC-SHELL-23 · UC10/13 · A08 · SC01/06/07 | 보충/정정 입력, 도서/당시 학번·이름/기한/사유 누락·사진 없음 상태; 보충 모드의 시각 누락 | 필수·사유 오류와 입력 유지. 현재 대상 식별 표시, 쿠키·프로필 자동 연결 없음. 보충 모드만 과거 시각 필수, 정정의 빈 시각은 전달에서 생략. 보충/정정 요청 미연동 | AdminScreens A08 |
| TC-SHELL-24 · UC14 · A02→S09 · SC06/07 | 선택 L01로 대리 반납 확인 후 취소; L02로 재진입 | 같은 대상 식별·사유/실물 확인 필수. 새 화면/대상마다 체크 초기화, 취소시 상세 진입 버튼 포커스. 요청은 미연동 | StateScreens S09 key, LibraryClient navigate |
| TC-SHELL-25 · UC22 · S04/S10/S11 · SC03/05 | 결과 조회 연결 확인 또는 부분 결과 표본 열기 | 명령 재실행 없음. S11 항목별 target×effect·확정/실패/확인중·남은 처리 구별. 결과조회 자체도 미연동 | StateScreens, previewGateway.readResult |
| TC-SHELL-26 · UC01/09 · S02/S08 · SC05/08 | 사유 표본을 각각 전환 | 서로 다른 시간/금지일/권수/연체/정확한 제재시각/QR/상한을 동시에 확정하지 않음. 실제 Guard 평가 없음 | StateScreens reasonCase/renewCase |
| TC-SHELL-27 · 전체 · SC05/06 | 320/390/1023/1024/1440px·200% 확대에서 긴 값/빈 목록/상태 표본 확인 | 값 생략·가로 잘림 없이 줄바꿈. 관리자 표가 좁은 화면에서 라벨+값 카드, 헤더와 실제 선택행 구분 | library.module.css, Card/RecordTable |
| TC-SHELL-28 · 전체 · SC05 | Tab/Shift+Tab/Enter/Space로 탐색/선택/폼 오류/확인 취소 | 문서 읽기 순서와 탭 순서 일치, 포커스 표시, 화면 제목/첫 오류/가능한 취소 트리거 복귀, 색상 외 문자 상태. 보조기술 실제 판정은 실행 시 기록 | LibraryClient heading, library-ui, 각 화면 |
| TC-SHELL-29 · 전체 · SC03/07/08 | 데이터 소스/import/handler를 정적 대조; 향후 통신·저장 관찰 | 명령→not-connected뿐, fetch/쿠키/storage/사진 읽기/서버 호출/정책 판정/발송 없음. CF48~55·TV01~07 상태 불변 | preview-gateway, 전체 신규 파일 |
| TC-SHELL-30 · 전체 · 진입점 | 홈 Library 진입/직접 /library/홈 복귀 | 기존 동급 메뉴·준비 안내·홈 복귀 유지, 새 화면은 예시임을 표시. 기존 About/Archive 목적지 보존 | BentoNav(기존 변경), LibraryPage |

## 3. 표시 범위와 결과 기록

TC-SHELL-01~30은 28종 화면의 **껍데기** 계약을 묶어 확인하는 계획이다. 서버 소유/권한 거부·경합·사진 실제 검사·시각 계산·외부 부분 쓰기·발송·공급자 실현성은 기존 UC의 운영 AC/TV로 남는다. S12의 단독 표본과 A06의 현재 선택 확인을 혼합하지 않는다. S03는 원래 입력으로 돌아가는 표본이며 실제 이미지 오류를 주입한 결과가 아니다.

| 판정 대상 | 현재 근거 | 결과 |
| --- | --- | --- |
| 케이스 추적·예상 결과 | UC/화면/SC/소스 이름의 문서 정적 대조 | 케이스 작성 완료. 실제 테스트 성공 근거 아님 |
| 실제 동작·컴파일·접근성·회귀 | 실행 금지 유지 | 전 케이스 미실행 / 판정 불가 |
| 업무 규칙·실연동·QA | CF48~55 보류·TV01~07 미검증 | 운영 기능 완료/사용 가능·QA 통과로 보고하지 않음 |

실행 재개 시 각 케이스에 실제 환경·관찰·통과/실패·결함ID·재검증 결과를 덧붙인다. 보류 해제 전에는 실행하거나 미실행 칸을 통과로 채우지 않는다.

## 4. 2026-10-05 실행 검증 재개

사용자가 관리자 검증을 진행하라고 요청했고, 이어서 회원 프론트 껍데기도 범위에 포함했다. **프론트에 한해** 테스트·타입·린트·빌드·로컬 앱/브라우저 검증 보류를 해제한다. §1~3의 전부 미실행 기록은 실행 전 기준선이며 아래 결과가 최신이다. 실제 인증/세션·운영 QR·최종 업무 판정·Sheets/Drive·실 이미지 처리·발송·실자료/설정 변경·배포와 CF48~55·TV01~07 보류는 유지한다.

- 계획/기준: TC-SHELL-01~30의 합성 예시를 사용해 회원 M01~08·S01~08과 관리자 A01~08·S09~12의 정상/빈/오류/진행 상태, 동일 대상 이동, 필수 입력, 파일 선택, 미연동 요청, snapshot/취소·포커스, 대표 폭의 배치를 검사한다. 통과는 실제 관찰한 환경/동작에 한정한다.
- 방법: T01/T08의 기존 Next/TypeScript/ESLint 재사용·브라우저 시나리오, T09 타입/린트/빌드 분리, T10 뷰포트/키보드 확인, T11/T12 결함/재검증·추적. 새 테스트 프레임워크 없이 기존 케이스를 실행한다.
- 환경 시작: Windows, Node 22.14.0, npm 11.16.0. `node_modules`가 없어 기존 lockfile로 `npm ci --no-audit --no-fund` 복원. 소스/lockfile/기존 로컬 변경 보존. 브라우저·도구 실제 버전과 실행 결과는 아래에 기록한다.
- 결과: **실행한 프론트 표본 통과 / 운영 연동·전체 접근성 QA 미완료**. 2026-10-05 10:13 KST 결과 정리. Next 14.2.3, React 18, TypeScript 5.9.3, ESLint 8.57.1, 기존 번들 Playwright 1.62.1, 설치된 Edge 154.0.4258.53의 headless Chromium을 사용했다. 앱 패키지/lockfile에 새 테스트 의존성을 넣지 않았고 브라우저를 다운로드하지 않았다.

### 4.1 실제 결과·추적

| 대상/계약 | 실제 관찰·판정 | 증거 |
| --- | --- | --- |
| TC-SHELL-01~12 · 회원 M01~08/S01~08 · SC01/03~08 | **12/12 표본 통과.** 공개 검색+분야, 정상 0건, 조회 중/실패 후 입력 보존, 동일 도서/대출, 필수 오류·앞자리0, 파일 선택/해제 수명, 본인 이력, 반납 체크 초기화, QR/연장 미연동, 이메일 형식과 개별 채널 문구 확인. 명령 후 완료 표본으로 자동 이동하지 않음 | `tests/library/browser.test.cjs`, 최종 브라우저 로그 |
| TC-SHELL-13~24 · A01~08/S09/S10/S12 · SC01/02/05~08 | **12/12 표본 통과.** 실제 행 선택/필터 밖 선택/같은 상세, 도서 독립 체크, 현재 정책/초안, Loan/Freeze/Penalty 구별, 반납일 양 끝·활성 제외, 확인 snapshot 무효화·활성 경고·취소 포커스, 표시 역할 제한, 보충/정정 시각 제약, 대리 반납 초안 보존/재진입 초기화 확인 | 같은 브라우저 테스트, 케이스별 캡처 |
| TC-SHELL-25~30 · 결과/배치/접근성/진입 · SC03/05~08 | **6/6 표본 통과.** 결과조회 미연동·부분 효과 문구, 각 제한 사유, 대표 폭의 긴 값, Enter/Tab/Shift+Tab/Space와 포커스, 200% 루트 글자 크기, 명령의 비GET 전송/쿠키/storage 0건, 홈 메뉴 href와 왕복 확인 | 같은 브라우저 테스트, 관찰 JSON·모바일/텍스트 확대 캡처 |
| 공개/본인 DTO · SC03/07, gateway 명령/결과조회 · SC04/07 | **8/8 단위 통과.** 허용 공개 필드, 본인 관리 필드 제외, 0건/진행/오류 구별, 긴 값 ID 보존, 서지/독립 제재 참조, 명령의 fixture 불변, 결과조회가 request를 호출하지 않음, 28종 제목 매핑 확인 | `tests/library/preview-gateway.test.cjs` · `node --test` exit 0 |
| 외부 fetch 차단기 · 실행 범위 보호 | **1/1 단위 통과.** Sheets/Apps Script/원격 HTTP는 transport stub 호출 전에 거부하고 localhost Request만 전달. 기존 Archive의 빌드 중 Sheets fetch에 대비하는 테스트 전용 preload이며 제품 코드/운영 기능이 아님 | `tests/library/block-external-fetch.cjs`, `block-external-fetch.test.cjs` |
| 타입 검사 · 전체 앱 | **통과, exit 0.** 기존 컴파일러로 noEmit/incremental false 검사 | 실행 도구 출력(진단 없음·exit 0), 최종 Next 빌드 타입 단계 |
| 린트 · 도서관리/전체 앱 | 도서관리 세 디렉터리 **오류·경고 없음**. 전체 앱 **exit 0, 경고 1건**: 기존 `ReviewModal.tsx:29`의 useEffect/loadReviews. 관련 없는 수정은 하지 않음 | `.library-test-output/lint.txt`, 범위 검사 도구 출력 |
| 전체 Next 빌드 · `/library` 포함 | **최종 exit 0**, 정적 페이지 7/7 생성, `/library` 21 kB/초기 JS 115 kB. 아래 D01 교정 후 통과. 외부 fetch 차단 재빌드는 기존 캐시를 사용하며 Archive 운영 데이터/연동 검증의 근거가 아님 | `.library-test-output/build-external-blocked.txt` |
| 정적 계약 대조/보존 | 테스트에서 조회/명령 경계를 실제 소비하고 UC→화면→SC→소스의 기존 연결을 재사용. `git diff --check` 통과. BentoNav·Library 제품 코드·Figma·DFD·업무 규칙·lockfile을 이번 검증에서 변경하지 않음 | 테스트 소스·기존 §2/UI 계약·Git 차이 |

브라우저 최종 실행은 **30 tests, 30 pass, 0 fail/skip**(약 30.6초). 케이스별 관찰 30건의 uncaught pageerror는 0건이다. 새 context에서 비밀/실자료를 주입하지 않았으며 브라우저는 localhost 외 origin의 요청을 차단하도록 구성했다. TC29의 명령 조작에서 비GET 요청·쿠키·localStorage·sessionStorage는 모두 0이었다. 이 관찰을 서버 인증/권한 강제의 증거로 사용하지 않는다.

대표 폭은 관리자 A01 긴 값에서 320/390/639/640/641/1022/1023/1024/1025/1440px, 회원 M01 긴 값에서 320/390/640/1024/1440px이다. 가로 넘침 없이 관리 행은 ≤1023px 카드, ≥1024px 표로 표시됐다. 390px 회원/관리자 긴 값과 회원 글자 확대 캡처를 실제 열람했다. 키보드는 M02 필드의 정방향/역방향, Enter 진입, M05 Space 체크, 첫 오류/제목/A06·S09 취소 포커스의 표본이다. 200%는 M05의 루트 글자 크기(32px)·640px 검증이며 **실제 브라우저 줌/모든 화면/모든 기기/스크린리더/대비 측정은 미검증**이다.

### 4.2 결함·재검증·제약

| ID | 발견·변경 이유 | 조치·실제 재검증 |
| --- | --- | --- |
| D01 · 기존 About 빌드 오류 | 전체 빌드에서 `about/page.tsx:65`의 `react/no-unescaped-entities` 오류 2건 발생 | 따옴표를 `&quot;`로만 바꿔 표시 문구 유지. 타입·전체 린트·전체 빌드 통과. 다른 About 구조/동작은 변경하지 않음 |
| D02 · 테스트 locator 모호성 | 첫 실행 29/30: loading 문구가 option/안내에 중복. 두 번째 29/30: alert가 앱 안내/Next route announcer에 중복 | 안내 exact text와 alert의 hasText로 대상 제한. 제품 코드는 바꾸지 않음. 최종 30/30 통과. 두 실패 로그도 보존 |
| D03 · 빌드의 제외 범위 차단 누락 | 최초 성공한 전체 빌드의 Archive 정적 생성에서 기존 공개 Sheets CSV 읽기가 발생. 사용자 제외 조건을 빌드에 적용하지 못한 실행 누락이며 실제 쓰기·실설정/실자료 변경은 없음 | 테스트 전용 외부 fetch 차단 preload와 transport 미호출 단위 추가. 차단 적용 재빌드 exit 0, 기존 fetch cache 재사용(새 차단 이벤트 로그 없음). 이전 읽기를 없었던 것으로 보고하지 않음. 최초 빌드는 실서비스 호출 0건 검증의 근거로 사용하지 않음 |

기존 Browserslist의 9개월 지난 데이터 안내, ReviewModal 경고 1건은 남는다. 패키지 업데이트/리뷰 기능 수정은 이번 범위가 아니다. 테스트 출력·캡처는 `.library-test-output/`에 두고 `.gitignore`로 제외한다. `.eslintrc.json`은 이미 설치된 `next/core-web-vitals`를 사용해 비대화형 검사를 가능하게 한다. 테스트 브라우저 context와 로컬 3100 dev 서버는 검증 후 종료했다. 운영 인증/세션·QR·최종 판정·저장/업로드/삭제·실 이미지 처리·발송·배포·CF48~55·TV01~07·U/O 후보는 계속 제외/미검증이다.

### 4.3 재현 명령·로컬 증거

앱 디렉터리에서 실행한다. `LIBRARY_PLAYWRIGHT_PATH`는 이 컴퓨터에 이미 번들된 경로이며 다른 환경에서는 설치된 Playwright 경로로 지정한다. 앱/브라우저를 실행할 때 preload도 적용하면 기존 인접 페이지의 외부 fetch를 막는다. 정상 운영 실행 설정에는 이 preload를 넣지 않는다.

```powershell
node --test tests/library/preview-gateway.test.cjs tests/library/block-external-fetch.test.cjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/next/dist/bin/next lint --no-cache
$env:NEXT_TELEMETRY_DISABLED='1'
$env:NODE_OPTIONS='--require ./tests/library/block-external-fetch.cjs'
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100
# 다른 터미널: 위 localhost 앱에 접근하는 합성 브라우저 검사
$env:LIBRARY_PLAYWRIGHT_PATH='C:/Users/vip1212/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
node --test --test-concurrency=1 tests/library/browser.test.cjs
```

[최종 브라우저 로그](../../game-dev-club-site/.library-test-output/browser-run-03.txt), [관찰 JSON](../../game-dev-club-site/.library-test-output/browser-observations.json), [차단 적용 빌드 로그](../../game-dev-club-site/.library-test-output/build-external-blocked.txt), [회원 모바일 긴 값](../../game-dev-club-site/.library-test-output/member-mobile-long.png), [관리자 모바일 긴 값](../../game-dev-club-site/.library-test-output/admin-mobile-long.png), [회원 200% 글자](../../game-dev-club-site/.library-test-output/member-text-200-percent.png). 이 증거는 해당 로컬 작업 폴더에 존재하며 Git에 포함되지 않는다. 반복 실행은 필요 시 해당 결함/변경 범위로 한정한다.
