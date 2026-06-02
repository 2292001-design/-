/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ClipboardList, 
  Monitor, 
  LayoutGrid, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  Users,
  Sparkles,
  ShieldAlert,
  Save,
  HelpCircle,
  Volume2,
  Compass,
  AlertCircle,
  Eye,
  BookOpen
} from 'lucide-react';
import { CHARACTERS, STAGES, DIALOGUES, ENDINGS, Character } from './gameData';
import { GameState, Direction, View } from './types';
import MainRoomScene from './components/MainRoomScene';

export default function App() {
  const [view, setView] = useState<View>('INTRO');
  const [currentScene, setCurrentScene] = useState<'intro' | 'game'>('intro');
  const [videoEnded, setVideoEnded] = useState(true); // 영상 없을 때도 타이틀 바로 표시
  const [inspectingCharacter, setInspectingCharacter] = useState<Character | null>(null);
  const [state, setState] = useState<GameState>({
    currentStageIdx: 0,
    inventory: [],
    solvedStages: [],
    selectedCharacterId: null,
    activeDialogue: null,
    ending: null,
    direction: 'SOUTH', // 시작 시 남쪽(학생 책상들)을 바라봅니다
    inspectingObject: null,
  });

  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [showSkillHint, setShowSkillHint] = useState(false);
  const [cctvTime, setCctvTime] = useState('2026-10-24 03:31:31');
  const [glitchActive, setGlitchActive] = useState(false);




  const getDirectionStyle = (dir: Direction) => {
    const baseGradient = 'linear-gradient(to bottom, rgba(10, 10, 15, 0.45), rgba(10, 10, 15, 0.82))';
    
    switch (dir) {
      case 'NORTH':
        return {
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.35), rgba(17, 24, 39, 0.15)), ${baseGradient}, url("/src/assets/images/dawn_study_room_1779356399990.png")`,
          backgroundPosition: '20% 50%',
          backgroundSize: '130% 130%',
          filter: 'hue-rotate(-5deg) contrast(1.05)',
        };
      case 'EAST':
        return {
          backgroundImage: `linear-gradient(to bottom, rgba(16, 44, 30, 0.15), rgba(9, 9, 11, 0.2)), ${baseGradient}, url("/src/assets/images/dawn_study_room_1779356399990.png")`,
          backgroundPosition: '50% 45%',
          backgroundSize: '135% 135%',
          filter: 'contrast(1.1) brightness(0.92)',
        };
      case 'SOUTH':
        return {
          backgroundImage: `${baseGradient}, url("/src/assets/images/dawn_study_room_1779356399990.png")`,
          backgroundPosition: '50% 50%',
          backgroundSize: '115% 115%',
          filter: 'contrast(1.0)',
        };
      case 'WEST':
        return {
          backgroundImage: `linear-gradient(to left, rgba(64, 15, 15, 0.18), rgba(9, 9, 11, 0.2)), ${baseGradient}, url("/src/assets/images/dawn_study_room_1779356399990.png")`,
          backgroundPosition: '80% 50%',
          backgroundSize: '125% 125%',
          filter: 'hue-rotate(10deg) contrast(1.08)',
        };
      default:
        return {};
    }
  };

  const currentStage = STAGES[state.currentStageIdx];

  // --- Real-time CCTV Digital Clock (Ticking every second) ---
  useEffect(() => {
    let baseTime = new Date('2026-10-24T03:31:31');
    const interval = setInterval(() => {
      baseTime.setSeconds(baseTime.getSeconds() + 1);
      const yy = baseTime.getFullYear();
      const mm = String(baseTime.getMonth() + 1).padStart(2, '0');
      const dd = String(baseTime.getDate()).padStart(2, '0');
      const hh = String(baseTime.getHours()).padStart(2, '0');
      const min = String(baseTime.getMinutes()).padStart(2, '0');
      const ss = String(baseTime.getSeconds()).padStart(2, '0');
      setCctvTime(`${yy}-${mm}-${dd} ${hh}:${min}:${ss}`);
      
      // Random glitch intervals to simulate surveillance camera static noise
      if (Math.random() < 0.12) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 220);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Navigation (S-class Space View transition) ---
  const rotate = (dir: 'LEFT' | 'RIGHT') => {
    const directions: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    const currentIdx = directions.indexOf(state.direction);
    let nextIdx = dir === 'LEFT' ? currentIdx - 1 : currentIdx + 1;
    if (nextIdx < 0) nextIdx = 3;
    if (nextIdx > 3) nextIdx = 0;
    
    // Set subtle transition effect
    setGlitchActive(true);
    setTimeout(() => {
      setGlitchActive(false);
      setState(prev => ({ ...prev, direction: directions[nextIdx] }));
    }, 180);
  };

  // --- Game Logic & Decoding ---
  const handleSolve = (answer: string) => {
    const rawInput = answer.replace(/\s+/g, '').toUpperCase();
    const correctAnswers = ["6-5-3", "CHOIEUNSEO", "JUSTICE", "20240514", "1324"];
    
    if (rawInput === correctAnswers[state.currentStageIdx]) {
      const stageKey = `stage${currentStage.id}_clear`;
      const dialogue = DIALOGUES.find(d => d.trigger === stageKey);
      
      const newInventory = [...state.inventory, ...currentStage.reward];
      const nextIdx = state.currentStageIdx + 1;

      setState(prev => ({
        ...prev,
        inventory: Array.from(new Set(newInventory)),
        solvedStages: [...prev.solvedStages, currentStage.id],
        activeDialogue: dialogue ? dialogue.line : null,
        inspectingObject: null,
      }));

      setMessage('단서 매칭 완료. 기록의 실마리를 잠금 해제했습니다.');
      setInput('');
      
      setTimeout(() => {
        if (nextIdx >= STAGES.length) {
          setView('ENDING_CHOICE');
        } else {
          setState(prev => ({ ...prev, currentStageIdx: nextIdx }));
        }
        setMessage('');
      }, 2200);
    } else {
      setMessage('분석 실패: 단서가 일치하지 않습니다.');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  const useCharacterSkill = () => {
    if (!state.selectedCharacterId) return;
    setShowSkillHint(true);
    setTimeout(() => setShowSkillHint(false), 5000);
  };

  // --- UI Components ---
  
  // 1. HUD Inventory & Mission Status Bar
  const HUD = () => (
    <nav className="fixed top-0 inset-x-0 p-6 flex justify-between items-start z-40 bg-gradient-to-b from-black/95 via-black/40 to-transparent pointer-events-none">
      <div className="flex items-start gap-4 pointer-events-auto">
        <div className="p-3 bg-blue-950/80 border border-blue-500/30 rounded-xl text-blue-400 crt-flicker">
          <Lock size={20} className="animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
            <h1 className="text-xs font-black tracking-widest text-zinc-400 leading-none">MEMORIES RETRIEVAL ONLINE</h1>
          </div>
          <p className="text-lg font-bold font-serif text-white mt-1">
            STAGE {state.currentStageIdx + 1}: {currentStage.title}
          </p>
          <p className="text-xs text-blue-400/80 font-mono tracking-wider mt-0.5">
            이동 임무: {currentStage.goal}
          </p>
        </div>
      </div>
      
      <div className="flex gap-4 items-center pointer-events-auto">
        <div className="px-5 py-3 bg-zinc-950/90 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">INVENTORY BAG</span>
            <span className="text-sm font-black text-blue-400 font-mono mt-1">{state.inventory.length} PACKS</span>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="flex gap-1.5">
            {state.inventory.length > 0 ? (
              state.inventory.map((item, i) => (
                <div key={i} className="px-2 py-1 bg-blue-950/40 border border-blue-800/30 rounded text-[10px] text-blue-300 font-semibold">
                  {item}
                </div>
              ))
            ) : (
              <span className="text-xs text-zinc-600 italic">빈 배낭</span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => {
            if (confirm("정말 메인 화면(타이틀)으로 나가시겠습니까? 현재 진행 상황이 리셋될 수 있습니다.")) {
              window.location.hash = '';
              setView('INTRO');
              setCurrentScene('intro');
              setVideoEnded(false);
            }
          }}
          className="px-4 py-2 bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 hover:border-red-900/50 rounded-xl text-xs text-zinc-400 hover:text-red-400 font-bold transition-all"
        >
          타이틀로
        </button>
      </div>
    </nav>
  );

  // 2. Character selection & Skill console at the bottom
  const CharacterPanel = () => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-950/90 border border-zinc-800 px-6 py-4 rounded-3xl shadow-3xl z-30 max-w-2xl w-full">
      <div className="flex flex-col shrink-0">
        <span className="text-[9px] text-zinc-500 font-black tracking-widest uppercase">INVESTIGATOR</span>
        <span className="text-xs font-bold text-white mt-1">현장 조사팀</span>
      </div>
      <div className="h-8 w-px bg-zinc-800 shrink-0" />
      <div className="flex gap-3 overflow-x-auto py-1 items-center w-full">
        {CHARACTERS.map(char => (
          <button
            key={char.id}
            onClick={() => setState(prev => ({ ...prev, selectedCharacterId: char.id }))}
            className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 text-left shrink-0
              ${state.selectedCharacterId === char.id 
                ? 'bg-blue-950/80 border-blue-500 text-white shadow-xl shadow-blue-500/10' 
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}
          >
            <div className={`p-1.5 rounded-lg ${state.selectedCharacterId === char.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
              <Users size={14} />
            </div>
            <div>
              <span className="text-xs font-black block leading-none">{char.name}</span>
              <span className="text-[9px] text-zinc-500 font-medium tracking-tight mt-1 block">{char.role}</span>
            </div>
          </button>
        ))}
      </div>
      {state.selectedCharacterId && (
        <>
          <div className="h-8 w-px bg-zinc-800 shrink-0" />
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => {
                const char = CHARACTERS.find(c => c.id === state.selectedCharacterId);
                if (char) setInspectingCharacter(char);
              }}
              className="px-4 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-extrabold rounded-2xl transition-all shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Users size={13} />
              <span>설정 일지</span>
            </button>
            <button 
              onClick={useCharacterSkill}
              className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>특수 능력</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  // 3. Ghost's fragmented dialogue overlays
  const DialogueOverlay = ({ text, onComplete }: { text: string, onComplete: () => void }) => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-12 scanline-overlay"
    >
      <div className="absolute top-0 inset-x-0 h-1 bg-red-600 animate-pulse" />
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="inline-flex flex-col items-center">
          <span className="text-[10px] text-red-500 font-mono tracking-[0.4em] mb-2 uppercase">INTERCEPTED WHISPER</span>
          <span className="text-sm font-bold text-zinc-500">- 최은서의 억울한 기억 파편 -</span>
        </div>
        <motion.p 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-serif italic text-zinc-200 leading-relaxed font-black"
        >
          &quot;{text}&quot;
        </motion.p>
        <button 
          onClick={onComplete}
          className="px-6 py-3 bg-red-950/60 border border-red-800/40 hover:bg-zinc-800 hover:border-zinc-500 text-xs font-black tracking-widest text-red-400 hover:text-white rounded-xl transition-all active:scale-95"
        >
          [ 진실을 마음속에 새기고 계속 조사하기 ]
        </button>
      </div>
    </motion.div>
  );

  // 4. Object Interaction dialog with riddles & logic triggers (No direct answers!)
  const InspectOverlay = () => {
    if (!state.inspectingObject) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
      >
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 max-w-xl w-full relative shadow-3xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600" />
          <button 
            onClick={() => { setState(prev => ({ ...prev, inspectingObject: null })); setInput(''); }}
            className="absolute top-6 right-6 p-2 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-950 text-blue-400 rounded-xl">
              <Search size={18} />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 font-mono tracking-widest leading-none block uppercase">SPATIAL INVESTIGATION / EVIDENCE</span>
              <h3 className="text-lg font-bold text-white mt-1">오브젝트 조사 결과</h3>
            </div>
          </div>
          
          <div className="p-6 bg-zinc-900/60 rounded-2xl border border-zinc-800 mb-6 text-zinc-300 whitespace-pre-wrap leading-relaxed font-serif text-[15px]">
            {getInspectContent(state.inspectingObject, state.currentStageIdx)}
          </div>

          <div className="p-6 bg-blue-950/20 border border-blue-900/30 rounded-2xl mb-8 flex gap-3">
            <HelpCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300/90 leading-relaxed font-sans">
              <span className="font-extrabold uppercase tracking-wide block mb-1">인스펙터 분석 보조</span>
              수사 내용을 확인한 뒤, 이 현장에서 추출해낸 답안 코드를 아래 터미널 콘솔에 타이핑하세요. 다른 공간의 단서와 결합해야 할 수도 있습니다.
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono text-center mb-1">Decryption Interface v3.22L</div>
            <input 
              autoFocus
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSolve(input)}
              placeholder="해독한 코드를 입력하세요... (대소문자/공백 무관)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono tracking-wide"
            />
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { setState(prev => ({ ...prev, inspectingObject: null })); setInput(''); }}
                className="py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold rounded-2xl transition-all"
              >
                메인 교실로
              </button>
              <button 
                onClick={() => handleSolve(input)}
                className="py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/10 active:scale-[0.98]"
              >
                코드 분석 실행
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // 5. Character Profile Detail Popup Modal
  const CharacterDetailModal = () => {
    if (!inspectingCharacter) return null;
    
    // Custom elaborate backstories / documentation matching each investigator's settings
    const profiles: Record<string, { backstory: string, roleDetail: string, skillDetail: string }> = {
      hong_yejin: {
        roleDetail: "S클래스의 차분한 리더이자 자습실 전반을 조율하는 역할",
        backstory: "3학년 S클래스의 임명 반장. 항상 냉철하고 흔들림이 없으며 학급 내부의 잡음과 갈등을 통제하고 조율하는 모범생이다.\n\n" +
                   "그러나, 억울하게 명단에서 제외되어 낙오해 가던 최은서를 교사들의 시선과 자신의 영예 때문에 알면서도 방관하며 침묵했던 지독한 죄책감과 부채감을 지니고 있다. " +
                   "그녀의 '시간 기억' 능력은 침묵했던 밤의 현장을 기록으로 소환하여 풀이해 준다.",
        skillDetail: "과거 자습 당시에 쓰여 있었다가 지워진 칠판 위 영예 원칙 등의 기억 지점을 정밀 필터링하여 복구합니다."
      },
      yu_miso: {
        roleDetail: "타인의 내면과 숨겨진 미세한 감정을 꿰뚫는 감성 분석가",
        backstory: "유독 감수성과 공감 능력이 예리하여 사물의 변화나 공기의 긴장을 쉽게 조율하는 소녀.\n\n" +
                   "사고 이후 자습실에 남아 도는 서늘한 온기에 기괴함을 느끼기 시작했으며, 은서의 부재가 불운한 학사 비리와 비방 등 복잡한 학업 음모로부터 번졌음을 직감하고 있었다. " +
                   "그녀의 '숨은 단서 발견' 능력은 사소한 손상 흔적이나 이니셜에서 인물의 참된 형체를 직감으로 읽어낸다.",
        skillDetail: "찢어지거나 닳아 흐릿해진 대장의 잔해, 낙서 조각에서 인물의 이름이나 감춰진 단어를 선명하게 포착합니다."
      },
      jo_hyunseo: {
        roleDetail: "수치와 논리로 구성된 트랩의 알고리즘을 꿰뚫는 수석 전략가",
        backstory: "각종 올림피아드와 수학적 알고리즘을 지배하는 천재적인 학술 고문.\n\n" +
                   "은서의 징계 사건이 어떠한 '논리적 오류와 조작'으로부터 비롯되었는지 계산하고, 복잡한 사물함 로커 트랩이나 암호 장치 뒤에 놓인 규칙성을 통전적으로 탐지해낸다. " +
                   "그녀의 '암호 해석' 능력은 다소 기괴하게 꼬아 버린 배열식 낙서 힌트를 하나의 산수 방정식으로 결합해 준다.",
        skillDetail: "공간 조치 가이드와 가속 소거 좌표를 조립해, 입력 슬롯의 배치(예컨대 '앞-왼-뒤' 규칙)를 한 번에 연산해 줍니다."
      },
      son_hyeyoon: {
        roleDetail: "무거운 정적을 깨고 돌파하는 저돌적 추진력의 행동 가속관",
        backstory: "운동부 주전으로 활약 중인, 직관적이고 거침없는 돌파 마스터.\n\n" +
                   "머리아픈 고민과 단서 배치가 정체될 때마다 신체적 돌파력과 뛰어난 행동 영역 개척을 활성화해 단서 문건을 획득한다. " +
                   "누구보다 은서를 적극적으로 아끼고 보살피려 했으나 자신의 힘이 닿지 못했던 한계를 아쉬워하고 있다.",
        skillDetail: "잠겨 있거나 감춰진 공간(서류철 등)의 최종 결재일과 식단 정보 등의 고가치 진실 일자를 저돌적으로 선착 추출해 줍니다."
      }
    };
    
    const details = profiles[inspectingCharacter.id] || { roleDetail: "", backstory: "", skillDetail: "" };
    
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
      >
        <div className="bg-zinc-950 border border-indigo-500/30 rounded-[3rem] p-8 max-w-xl w-full relative shadow-3xl overflow-hidden text-left">
          {/* Subtle Glowing Aura */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <button 
            onClick={() => setInspectingCharacter(null)}
            className="absolute top-6 right-6 p-2 bg-zinc-900 border border-zinc-805 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest leading-none block uppercase font-extrabold">{inspectingCharacter.role}</span>
              <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                {inspectingCharacter.name}
                <span className="text-xs font-normal text-zinc-500">인적 설정 일지</span>
              </h3>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <span className="text-[10px] text-zinc-500 tracking-wider uppercase block font-bold mb-1.5">교사들의 조사 기록 사유</span>
              <div className="p-5 bg-zinc-900/60 rounded-2xl border border-zinc-900 text-zinc-300 font-serif text-sm leading-relaxed whitespace-pre-wrap italic">
                {details.backstory}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
                <span className="text-[9px] text-zinc-500 tracking-wider block font-bold mb-1">상징 특징</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {inspectingCharacter.traits.map((trait, i) => (
                    <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-300 font-semibold">#{trait}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl">
                <span className="text-[9px] text-indigo-300 tracking-wider block font-bold mb-1">전용 스킬 효과</span>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  {details.skillDetail}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-end">
            <button 
              onClick={() => setInspectingCharacter(null)}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-zinc-800"
            >
              임시 관람 완료 (대장 닫기)
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // --- RENDERING VIEWS ---

  // Intro Cinematic Screen
  if (currentScene === 'intro') {
    return (
      <div 
        className="min-h-screen text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden scanline-overlay bg-zinc-950"
      >

        {/* ── 인트로 영상 재생 (videoEnded === false 일 때) ── */}
        {!videoEnded && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <video
              autoPlay
              muted={false}
              playsInline
              onEnded={() => setVideoEnded(true)}
              className="w-full h-full object-cover"
            >
              <source src="/intro.mp4" type="video/mp4" />
            </video>
            {/* 건너뛰기 버튼 */}
            <button
              onClick={() => setVideoEnded(true)}
              className="absolute bottom-10 right-10 px-5 py-2.5 bg-black/70 hover:bg-black border border-white/20 hover:border-white/50 rounded-full text-xs font-black text-zinc-300 hover:text-white transition-all cursor-pointer z-10 tracking-widest"
            >
              건너뛰기 ▶▶
            </button>
          </div>
        )}
        
        {/* Atmospheric Background Image */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: 'url("/src/assets/images/dawn_school_hallway_1779356366228.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
        />

        {/* Backdrop Tint Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/55 to-zinc-950/95 z-0 pointer-events-none" />

        {/* CRT Scanline bars and flicker */}
        <div className="absolute inset-0 scanline-bar bg-white/[0.01] h-32 w-full select-none pointer-events-none z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl w-full relative z-10 space-y-12 text-center py-12"
        >
            {/* Subtle upper metadata */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-950/50 border border-indigo-800/30 rounded-full text-[10px] font-black tracking-[0.4em] text-indigo-400 crt-flicker">
              <Volume2 size={12} className="animate-pulse" />
              <span>MYSTERY THRILLER: THE CURSE OF FORGOTTEN MEMORIES</span>
            </div>

            {/* Title Area with Glitch Typography */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black font-serif italic text-white tracking-tighter glitch-text pt-2 leading-tight">
                잊혀진 기억의 저주
              </h1>
            </div>

            <div className="max-w-xl mx-auto p-6 bg-zinc-950/80 border border-zinc-800/60 rounded-3xl backdrop-blur space-y-4">
              <p className="text-sm text-zinc-400 font-serif leading-relaxed italic">
                &quot;아무도 없는 한밤중의 S클래스 우등생 자습실.<br />
                억울하게 명단에서 지워지고 버림받은 5번째 소녀, <strong className="text-red-400 font-sans font-bold">최은서</strong>.<br />
                <span className="text-red-400 font-sans font-bold block mt-1.5 mb-1.5">&quot;그녀의 분노는 우리를 자습실에 가뒀다.&quot;</span>
                그녀의 왜곡된 편지와 은밀한 징계 일지가 퍼즐이 되어 자습실을 봉인했다.<br />
                4명의 동급생 친구들과 함께 잊혀진 기억의 코드를 복원하고 탈출하라.&quot;
              </p>
              <div className="h-px bg-zinc-800" />
              <div className="flex justify-around text-left pt-2 font-sans">
                <div className="text-center">
                  <span className="block text-[10px] text-zinc-500 font-mono tracking-widest">DIFFICULTY</span>
                  <span className="text-sm font-black text-amber-500">★★★☆☆</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] text-zinc-500 font-mono tracking-widest">PERSISTENCE</span>
                  <span className="text-sm font-black text-blue-400">PERSISTENT MEMORY</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] text-zinc-500 font-mono tracking-widest">VERSION</span>
                  <span className="text-sm font-black text-zinc-300 font-mono">v3.5 G-CRT</span>
                </div>
              </div>
            </div>

            {/* Character Profiles Grid on Title Page (Clickable Detail Openers) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              {CHARACTERS.map(char => (
                <button 
                  key={char.id} 
                  onClick={(e) => { e.stopPropagation(); setInspectingCharacter(char); }}
                  className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl hover:border-blue-500/50 hover:bg-zinc-900/80 transition-all group text-left cursor-pointer w-full focus:outline-none"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">{char.role}</span>
                    <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 py-0.2 rounded font-mono group-hover:bg-indigo-900/80 group-hover:text-indigo-200 transition-colors">[설정보기]</span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1 group-hover:text-blue-400 transition-colors">{char.name}</h4>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {char.traits.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-zinc-800/80 rounded text-[9px] text-zinc-400 font-semibold font-sans">#{t}</span>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-800/80">
                    <span className="text-[9px] text-blue-300 font-semibold block">능력: {char.skill}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Action Trigger */}
            <div className="pt-4">
              <button 
                id="start-game-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setState(prev => ({
                    ...prev,
                    selectedCharacterId: prev.selectedCharacterId || CHARACTERS[0].id
                  }));
                  setView('MAIN');
                  setCurrentScene('game');
                }}
                className="px-12 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-600 hover:to-indigo-600 hover:scale-105 text-white font-black tracking-widest rounded-2xl shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-sm pulse-glowing cursor-pointer"
              >
                자습실 CCTV 기기 연동 및 잠입 개시
              </button>
              <p className="mt-3 text-[10px] text-zinc-500 font-mono tracking-widest uppercase">CONNECTION STABLE: PORT 3000 SECURE</p>
            </div>
          </motion.div>
      </div>
    );
  }

  // Final Endings Choice View
  if (state.ending) {
    const endingContent = ENDINGS.find(e => e.id === state.ending);
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white text-center scanline-overlay">
        <div className="max-w-xl w-full space-y-8 bg-zinc-900/40 border border-zinc-800 p-12 rounded-[3.5rem] relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-500 rounded-t-full" />
          <h2 className="text-zinc-500 text-xs font-bold tracking-[0.5em] uppercase font-mono">CONCLUDED SCENARIO</h2>
          <h1 className="text-6xl font-black font-serif italic text-amber-500">{endingContent?.name}</h1>
          <div className="p-6 bg-zinc-950 rounded-3xl border border-zinc-800 text-zinc-300 font-serif leading-relaxed text-lg italic whitespace-pre-line">
            &quot;{endingContent?.result}&quot;
          </div>
          <div className="pt-6">
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95 text-xs tracking-widest uppercase"
            >
              자습실 타이틀 화면으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN GAME SCREEN (Spatial Escape View)
  return (
    <>
      <MainRoomScene
        state={state}
        setState={setState}
        setView={setView}
        onSolve={handleSolve}
        input={input}
        setInput={setInput}
        message={message}
        setMessage={setMessage}
        showSkillHint={showSkillHint}
        setShowSkillHint={setShowSkillHint}
        cctvTime={cctvTime}
        glitchActive={glitchActive}
        rotate={rotate}
        useCharacterSkill={useCharacterSkill}
        setInspectingCharacter={setInspectingCharacter}
        characters={CHARACTERS}
        stages={STAGES}
        endings={ENDINGS}
        getInspectContent={getInspectContent}
        getSkillHint={getSkillHint}
      />

      <AnimatePresence>
        {inspectingCharacter && (
          <CharacterDetailModal />
        )}
        {state.activeDialogue && (
          <DialogueOverlay 
            text={state.activeDialogue} 
            onComplete={() => setState(prev => ({ ...prev, activeDialogue: null }))} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 inset-x-0 flex justify-center z-[100] pointer-events-none"
          >
            <div className="bg-white text-black px-8 py-3.5 rounded-full font-extrabold shadow-2xl text-xs tracking-wider border border-zinc-200">
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


// --- Specific Content Helpers (Riddles ONLY - Correct answers kept out completely!) ---

function getInspectContent(objectId: string, stageIdx: number) {
  const contentMap: Record<string, string> = {
    lockers: "회색 철제 사물함의 한 칸에는 은서의 영문 이름표가 성만 쓸쓸히 남은 채 찢겨 있고 날카로운 칼 낙서가 박혀 있습니다.\n" +
             "낙서 내용:\n" +
             "\"앞에서 6번째 여학생, 왼쪽에서 5번째 줄, 뒤에서 3번째 남학생... 그 자리가 결국 누구의 자리였지? 도망친 날을 복원해.\"\n\n" +
             "동료들의 책상(또는 칠판)에 조인된 위치 가이드 힌트와 조합하면 'X-X-X' 구조의 3자리 코드를 해독할 수 있을 것 같습니다.",
             
    bulletin: "S클래스 학기말 우수 활동 포상 명단 대장이 너덜대고 있습니다.\n" +
              "하지만 '대상' 수상자 칸은 가혹하게 커터칼로 긁혀있어 알파벳의 잔해만 남아 있습니다.\n" +
              "잔해 해독:\n" +
              "\"C _ _ I _ _ N S _ O ...\"\n\n" +
              "그녀를 기억하는 친구들의 직감이나 지혜(미소의 능력)를 발휘한다면 이 잔혹한 흔적에서 지워진 소녀의 10글자 풀네임 영문 대문자를 도출할 수 있을 것입니다.",
              
    chalkboard: "칠판에는 새벽 자습을 상징하는 거친 분필 자국과 '자습실에서 행동해야 할 우리들의 모순적 책임감'에 관한 훈계가 쓰여있습니다.\n" +
                "그 밑바닥 한 편에 잊으려 침 발라 지웠으나 흐릿하게 올라온 단어가 있습니다:\n" +
                "\"징계 심의를 무마하고자 합의했던 그날 밤, 칠판 위에 걸렸던 빛바랜 자습실 원칙 7글자: J _ S _ _ C _\"\n\n" +
                "이를 조력하는 기억력(예진의 능력)과 맞닿으면 이 가치의 영문 대문자를 맞출 수 있습니다.",
                
    podium: "교탁 위에는 스탠드 라이트가 노란 불빛을 뿜으며 서류철을 비추고 있습니다.\n" +
            "기록철 제목: [자습실 5급 징계 사안 대장철 (최은서)]\n" +
            "내용물:\n" +
            "\"최종 결정 공시일: 2024년 5월 OO일요일.\"\n" +
            "해당 날짜에 선명하게 붉은 인주 도장이 찍혔으나 끝자리가 지워졌습니다. 대장 뒤편의 학사 일정 보조 달력에는 다음과 같이 쓰여 있습니다:\n" +
            "\"2024년 5월의 매주 수요일 목록: 1일, 8일, 15일, 22일, 29일\"\n\n" +
            "사건이 일어났던 특별한 하루(식수대 혹은 혜윤의 정보)를 분석하면 'YYYYMMDD' 구조의 8자리 최종 통보일을 획득할 수 있습니다.",
            
    door: "자습실의 유일한 구원 통로인 철제 문입니다. 강력한 4자리 전자 도어락이 붉게 감겨 있습니다.\n" +
          "시스템 연동 설명서:\n" +
          "\"전원 공급 장치 작동 요망. 이 자습실에 마지막까지 영예를 지키던 4인의 인스펙터 리더들이 책상에 남긴 지시 순서대로 동시 보안 조교 코드를 입력하십시오.\"\n" +
          "장치 아래에는 4인의 영문 기호 슬롯이 새겨져 있습니다:\n" +
          "예진 [1] ─ 현서 [3] ─ 혜윤 [2] ─ 미소 [4]\n\n" +
          "남쪽 벽면의 자습 책상 라인에서 각자 기록한 일기 순서도에 따라 4자리 기호 번호 순을 배열하여 입력하십시오.",
          
    desks: "네 명의 현장 대원(예진, 혜윤, 현서, 미소)의 책상 서랍에 일기장 파편들이 어질러져 있습니다.\n\n" +
           "📝 예진의 노트 조각:\n" +
           "\"탈출 암호 순서는 앉아있는 인물들의 성향 가치 순이다. 리더로서 통제를 잡는 내가 1번, 내 뒤를 든든히 보조하는 거침없는 전사 혜윤이가 3번, 명석하여 암호를 꿰뚫는 현서가 2번, 그리고 의심과 공감 많은 미소가 4번 순으로 입력해야 작동한다.\"\n\n" +
           "위에 기록된 4인의 매칭 슬롯 순서를 소거법으로 조합하면 도어락을 해독할 4자리 암호 배열을 명확하게 도출해낼 수 있습니다.",
           
    water: "정수기의 파란 원통에는 찬 물빛이 고요하게 요동치고 있습니다.\n" +
           "식수대 받침대 밑에 낡은 식단표 스티커 하나가 빛바래 붙어있습니다:\n" +
           "\"2024년 5월 14일 화요일 배식 ─ 자습실 긴급 소등 및 소방 점검의 날\""
  };
  return contentMap[objectId] || "특별한 점을 발견할 수 없습니다. 교실의 다른 구역을 돌아보십시오.";
}

function getSkillHint(stageIdx: number, charId: string) {
  // Enhanced skill hints which direct layout and logic without directly stating the answers
  if (charId === 'jo_hyunseo') {
    return "현서의 해킹 분석: \"사물함의 낙서 내용(앞, 왼, 뒤)에 해당하는 숫자들을 하이픈(-)으로 조립해 봐. 예컨대 '앞-왼-뒤'니까 6번째, 5번째, 3번째를 이으면... 6-5-3이 되겠지?\"";
  }
  if (charId === 'yu_miso') {
    return "미소의 관찰 직감: \"수상 게시판에 흐릿하게 남은 이니셜 'C _ _ I _ _ N S _ O'는 우리를 원망하며 사라진 우리 반 친구 '최은서'의 풀네임 영학자표 같아. 영어로 'CHOIEUNSEO'라고 입력하면 암호가 분석될 듯해!\"";
  }
  if (charId === 'hong_yejin') {
    return "예진의 통제 기억: \"그날 회의 때 교단 위에 있던 훈장 표어는 바로 '정의(正義)'였어. 영어로 'J_U_S_T_I_C_E'를 대문자로 조합해 기재해보자!\"";
  }
  if (charId === 'son_hyeyoon') {
    return "혜윤의 저돌적 해결책: \"교탁의 징계 문서에는 5월 OO일요일이라 되어 있고, 정수기 식단표에는 2024년 5월 14일 화요일이라고 적혀 있어! 학사력을 보니까 5월 15일이 수요일이었잖아? 그럼 바로 그 전날 화요일인 '20240514'가 도어로크를 열 일자가 틀림없어!\"";
  }
  return "팀원을 하단 슬롯에서 교체하면 전용 조사 스킬을 발동할 수 있습니다.";
}
