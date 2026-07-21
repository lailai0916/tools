import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  GamePanel,
  Instructions,
  Result,
  Segmented,
  Stat,
  Stats,
  TestShell,
  funStyles,
  randomInt,
  shuffle,
  useGameText,
} from './shared';

function useLiveElapsed(active: boolean, startedAt: React.MutableRefObject<number>) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const tick = () => {
      setElapsed(performance.now() - startedAt.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, startedAt]);
  return [elapsed, setElapsed] as const;
}

export function SchulteTableTest() {
  const text = useGameText('schulteTable');
  const [numbers, setNumbers] = useState(() =>
    shuffle(Array.from({ length: 25 }, (_, index) => index + 1))
  );
  const [next, setNext] = useState(1);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const startedAt = useRef(0);
  const [elapsed, setElapsed] = useLiveElapsed(status === 'running', startedAt);

  const reset = () => {
    setNumbers(shuffle(Array.from({ length: 25 }, (_, index) => index + 1)));
    setNext(1);
    setElapsed(0);
    setStatus('idle');
  };

  const choose = (value: number) => {
    if (value !== next || status === 'done') return;
    if (status === 'idle') {
      startedAt.current = performance.now();
      setStatus('running');
    }
    if (value === 25) {
      setElapsed(performance.now() - startedAt.current);
      setStatus('done');
    } else {
      setNext((current) => current + 1);
    }
  };

  return (
    <TestShell stem="schulteTable">
      <Stats>
        <Stat label={text('next')} value={status === 'done' ? '—' : next} />
        <Stat label={text('time')} value={`${(elapsed / 1000).toFixed(2)} s`} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${(elapsed / 1000).toFixed(2)} s`}
          detail={text('resultDetail')}
          onReset={reset}
          resetLabel={text('again')}
        />
      ) : (
        <GamePanel>
          <Instructions>{text('instructions')}</Instructions>
          <div className={funStyles.schulteGrid}>
            {numbers.map((value) => (
              <button
                type="button"
                key={value}
                className={clsx(funStyles.schulteCell, value < next && funStyles.cellDone)}
                onClick={() => choose(value)}
                disabled={value < next}
              >
                {value}
              </button>
            ))}
          </div>
        </GamePanel>
      )}
    </TestShell>
  );
}

export function TimePerceptionTest() {
  const text = useGameText('timePerception');
  const [target, setTarget] = useState(10);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  const start = () => {
    startedAt.current = performance.now();
    setElapsed(0);
    setStatus('running');
  };

  const stop = () => {
    setElapsed(performance.now() - startedAt.current);
    setStatus('done');
  };

  const reset = () => {
    setElapsed(0);
    setStatus('idle');
  };

  const error = Math.abs(elapsed / 1000 - target);
  return (
    <TestShell stem="timePerception">
      <Segmented
        value={target}
        options={[5, 10, 15]}
        onChange={(value) => {
          setTarget(value);
          reset();
        }}
        label={text('target')}
        format={(value) => `${value} s`}
        disabled={status === 'running'}
      />
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${error.toFixed(2)} s`}
          detail={text('resultDetail').replace('{elapsed}', (elapsed / 1000).toFixed(2))}
          onReset={reset}
          resetLabel={text('again')}
        />
      ) : (
        <button
          type="button"
          className={funStyles.timePad}
          onClick={status === 'idle' ? start : stop}
        >
          <span className={funStyles.timeOrbit} aria-hidden="true" />
          <strong>{status === 'idle' ? text('start') : text('stop')}</strong>
          <span>{status === 'idle' ? text('instructions') : text('runningHint')}</span>
        </button>
      )}
    </TestShell>
  );
}

type ColorName = 'red' | 'blue' | 'green' | 'amber';
const COLORS: readonly ColorName[] = ['red', 'blue', 'green', 'amber'];

function randomStroop(previous?: { word: ColorName; ink: ColorName }) {
  let word = COLORS[randomInt(0, COLORS.length - 1)];
  let ink = COLORS[randomInt(0, COLORS.length - 1)];
  while (ink === word || (previous && ink === previous.ink && word === previous.word)) {
    word = COLORS[randomInt(0, COLORS.length - 1)];
    ink = COLORS[randomInt(0, COLORS.length - 1)];
  }
  return { word, ink };
}

