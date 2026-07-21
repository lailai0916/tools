import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
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
  const lab = useLabText();
  const [size, setSize] = useState(5);
  const total = size * size;
  const [numbers, setNumbers] = useState(() =>
    shuffle(Array.from({ length: 25 }, (_, index) => index + 1))
  );
  const [next, setNext] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [splits, setSplits] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const startedAt = useRef(0);
  const [elapsed, setElapsed] = useLiveElapsed(status === 'running', startedAt);

  const reset = () => {
    setNumbers(shuffle(Array.from({ length: total }, (_, index) => index + 1)));
    setNext(1);
    setMistakes(0);
    setSplits([]);
    setElapsed(0);
    setStatus('idle');
  };

  const choose = (value: number) => {
    if (status === 'done') return;
    if (value !== next) {
      setMistakes((count) => count + 1);
      return;
    }
    if (status === 'idle') {
      startedAt.current = performance.now();
      setStatus('running');
    }
    const now = performance.now();
    setSplits((values) => [...values, now - startedAt.current]);
    if (value === total) {
      setElapsed(now - startedAt.current);
      setStatus('done');
    } else {
      setNext((current) => current + 1);
    }
  };

  const averageStep = splits.length ? elapsed / splits.length : 0;
  const { best, newBest } = useLocalBest(`schulte.${size}`, elapsed, status === 'done', 'lower');
  const seconds = elapsed / 1000;
  const gradeLimit = total * 0.9;
  const grade =
    seconds <= gradeLimit
      ? 'S'
      : seconds <= gradeLimit * 1.3
        ? 'A'
        : seconds <= gradeLimit * 1.7
          ? 'B'
          : seconds <= gradeLimit * 2.3
            ? 'C'
            : 'D';

  return (
    <TestShell stem="schulteTable">
      <Segmented
        value={size}
        options={[3, 4, 5, 6]}
        onChange={(value) => {
          setSize(value);
          const count = value * value;
          setNumbers(shuffle(Array.from({ length: count }, (_, index) => index + 1)));
          setNext(1);
          setStatus('idle');
          setElapsed(0);
          setMistakes(0);
          setSplits([]);
        }}
        label={text('size')}
        format={(value) => `${value} × ${value}`}
        disabled={status === 'running'}
      />
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'running'
              ? lab('status.running')
              : lab('status.done')
        }
        progress={(next - 1) / total}
        active={status === 'running'}
        complete={status === 'done'}
        detail={status === 'done' ? `${total} / ${total}` : `${next} / ${total}`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={seconds.toFixed(2)}
          unit="s"
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail')}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={reset}
        >
          <TelemetryGrid>
            <MetricCard label={text('size')} value={`${size} × ${size}`} />
            <MetricCard label={text('averageStep')} value={`${Math.round(averageStep)} ms`} />
            <MetricCard label={lab('mistakes')} value={mistakes} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${(best / 1000).toFixed(2)} s` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
        </ReportShell>
      ) : (
        <GamePanel>
          <Instructions>{text('instructions')}</Instructions>
          <div
            className={funStyles.schulteGrid}
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
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
  const lab = useLabText();
  const [target, setTarget] = useState(10);
  const [status, setStatus] = useState<'idle' | 'running' | 'roundResult' | 'done'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const startedAt = useRef(0);

  const start = () => {
    startedAt.current = performance.now();
    setElapsed(0);
    setStatus('running');
  };

  const stop = () => {
    const value = performance.now() - startedAt.current;
    const next = [...results, value];
    setElapsed(value);
    setResults(next);
    setStatus(next.length >= 3 ? 'done' : 'roundResult');
  };

  const reset = () => {
    setElapsed(0);
    setResults([]);
    setStatus('idle');
  };

  const errors = results.map((value) => Math.abs(value / 1000 - target));
  const error = errors.length ? errors.reduce((sum, value) => sum + value, 0) / errors.length : 0;
  const bias = results.length
    ? results.reduce((sum, value) => sum + (value / 1000 - target), 0) / results.length
    : 0;
  const accuracy = Math.max(0, 100 - (error / target) * 100);
  const { best, newBest } = useLocalBest(
    `time-perception.${target}`,
    error,
    status === 'done',
    'lower'
  );
  const grade =
    accuracy >= 97 ? 'S' : accuracy >= 93 ? 'A' : accuracy >= 85 ? 'B' : accuracy >= 70 ? 'C' : 'D';
  return (
    <TestShell stem="timePerception">
      <Segmented
        value={target}
        options={[3, 5, 10, 15, 30, 60]}
        onChange={(value) => {
          setTarget(value);
          reset();
        }}
        label={text('target')}
        format={(value) => `${value} s`}
        disabled={status === 'running'}
      />
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'done'
              ? lab('status.done')
              : lab('status.running')
        }
        progress={results.length / 3}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${Math.min(results.length + (status === 'done' ? 0 : 1), 3)} / 3`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={error.toFixed(2)}
          unit="s"
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail').replace('{elapsed}', (elapsed / 1000).toFixed(2))}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={reset}
        >
          <TelemetryGrid>
            <MetricCard label={lab('accuracy')} value={`${accuracy.toFixed(1)}%`} />
            <MetricCard
              label={text('bias')}
              value={`${bias >= 0 ? '+' : ''}${bias.toFixed(2)} s`}
            />
            <MetricCard label={lab('bestRound')} value={`${Math.min(...errors).toFixed(2)} s`} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${best.toFixed(2)} s` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
          <div className={funStyles.roundStrip}>
            {errors.map((value, index) => (
              <span key={index}>
                <small>{index + 1}</small>
                <strong>{value.toFixed(2)}</strong>
                <em>s</em>
              </span>
            ))}
          </div>
        </ReportShell>
      ) : status === 'roundResult' ? (
        <GamePanel>
          <span className={funStyles.eyebrow}>{text('roundResult')}</span>
          <strong className={funStyles.resultValue}>{errors.at(-1)?.toFixed(2)} s</strong>
          <button type="button" className={funStyles.inlinePrimary} onClick={start}>
            {text('nextRound')}
          </button>
        </GamePanel>
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
  const lab = useLabText();
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [trial, setTrial] = useState(() => randomStroop());
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const startedAt = useRef(0);
  const trialAt = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  const start = () => {
    setTrial(randomStroop());
    setRound(0);
    setCorrect(0);
    setResponseTimes([]);
    setElapsed(0);
    startedAt.current = performance.now();
    trialAt.current = startedAt.current;
    setStatus('running');
  };

  const choose = (color: ColorName) => {
    if (status !== 'running') return;
    const now = performance.now();
    setResponseTimes((values) => [...values, now - trialAt.current]);
    const nextCorrect = correct + (color === trial.ink ? 1 : 0);
    setCorrect(nextCorrect);
    if (round + 1 >= 20) {
      setElapsed(now - startedAt.current);
      setStatus('done');
    } else {
      setRound((value) => value + 1);
      setTrial((current) => randomStroop(current));
      trialAt.current = now;
    }
  };

  const accuracy = (correct / 20) * 100;
  const averageResponse = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : 0;
  const bestRound = responseTimes.length ? Math.min(...responseTimes) : 0;
  const score = accuracy * 10 - averageResponse / 10;
  const { best, newBest } = useLocalBest('stroop.score', score, status === 'done');
  const grade =
    accuracy >= 95 && averageResponse < 900
      ? 'S'
      : accuracy >= 90
        ? 'A'
        : accuracy >= 80
          ? 'B'
          : accuracy >= 65
            ? 'C'
            : 'D';

  return (
    <TestShell stem="stroopTest">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'running'
              ? lab('status.running')
              : lab('status.done')
        }
        progress={(status === 'done' ? 20 : round) / 20}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${Math.min(round + (status === 'running' ? 1 : 0), 20)} / 20`}
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
          insight={text('resultDetail').replace('{time}', (elapsed / 1000).toFixed(1))}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={start}
        >
          <TelemetryGrid>
            <MetricCard label={text('correct')} value={`${correct} / 20`} />
            <MetricCard label={lab('average')} value={`${Math.round(averageResponse)} ms`} />
            <MetricCard label={lab('bestRound')} value={`${Math.round(bestRound)} ms`} />
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
  const lab = useLabText();
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [puzzle, setPuzzle] = useState(() => makeHueRound(0));
  const roundAt = useRef(0);

  const start = () => {
    setRound(0);
    setCorrect(0);
    setResponseTimes([]);
    setPuzzle(makeHueRound(0));
    roundAt.current = performance.now();
    setStatus('running');
  };

  const choose = (index: number) => {
    if (status !== 'running') return;
    const now = performance.now();
    setResponseTimes((values) => [...values, now - roundAt.current]);
    const nextCorrect = correct + (index === puzzle.oddIndex ? 1 : 0);
    setCorrect(nextCorrect);
    if (round + 1 >= 8) {
      setStatus('done');
    } else {
      const nextRound = round + 1;
      setRound(nextRound);
      setPuzzle(makeHueRound(nextRound));
      roundAt.current = now;
    }
  };

  const accuracy = (correct / 8) * 100;
  const averageResponse = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : 0;
  const { newBest } = useLocalBest(
    'color-hue.score',
    correct * 1000 - averageResponse,
    status === 'done'
  );
  const grade =
    correct === 8 ? 'S' : correct >= 7 ? 'A' : correct >= 6 ? 'B' : correct >= 4 ? 'C' : 'D';

  return (
    <TestShell stem="colorHueTest">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'running'
              ? lab('status.running')
              : lab('status.done')
        }
        progress={(status === 'done' ? 8 : round) / 8}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${Math.min(round + (status === 'running' ? 1 : 0), 8)} / 8`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={correct.toString()}
          unit="/ 8"
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
            <MetricCard label={lab('accuracy')} value={`${accuracy.toFixed(0)}%`} />
            <MetricCard label={lab('average')} value={`${Math.round(averageResponse)} ms`} />
            <MetricCard label={text('finestDifference')} value="4°" />
            <MetricCard label={lab('mistakes')} value={8 - correct} />
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
  const lab = useLabText();
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [oddIndex, setOddIndex] = useState(() => randomInt(0, 24));
  const roundAt = useRef(0);
  const pair = ODD_PAIRS[round % ODD_PAIRS.length];

  const start = () => {
    setRound(0);
    setCorrect(0);
    setResponseTimes([]);
    setOddIndex(randomInt(0, 24));
    roundAt.current = performance.now();
    setStatus('running');
  };

  const choose = (index: number) => {
    const now = performance.now();
    setResponseTimes((values) => [...values, now - roundAt.current]);
    const nextCorrect = correct + (index === oddIndex ? 1 : 0);
    setCorrect(nextCorrect);
    if (round + 1 >= 10) {
      setStatus('done');
    } else {
      setRound((value) => value + 1);
      setOddIndex(randomInt(0, 24));
      roundAt.current = now;
    }
  };

  const accuracy = correct * 10;
  const averageResponse = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : 0;
  const { newBest } = useLocalBest(
    'odd-one-out.score',
    correct * 1000 - averageResponse,
    status === 'done'
  );
  const grade =
    correct === 10 ? 'S' : correct >= 9 ? 'A' : correct >= 7 ? 'B' : correct >= 5 ? 'C' : 'D';

  return (
    <TestShell stem="oddOneOut">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'running'
              ? lab('status.running')
              : lab('status.done')
        }
        progress={(status === 'done' ? 10 : round) / 10}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${Math.min(round + (status === 'running' ? 1 : 0), 10)} / 10`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={correct.toString()}
          unit="/ 10"
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
            <MetricCard label={lab('accuracy')} value={`${accuracy}%`} />
            <MetricCard label={lab('average')} value={`${Math.round(averageResponse)} ms`} />
            <MetricCard
              label={lab('bestRound')}
              value={`${Math.round(Math.min(...responseTimes))} ms`}
            />
            <MetricCard label={lab('mistakes')} value={10 - correct} />
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
  const lab = useLabText();
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
  const averageInterval = intervals.length
    ? intervals.reduce((sum, value) => sum + value, 0) / intervals.length
    : 600;
  const deviation = intervals.length
    ? Math.sqrt(
        intervals.reduce((sum, value) => sum + (value - averageInterval) ** 2, 0) / intervals.length
      )
    : 0;
  const consistency = Math.max(0, Math.round(100 - (deviation / 600) * 100));
  const bestRound = intervals.length
    ? Math.min(...intervals.map((value) => Math.abs(value - 600)))
    : 0;
  const { best, newBest } = useLocalBest('rhythm.error', averageError, status === 'done', 'lower');
  const grade =
    averageError <= 30
      ? 'S'
      : averageError <= 55
        ? 'A'
        : averageError <= 90
          ? 'B'
          : averageError <= 150
            ? 'C'
            : 'D';

  return (
    <TestShell stem="rhythmTest">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'done'
              ? lab('status.done')
              : status === 'demo'
                ? text('watch')
                : lab('status.running')
        }
        progress={
          status === 'demo'
            ? beat / 4
            : status === 'tapping'
              ? taps.length / 9
              : status === 'done'
                ? 1
                : 0
        }
        active={status === 'demo' || status === 'tapping'}
        complete={status === 'done'}
        detail={status === 'demo' ? `${beat} / 4` : `${taps.length} / 9`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={Math.round(averageError).toString()}
          unit="ms"
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
            <MetricCard
              label={text('tempo')}
              value={`${Math.round(60000 / averageInterval)} BPM`}
            />
            <MetricCard label={lab('consistency')} value={`${consistency}%`} />
            <MetricCard label={lab('bestRound')} value={`${Math.round(bestRound)} ms`} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${Math.round(best)} ms` : '—'}
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
