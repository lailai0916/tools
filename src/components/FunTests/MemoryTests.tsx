import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { useI18n } from '@/i18n';
import {
  GamePanel,
  Instructions,
  MetricCard,
  ReportShell,
  Segmented,
  SessionBar,
  TelemetryGrid,
  TestShell,
  funStyles,
  randomInt,
  shuffle,
  useGameText,
  useLabText,
  useLocalBest,
} from './shared';

export function SequenceMemoryTest() {
  const text = useGameText('sequenceMemory');
  const lab = useLabText();
  const [status, setStatus] = useState<'idle' | 'show' | 'input' | 'done'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [level, setLevel] = useState(0);
  const [failedCell, setFailedCell] = useState<number | null>(null);

  useEffect(() => {
    if (status !== 'show') return;
    const timers: number[] = [];
    sequence.forEach((cell, index) => {
      timers.push(window.setTimeout(() => setActive(cell), 350 + index * 650));
      timers.push(window.setTimeout(() => setActive(null), 750 + index * 650));
    });
    timers.push(
      window.setTimeout(
        () => {
          setInputIndex(0);
          setStatus('input');
        },
        450 + sequence.length * 650
      )
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [sequence, status]);

  const startLevel = (nextSequence: number[], nextLevel: number) => {
    setSequence(nextSequence);
    setLevel(nextLevel);
    setInputIndex(0);
    setStatus('show');
  };

  const start = () => {
    setFailedCell(null);
    startLevel([randomInt(0, 8), randomInt(0, 8), randomInt(0, 8)], 1);
  };

  const choose = (cell: number) => {
    if (status !== 'input') return;
    if (sequence[inputIndex] !== cell) {
      setFailedCell(cell);
      setStatus('done');
      return;
    }
    if (inputIndex + 1 === sequence.length) {
      const nextLevel = level + 1;
      window.setTimeout(() => startLevel([...sequence, randomInt(0, 8)], nextLevel), 300);
    } else {
      setInputIndex((value) => value + 1);
    }
  };

  const completedLevel = Math.max(0, level - 1);
  const { best, newBest } = useLocalBest(
    'sequence-memory.level',
    completedLevel,
    status === 'done'
  );
  const grade =
    completedLevel >= 10
      ? 'S'
      : completedLevel >= 7
        ? 'A'
        : completedLevel >= 5
          ? 'B'
          : completedLevel >= 3
            ? 'C'
            : 'D';

  return (
    <TestShell stem="sequenceMemory">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'done'
              ? lab('status.done')
              : status === 'show'
                ? text('watch')
                : text('repeat')
        }
        progress={
          status === 'input' ? inputIndex / Math.max(1, sequence.length) : status === 'done' ? 1 : 0
        }
        active={status === 'show' || status === 'input'}
        complete={status === 'done'}
        detail={`${text('level')} ${level || 1}`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={completedLevel.toString()}
          unit={text('levelUnit')}
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail')}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={() => {
            setFailedCell(null);
            start();
          }}
        >
          <TelemetryGrid>
            <MetricCard label={text('length')} value={sequence.length} />
            <MetricCard label={text('correctSteps')} value={inputIndex} />
            <MetricCard label={text('expectedCell')} value={(sequence[inputIndex] ?? 0) + 1} />
            <MetricCard label={lab('personalBest')} value={best || '—'} accent={newBest} />
          </TelemetryGrid>
          <div className={funStyles.answerReveal}>
            {text('answerReveal')
              .replace('{chosen}', String((failedCell ?? 0) + 1))
              .replace('{expected}', String((sequence[inputIndex] ?? 0) + 1))}
          </div>
        </ReportShell>
      ) : status === 'idle' ? (
        <GamePanel>
          <Instructions>{text('instructions')}</Instructions>
          <button type="button" className={funStyles.inlinePrimary} onClick={start}>
            {text('start')}
          </button>
        </GamePanel>
      ) : (
        <GamePanel>
          <strong>{status === 'show' ? text('watch') : text('repeat')}</strong>
          <div className={funStyles.memoryGrid3}>
            {Array.from({ length: 9 }, (_, cell) => (
              <button
                type="button"
                key={cell}
                aria-label={`${text('cell')} ${cell + 1}`}
                className={clsx(active === cell && funStyles.memoryActive)}
                disabled={status !== 'input'}
                onClick={() => choose(cell)}
              />
            ))}
          </div>
        </GamePanel>
      )}
    </TestShell>
  );
}