export function StroopTest() {
  const text = useGameText('stroopTest');
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [trial, setTrial] = useState(() => randomStroop());
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const startedAt = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  const start = () => {
    setTrial(randomStroop());
    setRound(0);
    setCorrect(0);
    setElapsed(0);
    startedAt.current = performance.now();
    setStatus('running');
  };

  const choose = (color: ColorName) => {
    if (status !== 'running') return;
    const nextCorrect = correct + (color === trial.ink ? 1 : 0);
    setCorrect(nextCorrect);
    if (round + 1 >= 20) {
      setElapsed(performance.now() - startedAt.current);
      setStatus('done');
    } else {
      setRound((value) => value + 1);
      setTrial((current) => randomStroop(current));
    }
  };

  return (
    <TestShell stem="stroopTest">
      <Stats>
        <Stat
          label={text('progress')}
          value={`${Math.min(round + (status === 'running' ? 1 : 0), 20)} / 20`}
        />
        <Stat label={text('correct')} value={correct} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${correct} / 20`}
          detail={text('resultDetail').replace('{time}', (elapsed / 1000).toFixed(1))}
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
          <span className={funStyles.eyebrow}>{text('chooseInk')}</span>
          <strong className={clsx(funStyles.stroopWord, funStyles[`ink_${trial.ink}`])}>
            {text(`color.${trial.word}`)}
          </strong>
          <div className={funStyles.colorChoices}>
            {COLORS.map((color) => (
              <button
                type="button"
                key={color}
                className={clsx(funStyles.colorChoice, funStyles[`fill_${color}`])}
                onClick={() => choose(color)}
              >
                {text(`color.${color}`)}
              </button>
            ))}
          </div>
        </GamePanel>
      )}
    </TestShell>
  );
}

type HueRound = { base: number; oddIndex: number; difference: number };
const makeHueRound = (round: number): HueRound => ({
  base: randomInt(0, 359),
  oddIndex: randomInt(0, 15),
  difference: Math.max(4, 18 - round * 2),
});

export function ColorHueTest() {
  const text = useGameText('colorHueTest');
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [puzzle, setPuzzle] = useState(() => makeHueRound(0));

  const start = () => {
    setRound(0);
    setCorrect(0);
    setPuzzle(makeHueRound(0));
    setStatus('running');
  };

  const choose = (index: number) => {
    if (status !== 'running') return;
    const nextCorrect = correct + (index === puzzle.oddIndex ? 1 : 0);
    setCorrect(nextCorrect);
    if (round + 1 >= 8) {
      setStatus('done');
    } else {
      const nextRound = round + 1;
      setRound(nextRound);
      setPuzzle(makeHueRound(nextRound));
    }
  };

  return (
    <TestShell stem="colorHueTest">
      <Stats>
        <Stat
          label={text('progress')}
          value={`${Math.min(round + (status === 'running' ? 1 : 0), 8)} / 8`}
        />
        <Stat label={text('correct')} value={correct} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${correct} / 8`}
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
          <Instructions>{text('pickDifferent')}</Instructions>
          <div className={funStyles.hueGrid}>
            {Array.from({ length: 16 }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`${text('tile')} ${index + 1}`}
                style={{
                  background: `hsl(${puzzle.base + (index === puzzle.oddIndex ? puzzle.difference : 0)} 66% 55%)`,
                }}
                onClick={() => choose(index)}
              />
            ))}
          </div>
        </GamePanel>
      )}
    </TestShell>
  );
}

const ODD_PAIRS = [
  ['C', 'G'],
  ['6', '8'],
  ['M', 'N'],
  ['○', '◯'],
  ['←', '↖'],
  ['E', 'F'],
] as const;

export function OddOneOutTest() {
  const text = useGameText('oddOneOut');
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [oddIndex, setOddIndex] = useState(() => randomInt(0, 24));
  const pair = ODD_PAIRS[round % ODD_PAIRS.length];

  const start = () => {
    setRound(0);
    setCorrect(0);
    setOddIndex(randomInt(0, 24));
    setStatus('running');
  };

  const choose = (index: number) => {
    const nextCorrect = correct + (index === oddIndex ? 1 : 0);
    setCorrect(nextCorrect);
    if (round + 1 >= 10) {
      setStatus('done');
    } else {
      setRound((value) => value + 1);
      setOddIndex(randomInt(0, 24));
    }
  };

  return (
    <TestShell stem="oddOneOut">
      <Stats>
        <Stat
          label={text('progress')}
          value={`${Math.min(round + (status === 'running' ? 1 : 0), 10)} / 10`}
        />
        <Stat label={text('correct')} value={correct} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${correct} / 10`}
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
          <Instructions>{text('pickDifferent')}</Instructions>
          <div className={funStyles.oddGrid}>
            {Array.from({ length: 25 }, (_, index) => (
              <button key={index} type="button" onClick={() => choose(index)}>
                {index === oddIndex ? pair[1] : pair[0]}
              </button>
            ))}
          </div>
        </GamePanel>
      )}
    </TestShell>
  );
}

export function RhythmTest() {
  const text = useGameText('rhythmTest');
  const [status, setStatus] = useState<'idle' | 'demo' | 'tapping' | 'done'>('idle');
  const [beat, setBeat] = useState(0);
  const [taps, setTaps] = useState<number[]>([]);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearInterval(intervalRef.current), []);

  const start = () => {
    window.clearInterval(intervalRef.current);
    setTaps([]);
    setBeat(1);
    setStatus('demo');
    let current = 1;
    intervalRef.current = window.setInterval(() => {
      current += 1;
      setBeat(current);
      if (current >= 4) {
        window.clearInterval(intervalRef.current);
        window.setTimeout(() => {
          setBeat(0);
          setStatus('tapping');
        }, 600);
      }
    }, 600);
  };

  const tap = () => {
    if (status !== 'tapping') return;
    const next = [...taps, performance.now()];
    setTaps(next);
    if (next.length >= 9) setStatus('done');
  };

  const intervals = taps.slice(1).map((value, index) => value - taps[index]);
  const averageError = intervals.length
    ? intervals.reduce((sum, value) => sum + Math.abs(value - 600), 0) / intervals.length
    : 0;

  return (
    <TestShell stem="rhythmTest">
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${Math.round(averageError)} ms`}
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
        <button
          type="button"
          className={clsx(funStyles.rhythmPad, beat > 0 && funStyles.rhythmPulse)}
          onPointerDown={tap}
          disabled={status === 'demo'}
        >
          <span key={beat} className={funStyles.metronome} aria-hidden="true">
            <i />
          </span>
          <strong>{status === 'demo' ? text('watch') : text('tap')}</strong>
          <span>{status === 'demo' ? `${beat} / 4` : `${taps.length} / 9`}</span>
        </button>
      )}
    </TestShell>
  );
}
