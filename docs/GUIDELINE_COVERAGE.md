# 기준선 전체 구간의 조사 범위

2026-10-03 수정 전 다섯 문서의 388개 구간을 모두 C01-C39 또는 K01-K08에 연결했다. 이는 388개 독립 요구사항 또는 388개 테스트를 뜻하지 않는다. 본문·표 머리글·양식 안내와 코드블록 안 양식 제목도 포함한다.

아래는 절 단위 요약이다. 각 구간의 원문·수정 전 줄 번호·분류·방법 ID는 [전체 대응 기록 JSON](audit/BASELINE_COVERAGE.json)에 있다. C는 방법 보완 주제, K는 기존 구체 지시·메타정보 유지다. 한 구간의 명확한 부분을 유지하면서 실행 방법을 추가한 경우 둘 다 연결한다. 원문의 반복은 같은 조사 주제로 묶었으며 형식상 ID가 연결된 것과 실제 방법의 적절성은 구별해 읽기 대조했다.

[감사 항목·유지 이유](GUIDELINE_AUDIT.md) / [항목별 실행 방법](METHOD_CATALOG.md)

| 수정 전 파일·절 | 구간 ID | 구간 수 | 대응 주제 |
| --- | --- | --- | --- |
| AGENTS.md · 적용 범위와 기준 | U001–U004 | 4 | C02 · K01 · K02 · K08 |
| AGENTS.md · 작업 방식 | U005–U014 | 10 | C01 · C02 · C03 · C04 · C05 · C06 · C09 · C10 · C11 · C15 · C17 · C23 · C25 · C29 · C35 · C37 · K03 · K06 · K07 |
| AGENTS.md · 진단서와 수정 범위 | U015–U019 | 5 | C19 · C20 · C21 · C22 · K03 · K04 |
| AGENTS.md · 결과 보고 | U020–U022 | 3 | K02 · K05 |
| docs/DEVELOPMENT_GUIDELINES.md · 1. 목적과 해석 | U023–U029 | 7 | C02 · C04 · C05 · C22 · C23 · C29 · C34 · K01 · K02 · K06 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 2. 변경 규모에 맞는 기록 | U030–U035 | 6 | C01 · C02 · K03 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 3. Planning: 목적과 요구사항 | U036–U044 | 9 | C03 · C04 · C05 · C06 · C07 · C08 · C23 · C28 · C35 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 4. OOA: 사용자와 도메인 분석 | U045–U052 | 8 | C09 · C10 · C11 · C12 · C13 · C14 · C16 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 5. OOD: 구조와 인터페이스 설계 | U053–U060 | 8 | C15 · C16 · C17 · C18 · C19 · C20 · C22 · C28 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 6. 구현·테스트 | U061–U068 | 8 | C21 · C22 · C23 · C24 · C25 · C26 · C28 · K06 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 7. QA와 완료 판정 | U069–U076 | 8 | C25 · C26 · C27 · C28 · C29 · C33 · K01 · K05 · K06 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 8. 필요한 CMMI 실무만 적용 | U077–U085 | 9 | C28 · C29 · C30 · C31 · C32 · C33 · C34 · C35 · K02 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 9. 추가로 채택한 프로젝트 적용 원칙 | U086–U091 | 6 | C02 · C18 · C21 · C31 · C35 · K06 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 10. 기능 기록의 최소 양식 | U092–U110 | 19 | C02 · C03 · C04 · C06 · C09 · C10 · C12 · C13 · C15 · C16 · C17 · C25 · C26 · C28 · C29 · C30 · C31 · C32 · C33 · C35 · K06 · K07 · K08 |
| docs/DEVELOPMENT_GUIDELINES.md · 11. PDF 근거와 채택 이유 | U111–U128 | 18 | C01 · C06 · C07 · C08 · C09 · C11 · C12 · C13 · C14 · C15 · C17 · C19 · C20 · C21 · C23 · C24 · C25 · C26 · C28 · C29 · C30 · C31 · C33 · C34 · C35 · C36 · C39 · K02 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · EDGE 개발: 작성 방법과 판정 기준 | U129–U129 | 1 | K06 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 1. 채택한 형식과 근거 | U130–U137 | 8 | C05 · C08 · C09 · C16 · C23 · C25 · C26 · C39 · K07 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 2. 공통 판정 방식 | U138–U145 | 8 | C06 · K03 · K07 |
| docs/DEVELOPMENT_CRITERIA.md · 3.1 요구사항 한 개에 포함할 내용 | U146–U157 | 12 | C03 · C04 · C23 · C29 · C30 · C35 · K07 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 3.2 요구사항 검토 판정표 | U158–U170 | 13 | C05 · C06 · C29 · C30 · K07 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 3.3 완전성 확인에 사용할 분류 | U171–U179 | 9 | C02 · C03 · C04 · C05 · C07 · C09 · C13 · C18 · K07 |
| docs/DEVELOPMENT_CRITERIA.md · 3.4 품질 목표를 QAS로 작성하는 방법 | U180–U190 | 11 | C08 · C17 · K07 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 4.1 유스케이스를 도출하는 절차 | U191–U195 | 5 | C09 · K07 |
| docs/DEVELOPMENT_CRITERIA.md · 4.2 어떤 양식을 언제 사용하는가 | U196–U199 | 4 | C09 · K07 |
| docs/DEVELOPMENT_CRITERIA.md · 4.3 필드별 작성 규칙 | U200–U214 | 15 | C09 · C17 · C18 · K07 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 4.4 유스케이스 완료 판정 | U215–U221 | 7 | C06 · C09 · K07 |
| docs/DEVELOPMENT_CRITERIA.md · 4.5 도메인·데이터·시스템 연산의 구체적 내용 | U222–U227 | 6 | C10 · C11 · C12 · K07 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 4.6 모델 선택과 검사 기준 | U228–U235 | 8 | C03 · C10 · C12 · C13 · C16 · C18 · K07 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 5.1 설계에서 빠뜨리지 않을 정보 | U236–U241 | 6 | C15 · C17 · C18 · C19 |
| docs/DEVELOPMENT_CRITERIA.md · 5.2 추상 설계 원칙을 코드에서 판정하는 방법 | U242–U249 | 8 | C15 · C20 · C22 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 5.3 설계 통과 조건 | U250–U250 | 1 | C15 · C17 · C18 · C28 |
| docs/DEVELOPMENT_CRITERIA.md · 6.1 테스트 케이스 한 개의 필드 | U251–U252 | 2 | C23 · K06 · K07 |
| docs/DEVELOPMENT_CRITERIA.md · 6.2 변경에 따라 필요한 테스트 수준 | U253–U261 | 9 | C23 · C27 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 6.3 입력·상태에서 테스트를 도출하는 규칙 | U262–U267 | 6 | C13 · C18 · C23 · C25 · C38 |
| docs/DEVELOPMENT_CRITERIA.md · 6.4 사용할 도구와 실행 기록 | U268–U271 | 4 | C21 · C23 · C26 · K03 · K07 |
| docs/DEVELOPMENT_CRITERIA.md · 7.1 단계별 필요한 증거 | U272–U278 | 7 | C01 · C02 · C05 · C09 · C10 · C11 · C13 · C15 · C17 · C18 · C23 · C28 · C29 · K06 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 7.2 추적 표와 누락 판정 | U279–U285 | 7 | C25 · C28 · C29 · K06 · K07 |
| docs/DEVELOPMENT_CRITERIA.md · 7.3 Verification과 Validation의 구체적 구별 | U286–U288 | 3 | C28 · K03 · K06 |
| docs/DEVELOPMENT_CRITERIA.md · 8. CMMI·위험·변경 관리의 최소 실행 기준 | U289–U298 | 10 | C02 · C18 · C28 · C29 · C30 · C31 · C32 · C33 · C34 · C35 · K08 |
| docs/DEVELOPMENT_CRITERIA.md · 9. 실제 작성에 사용할 파일 | U299–U301 | 3 | C06 · C09 · C37 · K06 · K08 |
| docs/templates/USE_CASE.md · UC-[feature]-[NN]: [행위자의 목표를 동사형으로 작성] | U302–U302 | 1 | C09 · C37 · K08 |
| docs/templates/USE_CASE.md · 식별·범위 | U303–U308 | 6 | C09 · K07 |
| docs/templates/USE_CASE.md · 행위자·관심사 | U309–U312 | 4 | C09 · K07 |
| docs/templates/USE_CASE.md · 시작과 보장 | U313–U316 | 4 | C09 · K07 |
| docs/templates/USE_CASE.md · Main Success Scenario | U317–U321 | 5 | C09 · K07 |
| docs/templates/USE_CASE.md · Extensions | U322–U325 | 4 | C09 · C23 · K03 · K07 |
| docs/templates/USE_CASE.md · Special Requirements | U326–U329 | 4 | C06 · C07 · C08 · C09 · K06 |
| docs/templates/USE_CASE.md · 시스템 연산·검증 연결 | U330–U331 | 2 | C11 · C23 · C29 |
| docs/templates/USE_CASE.md · 작성 검토 | U332–U336 | 5 | C06 · C09 · C29 · K07 · K08 |
| docs/templates/FEATURE_SPEC.md · [기능 또는 변경 이름] | U337–U337 | 1 | C02 · K07 · K08 |
| docs/templates/FEATURE_SPEC.md · 1. 목적·범위·결정 | U338–U346 | 9 | C03 · C04 · C06 · C09 · C29 · C30 · C31 · C35 |
| docs/templates/FEATURE_SPEC.md · 2. 요구사항과 인수 기준 | U347–U348 | 2 | C04 · K07 |
| docs/templates/FEATURE_SPEC.md · 품질 요구사항(QAS) | U349–U350 | 2 | C08 · K07 |
| docs/templates/FEATURE_SPEC.md · 요구사항 검토 | U351–U360 | 10 | C05 · C23 · C29 · C30 · C32 · C37 · K08 |
| docs/templates/FEATURE_SPEC.md · 유스케이스 | U361–U361 | 1 | C09 · K08 |
| docs/templates/FEATURE_SPEC.md · 도메인·데이터 | U362–U363 | 2 | C10 · C37 |
| docs/templates/FEATURE_SPEC.md · 시스템 연산 | U364–U367 | 4 | C02 · C11 · C12 · C13 · C16 · C37 |
| docs/templates/FEATURE_SPEC.md · 4. OOD | U368–U372 | 5 | C15 · C16 · C17 · C18 · C19 · C20 · C37 |
| docs/templates/FEATURE_SPEC.md · 검증 계획·실행 | U373–U378 | 6 | C23 · C25 · C26 · C33 · K07 |
| docs/templates/FEATURE_SPEC.md · 추적 | U379–U384 | 6 | C28 · C29 · K06 |
| docs/templates/FEATURE_SPEC.md · 6. 변경·위험·개선 기록 | U385–U388 | 4 | C31 · C32 · C33 · C35 |

## 대조 기준

- U001–U388이 정확히 한 번씩 존재하고 모든 구간에 유효한 C/K 분류가 있어야 한다.
- 모든 C01–C39에 PDF/공식 근거와 후보·선택·수행·산출물·판정·축약이 있는 실제 방법 위치가 있어야 한다.
- K는 명확한 사용자 정책·판정 필드·참조 정보만 유지하며 남은 실행·선택 문제는 C에 연결한다.
- 해시와 원문 줄은 수정 전 기준선이다. 수정 후 파일의 현재 줄과 같다고 간주하지 않는다.
- 이 감사 증거를 기능 개발의 필수 새 보고서 양식으로 반복 적용하지 않는다.