function makeDigits(length: number) {
  const first = randomInt(1, 9);
  return `${first}${Array.from({ length: length - 1 }, () => randomInt(0, 9)).join('')}`;
}

export function NumberMemoryTest() {
  const text = useGameText('numberMemory');
  const lab = useLabText();
  const [status, setStatus] = useState<'idle' | 'show' | 'input' | 'done'>('idle');
  const [level, setLevel] = useState(3);
  const [digits, setDigits] = useState('');
  const [answer, setAnswer] = useState('');
  const [lastAnswer, setLastAnswer] = useState('');

  useEffect(() => {
    if (status !== 'show') return;
    const timer = window.setTimeout(() => setStatus('input'), Math.min(4200, 1000 + level * 220));
    return () => window.clearTimeout(timer);
  }, [level, status]);

  const showLevel = (length: number) => {
    setLevel(length);
    setDigits(makeDigits(length));
    setAnswer('');
    setStatus('show');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLastAnswer(answer);
    if (answer === digits) showLevel(level + 1);
    else setStatus('done');
  };

  const score = Math.max(0, level - 1);
  const { best, newBest } = useLocalBest('number-memory.digits', score, status === 'done');
  const grade = score >= 12 ? 'S' : score >= 9 ? 'A' : score >= 7 ? 'B' : score >= 5 ? 'C' : 'D';

  return (
    <TestShell stem="numberMemory">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'done'
              ? lab('status.done')
              : status === 'show'
                ? text('remember')
                : text('enterNumber')
        }
        progress={status === 'show' ? 0.5 : status === 'input' ? 0.8 : status === 'done' ? 1 : 0}
        active={status === 'show' || status === 'input'}
        complete={status === 'done'}
        detail={`${level} ${text('digitsUnit')}`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={score.toString()}
          unit={text('digitsUnit')}
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail').replace('{number}', digits)}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={() => showLevel(3)}
        >
          <TelemetryGrid>
            <MetricCard label={text('targetNumber')} value={digits} />
            <MetricCard label={text('yourAnswer')} value={lastAnswer || '—'} />
            <MetricCard
              label={text('displayTime')}
              value={`${Math.min(4200, 1000 + level * 220) / 1000}s`}
            />
            <MetricCard label={lab('personalBest')} value={best || '—'} accent={newBest} />
          </TelemetryGrid>
        </ReportShell>
      ) : status === 'idle' ? (
        <GamePanel>
          <Instructions>{text('instructions')}</Instructions>
          <button type="button" className={funStyles.inlinePrimary} onClick={() => showLevel(3)}>
            {text('start')}
          </button>
        </GamePanel>
      ) : status === 'show' ? (
        <GamePanel>
          <span className={funStyles.eyebrow}>{text('remember')}</span>
          <strong className={funStyles.numberDisplay}>{digits}</strong>
        </GamePanel>
      ) : (
        <GamePanel>
          <form className={funStyles.answerForm} onSubmit={submit}>
            <label htmlFor="number-memory-answer">{text('enterNumber')}</label>
            <input
              id="number-memory-answer"
              className={funStyles.textInput}
              inputMode="numeric"
              pattern="[0-9]*"
              value={answer}
              onChange={(event) => setAnswer(event.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            <button type="submit" className={funStyles.inlinePrimary} disabled={!answer}>
              {text('submit')}
            </button>
          </form>
        </GamePanel>
      )}
    </TestShell>
  );
}

