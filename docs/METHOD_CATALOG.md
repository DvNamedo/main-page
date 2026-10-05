# 방법론 선택 목록

## 적용 순서

1. [P02 변경 분류](methods/PLANNING_ANALYSIS.md#p02)로 기록·모델·검증의 범위를 정한다.
2. 아래에서 이번 변경의 질문에 해당하는 방법을 연다. 각 방법의 `근거 / 후보·선택 조건 / EDGE 기본 / 입력→절차→산출물 / 판정 / 축약`을 적용한다.
3. [기능 양식](templates/FEATURE_SPEC.md)에 선택 ID·조건·이유·실제 산출물·판정을 남긴다. 다른 후보를 선택해도 그 방법의 적용 조건과 필수 계약을 만족해야 한다.
4. 방법이 다루지 못하는 필수 결정은 [P07](methods/PLANNING_ANALYSIS.md#p07)로 구분하고 현행 결정은 [M10](methods/PROJECT_MANAGEMENT.md#m10)에 따라 기록한다.

모든 후보를 함께 쓰거나 모든 모델을 매번 만들라는 뜻이 아니다. PDF·외부 원전의 설명과 EDGE의 채택 규칙을 구별하고, 미정 수치·역할·데이터 정책·도구를 사이트 요구사항으로 자동 확정하지 않는다. 이 목록은 EDGE 전체에 적용하며 현재 브랜치의 도서관리만을 위한 체크리스트가 아니다.

## 전체 감사 항목과 실행 위치

[1단계 감사 목록](GUIDELINE_AUDIT.md) C01-C39에 대한 2단계 실행 문서 연결이다. 같은 방법이 여러 주제를 해결하거나 한 주제에 여러 방법이 필요할 수 있다.

| 감사 ID | 구체화 대상 | 채택 방법·실행 위치 |
| --- | --- | --- |
| C01 | 반복 단위·피드백 | [P01](methods/PLANNING_ANALYSIS.md#p01) |
| C02 | 변경 분류·축약 | [P02](methods/PLANNING_ANALYSIS.md#p02) |
| C03 | 문제·맥락·경계 | [P03](methods/PLANNING_ANALYSIS.md#p03) |
| C04 | 요구 수집·표현·원자성 | [P04](methods/PLANNING_ANALYSIS.md#p04) · [P05](methods/PLANNING_ANALYSIS.md#p05) |
| C05 | 요구사항 검토 실행 | [P06](methods/PLANNING_ANALYSIS.md#p06) |
| C06 | 미정·질문·기술 선택 | [P07](methods/PLANNING_ANALYSIS.md#p07) |
| C07 | 품질 속성·상충 목표 | [P08](methods/PLANNING_ANALYSIS.md#p08) |
| C08 | QAS 측정·임계값·불확실성 | [P09](methods/PLANNING_ANALYSIS.md#p09) |
| C09 | 유스케이스 목표·관심사·보장 | [P10](methods/PLANNING_ANALYSIS.md#p10) |
| C10 | 도메인·불변조건·데이터 사전 | [P11](methods/PLANNING_ANALYSIS.md#p11) |
| C11 | SSD·연산·계약 | [P12](methods/PLANNING_ANALYSIS.md#p12) |
| C12 | DFD 분해·균형·처리 명세 | [P11](methods/PLANNING_ANALYSIS.md#p11) · [P13](methods/PLANNING_ANALYSIS.md#p13) · [D06](methods/DESIGN_IMPLEMENTATION.md#d06) |
| C13 | FSM 전이·Guard·도달성 | [P14](methods/PLANNING_ANALYSIS.md#p14) |
| C14 | SASD·OOAD 선택 | [P15](methods/PLANNING_ANALYSIS.md#p15) |
| C15 | 책임 배분·GRASP | [D03](methods/DESIGN_IMPLEMENTATION.md#d03) |
| C16 | 설계 표현·ERD·타입 | [D02](methods/DESIGN_IMPLEMENTATION.md#d02) · [D06](methods/DESIGN_IMPLEMENTATION.md#d06) |
| C17 | 인터페이스·HTTP·권한 | [D04](methods/DESIGN_IMPLEMENTATION.md#d04) · [D05](methods/DESIGN_IMPLEMENTATION.md#d05) |
| C18 | 저장·경합·멱등·외부 호출·캐시 | [D06](methods/DESIGN_IMPLEMENTATION.md#d06) · [D07](methods/DESIGN_IMPLEMENTATION.md#d07) · [D08](methods/DESIGN_IMPLEMENTATION.md#d08) · [D09](methods/DESIGN_IMPLEMENTATION.md#d09) |
| C19 | 아키텍처·패턴·ADR | [D01](methods/DESIGN_IMPLEMENTATION.md#d01) · [D10](methods/DESIGN_IMPLEMENTATION.md#d10) |
| C20 | SOLID·응집·결합·Clean Code | [D10](methods/DESIGN_IMPLEMENTATION.md#d10) |
| C21 | 재사용·구현·의존성 비교 | [D11](methods/DESIGN_IMPLEMENTATION.md#d11) |
| C22 | 영향 분석·최소 패치 | [D12](methods/DESIGN_IMPLEMENTATION.md#d12) |
| C23 | 기법·수준·자동/수동·대역·도구 | [T01](methods/TESTING_QA.md#t01) · [T02](methods/TESTING_QA.md#t02) · [T03](methods/TESTING_QA.md#t03) · [T04](methods/TESTING_QA.md#t04) · [T05](methods/TESTING_QA.md#t05) · [T08](methods/TESTING_QA.md#t08) |
| C24 | TDD·테스트 후작성·특성화·재현 | [T06](methods/TESTING_QA.md#t06) |
| C25 | 커버리지·회귀 범위 | [T04](methods/TESTING_QA.md#t04) · [T05](methods/TESTING_QA.md#t05) · [T07](methods/TESTING_QA.md#t07) |
| C26 | 타입·린트·빌드·오탐 | [T08](methods/TESTING_QA.md#t08) · [T09](methods/TESTING_QA.md#t09) |
| C27 | UI·기기·브라우저·접근성 | [T10](methods/TESTING_QA.md#t10) |
| C28 | 리뷰·V&V·완료 | [T11](methods/TESTING_QA.md#t11) |
| C29 | 추적 유지·링크·버전 | [T12](methods/TESTING_QA.md#t12) |
| C30 | 우선순위·분해·추정·진척 | [M01](methods/PROJECT_MANAGEMENT.md#m01) · [M02](methods/PROJECT_MANAGEMENT.md#m02) · [M03](methods/PROJECT_MANAGEMENT.md#m03) |
| C31 | 형상·환경·전환·복구 | [M04](methods/PROJECT_MANAGEMENT.md#m04) · [M05](methods/PROJECT_MANAGEMENT.md#m05) · [M06](methods/PROJECT_MANAGEMENT.md#m06) |
| C32 | 위험 발견·평가·FMEA·대응 | [M07](methods/PROJECT_MANAGEMENT.md#m07) |
| C33 | 반복·중요 결함·원인·방지 | [M08](methods/PROJECT_MANAGEMENT.md#m08) |
| C34 | CMMI 실무→개발 증거 | [M09](methods/PROJECT_MANAGEMENT.md#m09) · [T13](methods/TESTING_QA.md#t13) |
| C35 | 현행 결정·맥락·인수 | [M10](methods/PROJECT_MANAGEMENT.md#m10) |
| C36 | 모델·프로토타입·트윈 | [P16](methods/PLANNING_ANALYSIS.md#p16) |
| C37 | 양식 항목 분리·참조·표기 | [P06](methods/PLANNING_ANALYSIS.md#p06) · [P11](methods/PLANNING_ANALYSIS.md#p11) · [P10](methods/PLANNING_ANALYSIS.md#p10) |
| C38 | 결정표 규칙 열·병합·분모 | [T03](methods/TESTING_QA.md#t03) |
| C39 | IEEE 830·ISO 29148 관계 | [P17](methods/PLANNING_ANALYSIS.md#p17) |

C37의 실제 보완은 [기능 양식](templates/FEATURE_SPEC.md)과 [UC 양식](templates/USE_CASE.md)에 반영했다. C38은 [작성·판정 기준 §6.3](DEVELOPMENT_CRITERIA.md#testing)에도 직접 수정했다.

## 실행 문서

- [Planning·분석 P01-P17](methods/PLANNING_ANALYSIS.md): 수집·검토·모델·측정
- [설계·구현 D01-D12](methods/DESIGN_IMPLEMENTATION.md): 구조·책임·계약·데이터·실패·변경
- [테스트·QA T01-T13](methods/TESTING_QA.md): 기법·수준·도구·회귀·UI·완료·추적
- [계획·형상·위험·개선 M01-M10](methods/PROJECT_MANAGEMENT.md): 작업 관리·환경·복구·개선·맥락

## 근거의 사용

제공 PDF의 과제·실습에서 사용하는 방법을 우선했다. 부족했던 후보·표기·실행 규칙은 저자 또는 공식 문서로 보완했다. 실제 읽은 쪽수·URL과 공개 미리보기/검색 발췌 등 확인 한계는 각 실행 문서에 있다. 최신 웹 문서의 기능은 현재 설치 버전에 적용되는지 별도 확인하며, 표준 이름·링크가 전체 준수나 인증을 의미하지 않는다.
