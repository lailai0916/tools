import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { useI18n } from '@/i18n';
import {
  GamePanel,
  Instructions,
  Result,
  Stat,
  Stats,
  TestShell,
  funStyles,
  randomInt,
  shuffle,
  useGameText,
} from './shared';

export function SequenceMemoryTest() {
  const text = useGameText('sequenceMemory');
  const [status, setStatus] = useState<'idle' | 'show' | 'input' | 'done'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [level, setLevel] = useState(0);

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

  const start = () => startLevel([randomInt(0, 8), randomInt(0, 8), randomInt(0, 8)], 1);

  const choose = (cell: number) => {
    if (status !== 'input') return;
    if (sequence[inputIndex] !== cell) {
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

  return (
    <TestShell stem="sequenceMemory">
      <Stats>
        <Stat label={text('level')} value={level} />
        <Stat label={text('length')} value={sequence.length || '—'} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={level}
          detail={text('resultDetail')}
          onReset={start}
          resetLabel={text('again')}
        />
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
  const [status, setStatus] = useState<'idle' | 'show' | 'input' | 'done'>('idle');
  const [level, setLevel] = useState(3);
  const [digits, setDigits] = useState('');
  const [answer, setAnswer] = useState('');

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
    if (answer === digits) showLevel(level + 1);
    else setStatus('done');
  };

  return (
    <TestShell stem="numberMemory">
      <Stats>
        <Stat label={text('digits')} value={level} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={level - 1}
          detail={text('resultDetail').replace('{number}', digits)}
          onReset={() => showLevel(3)}
          resetLabel={text('again')}
        />
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
  const [status, setStatus] = useState<'idle' | 'show' | 'input' | 'done'>('idle');
  const [level, setLevel] = useState(3);
  const [targets, setTargets] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (status !== 'show') return;
    const timer = window.setTimeout(() => setStatus('input'), 1200);
    return () => window.clearTimeout(timer);
  }, [status]);

  const showLevel = (nextLevel: number) => {
    setLevel(nextLevel);
    setTargets(visualCells(Math.min(nextLevel, 12)));
    setSelected([]);
    setStatus('show');
  };

  const choose = (cell: number) => {
    if (status !== 'input' || selected.includes(cell)) return;
    if (!targets.includes(cell)) {
      setStatus('done');
      return;
    }
    const next = [...selected, cell];
    setSelected(next);
    if (next.length === targets.length) {
      window.setTimeout(() => showLevel(level + 1), 350);
    }
  };

  return (
    <TestShell stem="visualMemory">
      <Stats>
        <Stat label={text('level')} value={level - 2} />
        <Stat label={text('cells')} value={Math.min(level, 12)} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={level - 3}
          detail={text('resultDetail')}
          onReset={() => showLevel(3)}
          resetLabel={text('again')}
        />
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
  const { locale } = useI18n();
  const words = useMemo(() => (locale === 'zh-Hans' ? ZH_WORDS : EN_WORDS), [locale]);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [seen, setSeen] = useState<string[]>([]);
  const [word, setWord] = useState('');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);

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
    setStatus('running');
  };

  const answer = (claimedSeen: boolean) => {
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
    }
  };

  return (
    <TestShell stem="verbalMemory">
      <Stats>
        <Stat
          label={text('progress')}
          value={`${Math.min(round + (status === 'running' ? 1 : 0), 30)} / 30`}
        />
        <Stat label={text('correct')} value={correct} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${correct} / 30`}
          detail={text('resultDetail')}
          onReset={start}
          resetLabel={text('again')}
        />
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

const MATCH_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function MemoryMatchTest() {
  const text = useGameText('memoryMatch');
  const [cards, setCards] = useState(() => shuffle([...MATCH_VALUES, ...MATCH_VALUES]));
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

  const reset = () => {
    setCards(shuffle([...MATCH_VALUES, ...MATCH_VALUES]));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setElapsed(0);
    setDone(false);
    startedAt.current = 0;
  };

  const flip = (index: number) => {
    if (open.length >= 2 || open.includes(index) || matched.includes(index) || done) return;
    if (startedAt.current === 0) startedAt.current = performance.now();
    if (open.length === 1) setMoves((value) => value + 1);
    setOpen((current) => [...current, index]);
  };

  return (
    <TestShell stem="memoryMatch">
      <Stats>
        <Stat label={text('moves')} value={moves} />
        <Stat label={text('pairs')} value={`${matched.length / 2} / 8`} />
      </Stats>
      {done ? (
        <Result
          title={text('result')}
          value={`${moves}`}
          detail={text('resultDetail').replace('{time}', (elapsed / 1000).toFixed(1))}
          onReset={reset}
          resetLabel={text('again')}
        />
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