function visualCells(count: number) {
  return shuffle(Array.from({ length: 25 }, (_, index) => index)).slice(0, count);
}

export function VisualMemoryTest() {
  const text = useGameText('visualMemory');
  const lab = useLabText();
  const [status, setStatus] = useState<'idle' | 'show' | 'input' | 'done'>('idle');
  const [level, setLevel] = useState(3);
  const [targets, setTargets] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [failedCell, setFailedCell] = useState<number | null>(null);

  useEffect(() => {
    if (status !== 'show') return;
    const timer = window.setTimeout(() => setStatus('input'), 1200);
    return () => window.clearTimeout(timer);
  }, [status]);

  const showLevel = (nextLevel: number) => {
    setLevel(nextLevel);
    setTargets(visualCells(Math.min(nextLevel, 12)));
    setSelected([]);
    setFailedCell(null);
    setStatus('show');
  };

  const choose = (cell: number) => {
    if (status !== 'input' || selected.includes(cell)) return;
    if (!targets.includes(cell)) {
      setFailedCell(cell);
      setStatus('done');
      return;
    }
    const next = [...selected, cell];
    setSelected(next);
    if (next.length === targets.length) {
      window.setTimeout(() => showLevel(level + 1), 350);
    }
  };

  const score = Math.max(0, level - 3);
  const { best, newBest } = useLocalBest('visual-memory.level', score, status === 'done');
  const grade = score >= 9 ? 'S' : score >= 7 ? 'A' : score >= 5 ? 'B' : score >= 3 ? 'C' : 'D';

  return (
    <TestShell stem="visualMemory">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'done'
              ? lab('status.done')
              : status === 'show'
                ? text('remember')
                : text('select')
        }
        progress={
          status === 'input'
            ? selected.length / Math.max(1, targets.length)
            : status === 'done'
              ? 1
              : 0
        }
        active={status === 'show' || status === 'input'}
        complete={status === 'done'}
        detail={`${text('level')} ${level - 2}`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={score.toString()}
          unit={text('levelUnit')}
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail')}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={() => showLevel(3)}
        >
          <TelemetryGrid>
            <MetricCard label={text('cells')} value={targets.length} />
            <MetricCard label={text('correctCells')} value={selected.length} />
            <MetricCard label={text('failedCell')} value={(failedCell ?? 0) + 1} />
            <MetricCard label={lab('personalBest')} value={best || '—'} accent={newBest} />
          </TelemetryGrid>
        </ReportShell>
      ) : status === 'idle' ? (
        <GamePanel>
          <Instructions>{text('instructions')}</Instructions>
          <button type="button" className={funStyles.inlinePrimary} onClick={() => showLevel(3)}>
            {text('start')}
          </button>
        </GamePanel>
      ) : (
        <GamePanel>
          <strong>{status === 'show' ? text('remember') : text('select')}</strong>
          <div className={funStyles.memoryGrid5}>
            {Array.from({ length: 25 }, (_, cell) => (
              <button
                type="button"
                key={cell}
                aria-label={`${text('cell')} ${cell + 1}`}
                className={clsx(
                  status === 'show' && targets.includes(cell) && funStyles.memoryActive,
                  selected.includes(cell) && funStyles.memorySelected
                )}
                disabled={status !== 'input'}
                onClick={() => choose(cell)}
              />
            ))}
          </div>
        </GamePanel>
      )}
    </TestShell>
  );
}

const EN_WORDS = [
  'anchor',
  'breeze',
  'cabin',
  'drift',
  'ember',
  'forest',
  'globe',
  'harbor',
  'island',
  'jungle',
  'kernel',
  'lantern',
  'meadow',
  'needle',
  'orbit',
  'piano',
  'quartz',
  'river',
  'signal',
  'timber',
  'unity',
  'velvet',
  'willow',
  'yonder',
  'zephyr',
  'bridge',
  'copper',
  'dawn',
  'echo',
  'flame',
];
const ZH_WORDS = [
  '锚点',
  '微风',
  '木屋',
  '漂流',
  '余烬',
  '森林',
  '地球',
  '港湾',
  '岛屿',
  '丛林',
  '核心',
  '灯笼',
  '草地',
  '银针',
  '轨道',
  '钢琴',
  '石英',
  '河流',
  '信号',
  '木材',
  '团结',
  '天鹅绒',
  '柳树',
  '远方',
  '和风',
  '桥梁',
  '铜片',
  '黎明',
  '回声',
  '火焰',
];

