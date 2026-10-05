# UC-[feature]-[NN]: [행위자의 목표를 동사형으로 작성]

작성 기준: [유스케이스 작성·판정](../DEVELOPMENT_CRITERIA.md#analysis)과 [P10 목표·상세도·보장 도출](../methods/PLANNING_ANALYSIS.md#p10). 강의 p.378의 Cockburn 기반 Larman Fully Dressed 양식을 EDGE에 맞게 보완했다. 아래 대괄호 안 내용은 작성 안내이며 실제 요구사항이 아니다.

## 식별·범위

- 출처·관련 요구사항: [사용자 요청 또는 FR·BR ID]
- Goal in Context: [행위자가 달성할 결과와 가치]
- Scope: [블랙박스로 볼 EDGE 사이트 또는 부분 시스템]
- Level: [user-goal/summary/subfunction; P10 목표 완료·가치 기준에 따른 이유·상위 UC]
- Format: [Fully Dressed 또는 축약; 분기·권한·상태·보장에 따른 선택 근거]
- Status: [초안 / 확정 / 보류 / 제외]

## 행위자·관심사

- Primary Actor: [목표를 요청하는 역할]
- Supporting Actors: [외부 서비스·역할 또는 해당 없음과 이유]

| Stakeholder | Interest: 성공·실패에서 보호할 관심사 |
| --- | --- |
| [역할 또는 당사자] | [관심사와 관련 보장 사항] |

## 시작과 보장

- Trigger: [시작 요청·사건]
- Preconditions: [시작 시 이미 참인 사실; 이후 확인할 입력 조건을 숨기지 않음]
- Success Guarantee: [성공 후 출력·상태·영속 데이터; 보호하는 Stakeholder Interest·BR]
- Minimal Guarantee: [실패·취소 종료에서도 지킬 데이터·상태·관심사; 모든 Extensions와 대조]

## Main Success Scenario

1. [행위자가 목표 달성을 요청한다.]
2. [시스템이 요청을 검증하고 필요한 응답을 제공한다.]
3. [행위자·시스템의 다음 책임. 내부 모듈·DB 호출은 설계에 작성한다.]
4. [시스템이 Success Guarantee를 달성하고 결과를 알린다.]

분기는 아래 Extensions에 작성한다. 실제 기본 단계 수와 내용은 유스케이스에 맞게 바꾼다.

## Extensions

| ID·관련 단계 | 분기 조건 | 행위자·시스템 처리 | 종료 또는 복귀 | 보존할 상태·관련 규칙 |
| --- | --- | --- | --- | --- |
| [2a: 기본 흐름 2번의 분기] | [조건] | [누가 어떤 결과를 제공·처리하는가] | [실패 종료 / 성공 종료 / 기본 N번 복귀] | [Minimal Guarantee·BR] |
| [*a: 여러 단계에 공통으로 적용] | [조건과 적용 범위] | [처리] | [종료/복귀] | [보존 조건] |

적용되는 잘못된 입력·권한·없는 데이터·외부 실패·상태 충돌·취소를 검토한다. 존재하지 않는 기능을 양식에 맞춰 추가하지 않는다.

## Special Requirements

- 관련 QR·BR·제약: [ID와 기준 문서 위치]
- Technology and Data Variations: [해당 데이터·입력 변형 또는 해당 없음과 이유]
- Frequency of Occurrence: [확인된 빈도·조건, 미확인이라면 미정]
- Open Issues: [미정 결정·영향 시나리오·확인 방법; 없으면 없음]

## 시스템 연산·검증 연결

| UC 단계·Extension | OP·FR·BR·QR | 인수 시나리오·TC | 기대 결과 |
| --- | --- | --- | --- |
| [기본 또는 대안·실패 경로] | [관련 ID] | [검증 ID·방법] | [성공/최소 보장과 연결] |

## 작성 검토

| 항목 | 확인 근거 | 결과 | 필요한 조치 |
| --- | --- | --- | --- |
| 출처·목표·행위자·범위 | [관련 ID·목표 목록] | [통과/수정 필요/판정 불가] | [조치 또는 없음] |
| 기본 흐름→성공 보장 | [검토한 단계·상태] | [결과] | [조치] |
| 적용되는 분기·실패→최소 보장 | [검토한 Extensions·규칙] | [결과] | [조치] |
| 핵심 미정 사항·검증 연결 | [Open Issues·TC] | [결과] | [조치] |
