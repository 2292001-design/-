/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  Compass,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Character, Stage, Ending } from '../gameData';
import { GameState, Direction } from '../types';

interface MainRoomSceneProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  setView: (view: 'INTRO' | 'MAIN' | 'ENDING_CHOICE') => void;
  onSolve: (answer: string) => void;
  input: string;
  setInput: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  showSkillHint: boolean;
  setShowSkillHint: (val: boolean) => void;
  cctvTime: string;
  glitchActive: boolean;
  rotate: (dir: 'LEFT' | 'RIGHT') => void;
  useCharacterSkill: () => void;
  setInspectingCharacter: (char: Character | null) => void;
  characters: Character[];
  stages: Stage[];
  endings: Ending[];
  getInspectContent: (objectId: string, stageIdx: number) => string;
  getSkillHint: (stageIdx: number, charId: string) => string;
}

export default function MainRoomScene({
  state,
  setState,
  setView,
  onSolve,
  input,
  setInput,
  message,
  setMessage,
  showSkillHint,
  setShowSkillHint,
  cctvTime,
  glitchActive,
  rotate,
  useCharacterSkill,
  setInspectingCharacter,
  characters,
  stages,
  endings,
  getInspectContent,
  getSkillHint,
}: MainRoomSceneProps) {

  const currentStage = stages[state.currentStageIdx] || stages[stages.length - 1];

  const getDirectionStyle = (dir: Direction) => {
    const baseGradient = 'linear-gradient(to bottom, rgba(10, 10, 15, 0.45), rgba(10, 10, 15, 0.82))';
    const dawnImage = "/dawn_study_room_1779356399990.png";
    
    switch (dir) {
      case 'NORTH':
        return {
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.35), rgba(17, 24, 39, 0.15)), ${baseGradient}, url("${dawnImage}")`,
          backgroundPosition: '20% 50%',
          backgroundSize: '130% 130%',
          filter: 'hue-rotate(-5deg) contrast(1.05)',
        };
      case 'EAST':
        return {
          backgroundImage: `linear-gradient(to bottom, rgba(16, 44, 30, 0.15), rgba(9, 9, 11, 0.2)), ${baseGradient}, url("${dawnImage}")`,
          backgroundPosition: '50% 45%',
          backgroundSize: '135% 135%',
          filter: 'contrast(1.1) brightness(0.92)',
        };
      case 'SOUTH':
        return {
          backgroundImage: `${baseGradient}, url("${dawnImage}")`,
          backgroundPosition: '50% 50%',
          backgroundSize: '115% 115%',
          filter: 'contrast(1.0)',
        };
      case 'WEST':
        return {
          backgroundImage: `linear-gradient(to left, rgba(64, 15, 15, 0.18), rgba(9, 9, 11, 0.2)), ${baseGradient}, url("${dawnImage}")`,
          backgroundPosition: '80% 50%',
          backgroundSize: '125% 125%',
          filter: 'hue-rotate(10deg) contrast(1.08)',
        };
      default:
        return {};
    }
  };

  // Safe wrapper for custom icons so React.cloneElement behaves predictably
  const renderIcon = (type: string) => {
    switch (type) {
      case 'bulletin': return <ClipboardList size={28} />;
      case 'water': return <Search size={28} />;
      case 'chalkboard': return <LayoutGrid size={28} />;
      case 'podium': return <Monitor size={28} />;
      case 'desks': return <Users size={28} />;
      case 'lockers': return <LayoutGrid size={28} />;
      case 'door': return <Lock size={28} />;
      default: return <Search size={28} />;
    }
  };

  const currentWallConfig = {
    NORTH: {
      title: "게시판 & 정수기 벽면",
      desc: "우등 자습 명단과 오래된 식수대가 놓인 교실의 북쪽 기독 부분입니다.",
      objects: [
        { id: 'bulletin', label: '우등 수상 게시판', iconType: 'bulletin', pos: { top: '35%', left: '30%' }, theme: 'border-zinc-800 hover:border-amber-500/50 hover:bg-amber-950/10' },
        { id: 'water', label: '정수기 식수대', iconType: 'water', pos: { bottom: '30%', right: '30%' }, theme: 'border-zinc-800 hover:border-blue-500/50 hover:bg-blue-950/10' }
      ]
    },
    EAST: {
      title: "교단 & 거대 칠판 강단",
      desc: "교사가 감시하던 높은 강단과 희뿌연 낙서들로 뒤덮인 칠판 벽면입니다.",
      objects: [
        { id: 'chalkboard', label: '자습실 중앙 칠판', iconType: 'chalkboard', pos: { top: '25%', left: '70%' }, theme: 'border-green-900/30 hover:border-green-500/50 hover:bg-green-950/10' },
        { id: 'podium', label: '교탁 (스탠드 조명)', iconType: 'podium', pos: { bottom: '25%', left: '50%' }, theme: 'border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 shadow-amber-500/5' }
      ]
    },
    SOUTH: {
      title: "동료들의 자습 책상 라인",
      desc: "홍예진, 손혜윤, 유미소, 조현서의 개인 공부 책상과 흩어진 펜들입니다.",
      objects: [
        { id: 'desks', label: '4인의 자습 책상 무리', iconType: 'desks', pos: { bottom: '35%', left: '50%' }, theme: 'border-amber-900/20 hover:border-amber-400/50 hover:bg-amber-950/10' }
      ]
    },
    WEST: {
      title: "사물함 & 메인 출입문",
      desc: "개인 철제 사물함 캐비닛실과 강력하게 차단된 도어락 로크 개방문입니다.",
      objects: [
        { id: 'lockers', label: '회색 철제 사물함 캐비닛', iconType: 'lockers', pos: { top: '35%', left: '30%' }, theme: 'border-zinc-800 hover:border-teal-500/50 hover:bg-teal-950/10' },
        { id: 'door', label: '비상용 디지털 도어락', iconType: 'door', pos: { top: '45%', right: '30%' }, theme: 'border-red-900/30 hover:border-red-500/50 hover:bg-red-950/10' }
      ]
    }
  };

  const currentWall = currentWallConfig[state.direction];

  return (
    <div
  className="min-h-screen text-zinc-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative"
  style={getDirectionStyle(state.direction)}
>
      
      {/* 1. HUD System Header (Inventory & Stage Info) */}
      <nav id="game-hud" className="fixed top-0 inset-x-0 p-6 flex justify-between items-start z-40 bg-gradient-to-b from-black/95 via-black/40 to-transparent pointer-events-none">
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
              STAGE {state.currentStageIdx + 1}: {currentStage?.title}
            </p>
            <p className="text-xs text-blue-400/80 font-mono tracking-wider mt-0.5">
              이동 임무: {currentStage?.goal} (난이도: {Array(currentStage?.difficulty || 3).fill('★').join('')})
            </p>
          </div>
        </div>
        
  <div className="flex gap-4 items-center pointer-events-auto">

  <div className="px-5 py-3 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-xl">
    <span className="text-sm font-black text-blue-400">
      단서 {state.inventory.length}개
    </span>
  </div>

  <button
    id="go-to-title-btn"
    onClick={() => {
      if (confirm("정말 메인 화면(타이틀)으로 나가시겠습니까? 현재 진행 상황이 리셋될 수 있습니다.")) {
        setView('INTRO');
        window.location.reload();
      }
    }}
    className="px-4 py-2 bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 hover:border-red-900/50 rounded-xl text-xs text-zinc-400 hover:text-red-400 font-bold transition-all cursor-pointer"
  >
    타이틀로
  </button>

</div>
      </nav>

      {/* Screen Noise & Glitch simulator on view changes (Transition feel) */}
      <AnimatePresence>
        {glitchActive && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/20 z-[80] pointer-events-none crt-flicker mix-blend-difference"
          />
        )}
      </AnimatePresence>

      {/* Left/Right Navigation Arrows to turn around */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40">
        <button 
          id="nav-left-btn"
          onClick={() => rotate('LEFT')}
          className="p-5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-full text-white backdrop-blur shadow-2xl transition-all active:scale-90 flex items-center justify-center cursor-pointer group"
          title="왼쪽 벽면으로"
        >
          <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
        <button 
          id="nav-right-btn"
          onClick={() => rotate('RIGHT')}
          className="p-5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-full text-white backdrop-blur shadow-2xl transition-all active:scale-90 flex items-center justify-center cursor-pointer group"
          title="오른쪽 벽면으로"
        >
          <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Surveillance Camera Simulation Frame representing classroom view */}
      <main id="surveillance-container" className="relative h-screen w-full flex items-center justify-center p-12 transition-all duration-700">
        
        {/* Soft grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 to-zinc-950 opacity-90 select-none pointer-events-none" />
        
        <div 
          id="cctv-lens-view"
          className="relative z-10 w-full max-w-5xl h-[650px] rounded-[3.5rem] border border-zinc-800 shadow-3xl overflow-hidden flex flex-col pt-16 pb-6 bg-zinc-950 transition-all duration-700"
          style={getDirectionStyle(state.direction)}
        >
          
          {/* CCTV Rec Overlay */}
          <div className="absolute top-6 left-8 flex items-center gap-2 z-20 select-none bg-black/60 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
            <span className="text-[10px] text-red-500 font-extrabold tracking-widest leading-none">REC 🔴</span>
          </div>

          <div className="absolute top-6 right-8 flex flex-col items-end gap-1 z-20 select-none bg-black/60 px-4 py-2 rounded-lg border border-white/5 font-mono text-[10px] text-zinc-400">
            <span className="font-extrabold tracking-wider text-white">{cctvTime}</span>
            <span className="text-[9px] text-zinc-500 tracking-widest mt-0.5">CAM-07 / 3층 자습실</span>
          </div>

          {/* Compass & Direction Info */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase z-20 flex items-center gap-2">
            <Compass size={12} className="text-zinc-500" />
            <span>{state.direction} DIRECTION WALL</span>
          </div>

          {/* Core Interactive Objects inside Camera Lens space */}
          <div className="flex-1 w-full h-full relative" id="interactive-space">
            <AnimatePresence mode="wait">
              <motion.div 
                key={state.direction}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(5px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full h-full relative px-20 flex flex-col justify-between pt-10"
              >
                {/* Descriptive sub header */}
                <div className="text-center max-w-md mx-auto select-none mt-2 relative z-10">
                  <h4 className="text-sm font-black text-white font-serif">{currentWall.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{currentWall.desc}</p>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[85%] h-[75%] border border-zinc-800/20 rounded-[2rem] bg-zinc-900/5 animate-pulse" />
                </div>

                {/* Overlaid Interaction buttons inside the screen */}
                {currentWall.objects.map(obj => (
                  <motion.button
                    key={obj.id}
                    id={`obj-btn-${obj.id}`}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setState(prev => ({ ...prev, inspectingObject: obj.id }))}
                    className={`absolute p-6 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 bg-zinc-950/90 shadow-2xl cursor-pointer group transition-all ${obj.theme}`}
                    style={{ 
                      top: obj.pos.top, 
                      bottom: obj.pos.bottom, 
                      left: obj.pos.left, 
                      right: obj.pos.right,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="relative p-3 bg-zinc-900 border border-zinc-800 rounded-2xl group-hover:bg-blue-950 group-hover:border-blue-500/30 transition-all text-blue-400">
                      {renderIcon(obj.iconType)}
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-zinc-500 transition-colors group-hover:text-white uppercase font-mono whitespace-nowrap">{obj.label}</span>
                    <span className="text-[8px] text-zinc-600 font-mono scale-90 group-hover:text-blue-400 transition-all">[ 조사하기 ]</span>
                  </motion.button>
                ))}

                <div className="h-6 w-full" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Guidelines info bar */}
          <div className="px-12 py-3 bg-zinc-900/30 border-t border-zinc-900/60 flex items-center justify-between select-none z-10 text-[11px] text-zinc-500">
            <div className="flex items-center gap-2">
              <AlertCircle size={12} className="text-blue-500" />
              <span>화면 안의 활성화된 고대 단추 오브젝트를 클릭하여 암호 키를 해독하십시오.</span>
            </div>
            <div className="font-mono">INTELLIGENCE SECURITY STATE: SECURE</div>
          </div>
        </div>

        {/* Final Escape Ending Choice Window */}
        <AnimatePresence>
          {state.ending === null && state.currentStageIdx >= stages.length && (
            <motion.div 
              key="exit-scheme" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-12 text-center space-y-12 scanline-overlay"
            >
              <div className="space-y-4 max-w-xl">
                <ShieldAlert size={54} className="mx-auto text-red-500 mb-6 animate-pulse" />
                <h2 className="text-4xl font-extrabold text-white tracking-tight font-serif italic text-red-500">자습실 철문이 지직거리며 열렸습니다.</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  자습실 출입문은 열렸으나, 이 어두컴컴한 공간 한구석에 지워진 5번째 소녀 <strong className="text-red-400 font-semibold">'최은서'</strong>의 유령 실루엣이 떨고 있습니다.<br />
                  그녀의 왜곡된 원망과 오해를 해소하고 깊이 화해하여 동행할지, 아니면 차갑게 남겨두고 탈출할지 결단하십시오.
                </p>
              </div>

              <div className="grid gap-4 w-full max-w-lg">
                {endings.map(ending => (
                  <button
                    key={ending.id}
                    id={`ending-btn-${ending.id}`}
                    onClick={() => setState(prev => ({ ...prev, ending: ending.id }))}
                    className="p-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500 rounded-3xl hover:scale-[1.02] transition-all text-left flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] text-blue-400 font-mono tracking-widest block mb-1">DECISION SCHEME</span>
                      <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors uppercase">{ending.name}</h3>
                      <p className="text-xs text-zinc-500 mt-1">성향: {ending.condition}</p>
                    </div>
                    <ChevronRight className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 2. Character selection & Skill console at the bottom */}
      <div id="character-panel" className="fixed bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-950/90 border border-zinc-800 px-8 py-1 rounded-2xl shadow-3xl z-30 w-[90vw] max-w-5xl scale-100">
        <div className="flex flex-col shrink-0 select-none">
          <span className="text-[9px] text-zinc-500 font-black tracking-widest uppercase">INVESTIGATOR</span>
          <span className="text-xs font-bold text-white mt-1">우등반</span>
        </div>
        <div className="h-8 w-px bg-zinc-800 shrink-0" />
        <div className="flex gap-3 overflow-x-auto py-1 items-center w-full">
          {characters.map(char => (
            <button
              key={char.id}
              id={`panel-char-${char.id}`}
              onClick={() => setState(prev => ({ ...prev, selectedCharacterId: char.id }))}
              className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 text-left shrink-0 cursor-pointer
                ${state.selectedCharacterId === char.id 
                  ? 'bg-blue-950/80 border-blue-500 text-white shadow-xl' 
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
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
                id="doc-view-btn"
                onClick={() => {
                  const char = characters.find(c => c.id === state.selectedCharacterId);
                  if (char) setInspectingCharacter(char);
                }}
                className="px-4 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-extrabold rounded-2xl transition-all shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Users size={13} />
                <span>일지</span>
              </button>
              <button 
                id="skill-trigger-btn"
                onClick={useCharacterSkill}
                className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>스킬</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Clue/Object click terminal inspection pop-up modal overlay */}
      <AnimatePresence>
        {state.inspectingObject && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            id="clue-inspection-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/85 backdrop-blur-md"
          >
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 max-w-xl w-full relative shadow-3xl overflow-hidden text-left">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600 animate-pulse" />
              <button 
                id="inspect-close-btn"
                onClick={() => { setState(prev => ({ ...prev, inspectingObject: null })); setInput(''); }}
                className="absolute top-6 right-6 p-2 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl">
                  <Search size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-mono tracking-widest leading-none block uppercase">SPATIAL EVIDENCE SURVEY</span>
                  <h3 className="text-lg font-bold text-white mt-1">현장 단서</h3>
                </div>
              </div>
              
              <div className="p-6 bg-zinc-900/60 rounded-2xl border border-zinc-800 mb-6 text-zinc-300 whitespace-pre-wrap leading-relaxed font-serif text-[15px]" id="clue-text-body">
                {getInspectContent(state.inspectingObject, state.currentStageIdx)}
              </div>

              <div className="p-6 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl mb-8 flex gap-3">
                <HelpCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-300/90 leading-relaxed font-sans">
                  <span className="font-extrabold uppercase tracking-wide block mb-1">CCTV 오디오 정보 기록</span>
                  위의 징계 단서나 학급 잔재를 검토한 뒤 해독한 문구, 숫자 또는 영어 이름을 기재하십시오.
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono text-center mb-1">DECIPHER CORE CONSOLE</div>
                <input 
                  autoFocus
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSolve(input)}
                  placeholder="예: 코드 입력..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white text-center outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono tracking-wide"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setState(prev => ({ ...prev, inspectingObject: null })); setInput(''); }}
                    className="py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    중단하기
                  </button>
                  <button 
                    onClick={() => onSolve(input)}
                    className="py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    암호 전송
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles Skill Guide Banner */}
      <AnimatePresence>
        {showSkillHint && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="fixed top-24 right-6 z-50 p-6 bg-gradient-to-br from-indigo-700 to-blue-800 text-white rounded-3xl shadow-2xl max-w-sm border border-indigo-500/30"
          >
            <div className="flex gap-2 items-center mb-3 select-none">
              <Sparkles size={16} className="text-amber-400 animate-spin" />
              <span className="text-xs font-black uppercase tracking-wider">특수 스킬 발동 ─ 수사 가이드</span>
            </div>
            <p className="text-sm font-medium leading-relaxed font-serif italic text-zinc-100">&quot;{getSkillHint(state.currentStageIdx, state.selectedCharacterId || '')}&quot;</p>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 inset-x-0 p-6 text-center text-zinc-800 flex justify-center items-center gap-2 pointer-events-none select-none">
        <CheckCircle2 size={11} />
        <span className="text-[9px] font-black uppercase tracking-[0.5em] font-mono">S-CLASS STUDY ROOM ESCAPE ENG v3.5 - G-CRT</span>
      </footer>

    </div>
  );
}