export function VerbalMemoryTest() {
  const text = useGameText('verbalMemory');
  const lab = useLabText();
  const { locale } = useI18n();
  const words = useMemo(() => (locale === 'zh-Hans' ? ZH_WORDS : EN_WORDS), [locale]);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [seen, setSeen] = useState<string[]>([]);
  const [word, setWord] = useState('');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const wordAt = useRef(0);

  const nextWord = (seenWords: string[], nextRound: number) => {
    const unseen = words.filter((candidate) => !seenWords.includes(candidate));
    const shouldRepeat = seenWords.length > 0 && (nextRound % 3 === 2 || Math.random() < 0.35);
    return shouldRepeat
      ? seenWords[randomInt(0, seenWords.length - 1)]
      : (unseen[randomInt(0, Math.max(0, unseen.length - 1))] ??
          words[randomInt(0, words.length - 1)]);
  };

  const start = () => {
    const first = words[randomInt(0, words.length - 1)];
    setSeen([]);
    setWord(first);
    setRound(0);
    setCorrect(0);
    setResponseTimes([]);
    wordAt.current = performance.now();
    setStatus('running');
  };

  const answer = (claimedSeen: boolean) => {
    const now = performance.now();
    setResponseTimes((values) => [...values, now - wordAt.current]);
    const wasSeen = seen.includes(word);
    const nextCorrect = correct + (claimedSeen === wasSeen ? 1 : 0);
    const nextSeen = wasSeen ? seen : [...seen, word];
    setCorrect(nextCorrect);
    setSeen(nextSeen);
    if (round + 1 >= 30) {
      setStatus('done');
    } else {
      const nextRound = round + 1;
      setRound(nextRound);
      setWord(nextWord(nextSeen, nextRound));
      wordAt.current = now;
    }
  };

  const accuracy = (correct / 30) * 100;
  const averageResponse = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : 0;
  const { best, newBest } = useLocalBest(
    'verbal-memory.score',
    correct * 1000 - averageResponse,
    status === 'done'
  );
  const grade =
    correct >= 29 ? 'S' : correct >= 26 ? 'A' : correct >= 22 ? 'B' : correct >= 17 ? 'C' : 'D';

  return (
    <TestShell stem="verbalMemory">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'running'
              ? lab('status.running')
              : lab('status.done')
        }
        progress={(status === 'done' ? 30 : round) / 30}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${Math.min(round + (status === 'running' ? 1 : 0), 30)} / 30`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={accuracy.toFixed(0)}
          unit="%"
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail')}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={start}
        >
          <TelemetryGrid>
            <MetricCard label={text('correct')} value={`${correct} / 30`} />
            <MetricCard label={lab('mistakes')} value={30 - correct} />
            <MetricCard label={lab('average')} value={`${Math.round(averageResponse)} ms`} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? Math.round(best) : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
        </ReportShell>
      ) : status === 'idle' ? (
        <GamePanel>
          <Instructions>{text('instructions')}</Instructions>
          <button type="button" className={funStyles.inlinePrimary} onClick={start}>
            {text('start')}
          </button>
        </GamePanel>
      ) : (
        <GamePanel>
          <span className={funStyles.eyebrow}>{text('haveSeen')}</span>
          <strong className={funStyles.verbalWord}>{word}</strong>
          <div className={funStyles.buttonRow}>
            <button type="button" className={funStyles.choiceButton} onClick={() => answer(true)}>
              {text('seen')}
            </button>
            <button type="button" className={funStyles.choiceButton} onClick={() => answer(false)}>
              {text('new')}
            </button>
          </div>
        </GamePanel>
      )}
    </TestShell>
  );
}

const MATCH_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function MemoryMatchTest() {
  const text = useGameText('memoryMatch');
  const lab = useLabText();
  const [pairCount, setPairCount] = useState(8);
  const [cards, setCards] = useState(() =>
    shuffle([...MATCH_VALUES.slice(0, 8), ...MATCH_VALUES.slice(0, 8)])
  );
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    if (open.length !== 2) return;
    const [first, second] = open;
    const timer = window.setTimeout(
      () => {
        if (cards[first] === cards[second]) {
          const nextMatched = [...matched, first, second];
          setMatched(nextMatched);
          if (nextMatched.length === cards.length) {
            setElapsed(performance.now() - startedAt.current);
            setDone(true);
          }
        }
        setOpen([]);
      },
      cards[first] === cards[second] ? 300 : 650
    );
    return () => window.clearTimeout(timer);
  }, [cards, matched, open]);

  const reset = (nextPairCount = pairCount) => {
    const values = MATCH_VALUES.slice(0, nextPairCount);
    setCards(shuffle([...values, ...values]));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setElapsed(0);
    setDone(false);
    startedAt.current = 0;
  };

  const { best, newBest } = useLocalBest(`memory-match.${pairCount}`, moves, done, 'lower');
  const efficiency = moves ? (pairCount / moves) * 100 : 100;
  const grade =
    moves <= pairCount + 2
      ? 'S'
      : moves <= pairCount * 1.5
        ? 'A'
        : moves <= pairCount * 2
          ? 'B'
          : moves <= pairCount * 3
            ? 'C'
            : 'D';

  const flip = (index: number) => {
    if (open.length >= 2 || open.includes(index) || matched.includes(index) || done) return;
    if (startedAt.current === 0) startedAt.current = performance.now();
    if (open.length === 1) setMoves((value) => value + 1);
    setOpen((current) => [...current, index]);
  };

  return (
    <TestShell stem="memoryMatch">
      <Segmented
        value={pairCount}
        options={[6, 8, 10]}
        onChange={(value) => {
          setPairCount(value);
          reset(value);
        }}
        label={text('pairs')}
        disabled={startedAt.current > 0 && !done}
      />
      <SessionBar
        status={
          done
            ? lab('status.done')
            : startedAt.current
              ? lab('status.running')
              : lab('status.ready')
        }
        progress={matched.length / cards.length}
        active={startedAt.current > 0 && !done}
        complete={done}
        detail={`${matched.length / 2} / ${pairCount}`}
      />
      {done ? (
        <ReportShell
          eyebrow={lab('report')}
          score={moves.toString()}
          unit={text('movesUnit')}
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail').replace('{time}', (elapsed / 1000).toFixed(1))}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={() => reset()}
        >
          <TelemetryGrid>
            <MetricCard label={text('pairs')} value={pairCount} />
            <MetricCard label={lab('time')} value={`${(elapsed / 1000).toFixed(1)} s`} />
            <MetricCard label={text('efficiency')} value={`${efficiency.toFixed(0)}%`} />
            <MetricCard label={lab('personalBest')} value={best || '—'} accent={newBest} />
          </TelemetryGrid>
        </ReportShell>
      ) : (
        <GamePanel>
          <Instructions>{text('instructions')}</Instructions>
          <div className={funStyles.matchGrid}>
            {cards.map((value, index) => {
              const visible = open.includes(index) || matched.includes(index);
              return (
                <button
                  type="button"
                  key={index}
                  className={clsx(funStyles.matchCard, visible && funStyles.matchCardOpen)}
                  onClick={() => flip(index)}
                  disabled={matched.includes(index)}
                  aria-label={visible ? value : `${text('card')} ${index + 1}`}
                >
                  <span>{visible ? value : '?'}</span>
                </button>
              );
            })}
          </div>
        </GamePanel>
      )}
    </TestShell>
  );
}
