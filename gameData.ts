/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Character {
  id: string;
  name: string;
  role: string;
  traits: string[];
  skill: string;
}

export interface Stage {
  id: number;
  title: string;
  goal: string;
  difficulty: number;
  reward: string[];
}

export interface Dialogue {
  trigger: string;
  speaker: string;
  line: string;
}

export interface Ending {
  id: string;
  name: string;
  condition: string;
  result: string;
}

export const CHARACTERS: Character[] = [
  { id: 'hong_yejin', name: '홍예진', role: '리더형 안정가', traits: ['통제', '안정', '책임감'], skill: '시간 기억' },
  { id: 'yu_miso', name: '유미소', role: '직감형 관찰자', traits: ['공감', '의심', '직감'], skill: '숨은 단서 발견' },
  { id: 'jo_hyunseo', name: '조현서', role: '분석형 전략가', traits: ['논리', '분석', '확신'], skill: '암호 해석' },
  { id: 'son_hyeyoon', name: '손혜윤', role: '행동형 돌파가', traits: ['행동', '돌파', '추진력'], skill: '강제 진행' },
];

export const STAGES: Stage[] = [
  { id: 1, title: '그날의 자리', goal: '자리 배치 복원', difficulty: 2, reward: ['낡은 필통', '배후 편지1'] },
  { id: 2, title: '지워진 이름', goal: '수상 명단 복원', difficulty: 3, reward: ['컴퓨터 1차 잠금 해제'] },
  { id: 3, title: '너희의 선택', goal: '진술서 조합', difficulty: 4, reward: ['컴퓨터 2차 잠금 해제'] },
  { id: 4, title: '진실의 코드', goal: '징계 기록 복원', difficulty: 5, reward: ['징계 기록 전문'] },
  { id: 5, title: '문을 열어라', goal: '4인 동시 입력', difficulty: 1, reward: ['탈출'] },
];

export const DIALOGUES: Dialogue[] = [
  { trigger: 'stage1_clear', speaker: '최은서', line: '맞아. 그 자리가 내 자리였어.' },
  { trigger: 'stage2_clear', speaker: '최은서', line: '내 이름이 지워지는 데 걸린 시간은 하루였어.' },
  { trigger: 'stage4_clear', speaker: '최은서', line: '나는 아무것도 안 했어.' },
];

export const ENDINGS: Ending[] = [
  { id: 'unity', name: '연대 엔딩', condition: '진실 대면 선택', result: '최은서와 화해합니다.' },
  { id: 'escape', name: '탈출 엔딩', condition: '진실 회피', result: '최은서는 자습실에 남겨집니다.' },
  { id: 'reconcile', name: '화해 엔딩', condition: '최은서에게 말을 건다', result: '최은서와 함께 탈출합니다.' },
];
