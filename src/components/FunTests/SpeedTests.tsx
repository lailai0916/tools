import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import clsx from 'clsx';
import {
  GamePanel,
  Instructions,
  LineChart,
  MetricCard,
  ReportShell,
  Segmented,
  SessionBar,
  TelemetryGrid,
  TestShell,
  funStyles,
  randomInt,
  useGameText,
  useLabText,
  useLocalBest,
} from './shared';

type TimedStatus = 'idle' | 'running' | 'done';

function useTimedRun(durationSeconds: number, status: TimedStatus, onDone: () => void) {
  const [remaining, setRemaining] = useState(durationSeconds * 1000);
  const startedAt = useRef(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const begin = useCallback(() => {
    startedAt.current = performance.now();
    setRemaining(durationSeconds * 1000);
  }, [durationSeconds]);

  useEffect(() => {
    if (status !== 'running') return;
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.max(0, durationSeconds * 1000 - (now - startedAt.current));
      setRemaining(next);
      if (next === 0) {
        doneRef.current();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationSeconds, status]);

  return { remaining, begin };
}

function buildRateCurve(clickTimes: number[], startedAt: number, durationSeconds: number) {
  const durationMs = durationSeconds * 1000;
  const sampleCount = Math.min(1201, Math.max(21, Math.ceil(durationMs / 50) + 1));
  const sampleIntervalMs = durationMs / (sampleCount - 1);
  const bandwidthMs = Math.max(160, sampleIntervalMs * 1.5);
  const values = Array.from({ length: sampleCount }, () => 0);

  if (startedAt === 0 || clickTimes.length === 0) {
    return { values, sampleIntervalMs };
  }

  const radius = bandwidthMs * 3;
  const scale = 1000 / (bandwidthMs * Math.sqrt(2 * Math.PI));
  const addKernel = (centerMs: number) => {
    const first = Math.max(0, Math.ceil((centerMs - radius) / sampleIntervalMs));
    const last = Math.min(sampleCount - 1, Math.floor((centerMs + radius) / sampleIntervalMs));
    for (let index = first; index <= last; index += 1) {
      const distance = (index * sampleIntervalMs - centerMs) / bandwidthMs;
      values[index] += scale * Math.exp(-0.5 * distance * distance);
    }
  };

  clickTimes.forEach((timestamp) => {
    const relativeMs = Math.min(durationMs, Math.max(0, timestamp - startedAt));
    addKernel(relativeMs);
    if (relativeMs < radius) addKernel(-relativeMs);
    if (durationMs - relativeMs < radius) addKernel(durationMs * 2 - relativeMs);
  });

  return {
    values: values.map((value) => Math.round(value * 1000) / 1000),
    sampleIntervalMs,
  };
}

function buildWeightedCurve(
  events: { time: number; value: number }[],
  startedAt: number,
  durationSeconds: number
) {
  const durationMs = durationSeconds * 1000;
  const sampleCount = Math.min(1201, Math.max(21, Math.ceil(durationMs / 50) + 1));
  const sampleIntervalMs = durationMs / (sampleCount - 1);
  const bandwidthMs = Math.max(180, sampleIntervalMs * 1.5);
  const values = Array.from({ length: sampleCount }, () => 0);
  const radius = bandwidthMs * 3;
  const scale = 1000 / (bandwidthMs * Math.sqrt(2 * Math.PI));
  events.forEach(({ time, value }) => {
    const center = Math.min(durationMs, Math.max(0, time - startedAt));
    const first = Math.max(0, Math.ceil((center - radius) / sampleIntervalMs));
    const last = Math.min(sampleCount - 1, Math.floor((center + radius) / sampleIntervalMs));
    for (let index = first; index <= last; index += 1) {
      const distance = (index * sampleIntervalMs - center) / bandwidthMs;
      values[index] += Math.abs(value) * scale * Math.exp(-0.5 * distance * distance);
    }
  });
  return { values, sampleIntervalMs };
}

export function CpsTest() {
  const text = useGameText('cpsTest');
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<TimedStatus>('idle');
  const [clicks, setClicks] = useState(0);
  const [clickTimes, setClickTimes] = useState<number[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const clicksRef = useRef(0);
  const startedAt = useRef(0);
  const rippleId = useRef(0);
  const { remaining, begin } = useTimedRun(duration, status, () => setStatus('done'));

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(`fun.cps.best.${duration}`)) || 0);
    } catch {
      setBest(0);
    }
  }, [duration]);

  const reset = () => {
    setStatus('idle');
    setClicks(0);
    setClickTimes([]);
    setRipples([]);
    setNewBest(false);
    clicksRef.current = 0;
    startedAt.current = 0;
  };

  const registerClick = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (status === 'done') return;
    if (status === 'idle') {
      startedAt.current = performance.now();
      begin();
      setStatus('running');
    }
    const now = performance.now();
    clicksRef.current += 1;
    setClicks(clicksRef.current);
    setClickTimes((current) => [...current, now]);
    const rect = event.currentTarget.getBoundingClientRect();
    const nextRipple = {
      id: (rippleId.current += 1),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setRipples((current) => [...current.slice(-3), nextRipple]);
  };

  const cps = clicks / duration;
  const elapsed = Math.max(0, duration * 1000 - remaining);
  const progress = status === 'done' ? 1 : elapsed / (duration * 1000);
  const now = performance.now();
  const liveCps = status === 'running' ? clickTimes.filter((time) => now - time <= 1000).length : 0;
  const buckets = useMemo(() => {
    const next = Array.from({ length: duration }, () => 0);
    if (startedAt.current === 0) return next;
    clickTimes.forEach((time) => {
      const index = Math.min(
        duration - 1,
        Math.max(0, Math.floor((time - startedAt.current) / 1000))
      );
      next[index] += 1;
    });
    return next;
  }, [clickTimes, duration]);
  const rateCurve = useMemo(
    () => buildRateCurve(clickTimes, startedAt.current, duration),
    [clickTimes, duration]
  );
  const peak = Math.max(0, ...rateCurve.values);
  const observedBuckets = buckets.slice(
    0,
    status === 'done' ? duration : Math.max(1, Math.ceil(elapsed / 1000))
  );
  const averageBucket =
    observedBuckets.reduce((sum, value) => sum + value, 0) / observedBuckets.length;
  const deviation = Math.sqrt(
    observedBuckets.reduce((sum, value) => sum + (value - averageBucket) ** 2, 0) /
      observedBuckets.length
  );
  const consistency =
    averageBucket > 0
      ? Math.max(0, Math.round(100 - Math.min(100, (deviation / averageBucket) * 100)))
      : 0;
  const grade = cps >= 10 ? 'S' : cps >= 8 ? 'A' : cps >= 6 ? 'B' : cps >= 4 ? 'C' : 'D';
  const insight =
    cps >= 8
      ? text('insight.fast')
      : consistency >= 75
        ? text('insight.steady')
        : text('insight.practice');

  useEffect(() => {
    if (status !== 'done' || cps <= best) return;
    setBest(cps);
    setNewBest(true);
    try {
      localStorage.setItem(`fun.cps.best.${duration}`, String(cps));
    } catch {
      // Local records are optional.
    }
  }, [best, cps, duration, status]);

  useEffect(() => {
    if (status !== 'done') return;
    const handleReplay = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'r') return;
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, [contenteditable]')) return;
      reset();
    };
    window.addEventListener('keydown', handleReplay);
    return () => window.removeEventListener('keydown', handleReplay);
  });

  return (
    <TestShell stem="cpsTest">
      <Segmented
        value={duration}
        options={[1, 3, 5, 10, 15, 30, 60, 100, 180, 900]}
        onChange={(next) => {
          setDuration(next);
          reset();
        }}
        label={text('duration')}
        format={(value) => `${value} s`}
        disabled={status === 'running'}
      />
      <SessionBar
        status={
          status === 'idle'
            ? text('status.ready')
            : status === 'running'
              ? text('status.live')
              : text('status.complete')
        }
        progress={progress}
        active={status === 'running'}
        complete={status === 'done'}
        detail={status === 'running' ? `${(remaining / 1000).toFixed(1)} s` : `${duration} s`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={text('reportTitle')}
          score={cps.toFixed(1)}
          unit="CPS"
          grade={grade}
          gradeLabel={text('rating')}
          newBest={newBest}
          newBestLabel={text('newBest')}
          insight={insight}
          replayLabel={text('again')}
          replayHint={text('replayHint')}
          onReplay={reset}
        >
          <TelemetryGrid>
            <MetricCard label={text('totalClicks')} value={clicks} />
            <MetricCard label={text('peakRate')} value={`${peak.toFixed(1)} CPS`} />
            <MetricCard label={text('consistency')} value={`${consistency}%`} />
            <MetricCard
              label={text('personalBest')}
              value={`${best.toFixed(1)} CPS`}
              accent={newBest}
            />
          </TelemetryGrid>
          <LineChart
            values={rateCurve.values}
            label={text('timeline')}
            durationSeconds={duration}
            samplingLabel={text('sampling')
              .replace('{interval}', String(Math.round(rateCurve.sampleIntervalMs)))
              .replace('{duration}', String(duration))}
          />
        </ReportShell>
      ) : (
        <>
          <button
            type="button"
            className={clsx(funStyles.cpsArena, status === 'running' && funStyles.cpsArenaLive)}
            onPointerDown={registerClick}
            onContextMenu={(event) => event.preventDefault()}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className={funStyles.clickRipple}
                style={{ left: ripple.x, top: ripple.y }}
                aria-hidden="true"
              />
            ))}
            <span className={funStyles.cpsCore}>
              <span>{status === 'idle' ? text('readyLabel') : text('liveLabel')}</span>
              <strong className={funStyles.cpsCount}>{clicks}</strong>
              <span className={funStyles.cpsRate}>
                {liveCps.toFixed(1)} <small>CPS</small>
              </span>
              <span className={funStyles.cpsPrompt}>
                {status === 'idle' ? text('startPrompt') : text('clickPrompt')}
              </span>
            </span>
            <span className={funStyles.cpsCorner}>{text('privacy')}</span>
          </button>
          <TelemetryGrid>
            <MetricCard label={text('liveRate')} value={`${liveCps.toFixed(1)} CPS`} accent />
            <MetricCard label={text('peakRate')} value={`${peak.toFixed(1)} CPS`} />
            <MetricCard label={text('consistency')} value={`${consistency}%`} />
            <MetricCard
              label={text('personalBest')}
              value={best ? `${best.toFixed(1)} CPS` : '—'}
            />
          </TelemetryGrid>
          <LineChart
            values={rateCurve.values}
            label={text('timeline')}
            durationSeconds={duration}
            samplingLabel={text('sampling')
              .replace('{interval}', String(Math.round(rateCurve.sampleIntervalMs)))
              .replace('{duration}', String(duration))}
            activeIndex={
              status === 'running'
                ? Math.min(
                    rateCurve.values.length - 1,
                    Math.floor(progress * (rateCurve.values.length - 1))
                  )
                : undefined
            }
          />
        </>
      )}
    </TestShell>
  );
}

export function SpacebarTest() {
  const text = useGameText('spacebarTest');
  const lab = useLabText();
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<TimedStatus>('idle');
  const [presses, setPresses] = useState(0);
  const [pressTimes, setPressTimes] = useState<number[]>([]);
  const pressesRef = useRef(0);
  const startedAt = useRef(0);
  const { remaining, begin } = useTimedRun(duration, status, () => setStatus('done'));

  const reset = () => {
    setStatus('idle');
    setPresses(0);
    setPressTimes([]);
    pressesRef.current = 0;
    startedAt.current = 0;
  };

  const registerPress = () => {
    if (status === 'done') return;
    if (status === 'idle') {
      startedAt.current = performance.now();
      begin();
      setStatus('running');
    }
    const now = performance.now();
    pressesRef.current += 1;
    setPresses(pressesRef.current);
    setPressTimes((current) => [...current, now]);
  };

  const rate = presses / duration;
  const progress = status === 'done' ? 1 : Math.max(0, 1 - remaining / (duration * 1000));
  const rateCurve = useMemo(
    () => buildRateCurve(pressTimes, startedAt.current, duration),
    [duration, pressTimes]
  );
  const peak = Math.max(0, ...rateCurve.values);
  const buckets = useMemo(() => {
    const values = Array.from({ length: duration }, () => 0);
    pressTimes.forEach((time) => {
      const index = Math.min(
        duration - 1,
        Math.max(0, Math.floor((time - startedAt.current) / 1000))
      );
      values[index] += 1;
    });
    return values;
  }, [duration, pressTimes]);
  const mean = presses / Math.max(1, buckets.filter((value) => value > 0).length);
  const deviation = Math.sqrt(
    buckets.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, buckets.length)
  );
  const consistency = mean ? Math.max(0, Math.round(100 - (deviation / mean) * 100)) : 0;
  const { best, newBest } = useLocalBest(`spacebar.${duration}`, rate, status === 'done', 'higher');
  const grade = rate >= 9 ? 'S' : rate >= 7 ? 'A' : rate >= 5 ? 'B' : rate >= 3 ? 'C' : 'D';

  return (
    <TestShell stem="spacebarTest">
      <Segmented
        value={duration}
        options={[1, 3, 5, 10, 15, 30, 60]}
        onChange={(next) => {
          setDuration(next);
          reset();
        }}
        label={text('duration')}
        format={(value) => `${value} s`}
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
        progress={progress}
        active={status === 'running'}
        complete={status === 'done'}
        detail={status === 'running' ? `${(remaining / 1000).toFixed(1)} s` : `${duration} s`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={rate.toFixed(1)}
          unit="presses/s"
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail').replace('{presses}', String(presses))}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={reset}
        >
          <TelemetryGrid>
            <MetricCard label={lab('total')} value={presses} />
            <MetricCard label={text('peakRate')} value={`${peak.toFixed(1)}/s`} />
            <MetricCard label={lab('consistency')} value={`${consistency}%`} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${best.toFixed(1)}/s` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
          <LineChart
            values={rateCurve.values}
            label={text('timeline')}
            durationSeconds={duration}
            samplingLabel={text('sampling')
              .replace('{interval}', String(Math.round(rateCurve.sampleIntervalMs)))
              .replace('{duration}', String(duration))}
          />
        </ReportShell>
      ) : (
        <>
          <button
            type="button"
            className={funStyles.spacePad}
            onKeyDown={(event) => {
              if (event.code !== 'Space' || event.repeat) return;
              event.preventDefault();
              registerPress();
            }}
            autoFocus
          >
            <span className={funStyles.giantValue}>{presses}</span>
            <kbd className={funStyles.spaceKey}>{text('space')}</kbd>
            <span className={funStyles.timer}>{(remaining / 1000).toFixed(1)} s</span>
          </button>
          <TelemetryGrid>
            <MetricCard
              label={text('liveRate')}
              value={`${(presses / Math.max(0.25, duration - remaining / 1000)).toFixed(1)}/s`}
              accent
            />
            <MetricCard label={text('peakRate')} value={`${peak.toFixed(1)}/s`} />
            <MetricCard label={lab('consistency')} value={`${consistency}%`} />
            <MetricCard label={lab('personalBest')} value={best ? `${best.toFixed(1)}/s` : '—'} />
          </TelemetryGrid>
          <LineChart
            values={rateCurve.values}
            label={text('timeline')}
            durationSeconds={duration}
            samplingLabel={text('sampling')
              .replace('{interval}', String(Math.round(rateCurve.sampleIntervalMs)))
              .replace('{duration}', String(duration))}
            activeIndex={
              status === 'running'
                ? Math.floor(progress * (rateCurve.values.length - 1))
                : undefined
            }
          />
        </>
      )}
      <Instructions>{text('instructions')}</Instructions>
    </TestShell>
  );
}

type ReactionStatus = 'idle' | 'waiting' | 'ready' | 'roundResult' | 'early' | 'done';

export function ReactionTimeTest() {
  const text = useGameText('reactionTime');
  const lab = useLabText();
  const [status, setStatus] = useState<ReactionStatus>('idle');
  const [results, setResults] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const readyAt = useRef(0);
  const timeout = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  const startRound = () => {
    window.clearTimeout(timeout.current);
    setStatus('waiting');
    timeout.current = window.setTimeout(
      () => {
        readyAt.current = performance.now();
        setStatus('ready');
      },
      randomInt(1500, 4000)
    );
  };

  const reset = () => {
    setResults([]);
    setFalseStarts(0);
    startRound();
  };

  const respond = () => {
    if (status === 'done') return;
    if (status === 'idle') {
      reset();
    } else if (status === 'roundResult' || status === 'early') {
      startRound();
    } else if (status === 'waiting') {
      window.clearTimeout(timeout.current);
      setFalseStarts((value) => value + 1);
      setStatus('early');
    } else {
      const result = Math.round(performance.now() - readyAt.current);
      const next = [...results, result];
      setResults(next);
      setStatus(next.length >= 5 ? 'done' : 'roundResult');
    }
  };

  const sorted = [...results].sort((a, b) => a - b);
  const average = results.length
    ? results.reduce((sum, value) => sum + value, 0) / results.length
    : 0;
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const bestRound = sorted[0] ?? 0;
  const { best, newBest } = useLocalBest('reaction.average', average, status === 'done', 'lower');
  const grade =
    average <= 190 ? 'S' : average <= 230 ? 'A' : average <= 280 ? 'B' : average <= 350 ? 'C' : 'D';

  const stateClass =
    status === 'ready'
      ? funStyles.reactionReady
      : status === 'waiting'
        ? funStyles.reactionWaiting
        : status === 'early'
          ? funStyles.reactionEarly
          : undefined;
  const prompt =
    status === 'idle'
      ? text('startPrompt')
      : status === 'waiting'
        ? text('wait')
        : status === 'ready'
          ? text('now')
          : status === 'early'
            ? text('tooSoon')
            : status === 'done'
              ? `${Math.round(average)} ms`
              : `${results.at(-1) ?? 0} ms`;

  return (
    <TestShell stem="reactionTime">
      <SessionBar
        status={
          status === 'done'
            ? lab('status.done')
            : status === 'idle'
              ? lab('status.ready')
              : lab('status.running')
        }
        progress={status === 'done' ? 1 : results.length / 5}
        active={status !== 'idle' && status !== 'done'}
        complete={status === 'done'}
        detail={`${Math.min(results.length + (status === 'done' ? 0 : 1), 5)} / 5`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={Math.round(average).toString()}
          unit="ms"
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail').replace('{falseStarts}', String(falseStarts))}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={reset}
        >
          <TelemetryGrid>
            <MetricCard label={lab('average')} value={`${Math.round(average)} ms`} />
            <MetricCard label={lab('bestRound')} value={`${bestRound} ms`} />
            <MetricCard label={text('median')} value={`${median} ms`} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${Math.round(best)} ms` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
          <div className={funStyles.roundStrip} aria-label={text('roundResults')}>
            {results.map((value, index) => (
              <span key={index}>
                <small>{index + 1}</small>
                <strong>{value}</strong>
                <em>ms</em>
              </span>
            ))}
          </div>
        </ReportShell>
      ) : (
        <button
          type="button"
          className={clsx(funStyles.reactionPad, stateClass)}
          onPointerDown={respond}
        >
          <strong className={funStyles.reactionPrompt}>{prompt}</strong>
          <span>
            {status === 'roundResult' || status === 'early' ? text('nextRound') : text('tapHint')}
          </span>
        </button>
      )}
      <Instructions>{text('instructions')}</Instructions>
    </TestShell>
  );
}

type Point = { x: number; y: number };
const randomPoint = (): Point => ({ x: randomInt(8, 92), y: randomInt(12, 88) });

export function AimTrainer() {
  const text = useGameText('aimTrainer');
  const lab = useLabText();
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [totalTargets, setTotalTargets] = useState(20);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hitTimes, setHitTimes] = useState<number[]>([]);
  const [position, setPosition] = useState<Point>(randomPoint);
  const targetAt = useRef(0);

  const start = () => {
    setHits(0);
    setMisses(0);
    setHitTimes([]);
    setPosition(randomPoint());
    targetAt.current = performance.now();
    setStatus('running');
  };

  const hit = () => {
    const now = performance.now();
    setHitTimes((values) => [...values, now - targetAt.current]);
    const next = hits + 1;
    if (next >= totalTargets) {
      setHits(next);
      setStatus('done');
    } else {
      setHits(next);
      setPosition(randomPoint());
      targetAt.current = now;
    }
  };

  const average = hitTimes.length
    ? hitTimes.reduce((sum, value) => sum + value, 0) / hitTimes.length
    : 0;
  const bestRound = hitTimes.length ? Math.min(...hitTimes) : 0;
  const accuracy = hits + misses ? (hits / (hits + misses)) * 100 : 100;
  const { best, newBest } = useLocalBest(
    `aim.${totalTargets}`,
    average,
    status === 'done',
    'lower'
  );
  const grade =
    average <= 350 ? 'S' : average <= 450 ? 'A' : average <= 600 ? 'B' : average <= 800 ? 'C' : 'D';

  return (
    <TestShell stem="aimTrainer">
      <Segmented
        value={totalTargets}
        options={[20, 30, 50]}
        onChange={(value) => {
          setTotalTargets(value);
          setStatus('idle');
        }}
        label={lab('rounds')}
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
        progress={hits / totalTargets}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${hits} / ${totalTargets}`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={Math.round(average).toString()}
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
            <MetricCard label={lab('accuracy')} value={`${accuracy.toFixed(1)}%`} />
            <MetricCard label={lab('bestRound')} value={`${Math.round(bestRound)} ms`} />
            <MetricCard label={lab('mistakes')} value={misses} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${Math.round(best)} ms` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
        </ReportShell>
      ) : (
        <div
          className={funStyles.gameArea}
          onPointerDown={() => status === 'running' && setMisses((value) => value + 1)}
        >
          {status === 'idle' ? (
            <GamePanel className={funStyles.areaOverlay}>
              <Instructions>{text('instructions')}</Instructions>
              <button type="button" className={funStyles.inlinePrimary} onClick={start}>
                {text('start')}
              </button>
            </GamePanel>
          ) : (
            <button
              type="button"
              className={funStyles.target}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                hit();
              }}
              aria-label={text('target')}
            >
              <span />
            </button>
          )}
        </div>
      )}
    </TestShell>
  );
}

export function MouseAccuracyTest() {
  const text = useGameText('mouseAccuracy');
  const lab = useLabText();
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [totalRounds, setTotalRounds] = useState(20);
  const [round, setRound] = useState(0);
  const [position, setPosition] = useState<Point>(randomPoint);
  const [errors, setErrors] = useState<number[]>([]);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const targetAt = useRef(0);

  const start = () => {
    setRound(0);
    setErrors([]);
    setResponseTimes([]);
    setPosition(randomPoint());
    targetAt.current = performance.now();
    setStatus('running');
  };

  const register = (event: PointerEvent<HTMLDivElement>) => {
    if (status !== 'running') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + (position.x / 100) * rect.width;
    const centerY = rect.top + (position.y / 100) * rect.height;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    const nextErrors = [...errors, distance];
    setErrors(nextErrors);
    setResponseTimes((values) => [...values, performance.now() - targetAt.current]);
    if (round + 1 >= totalRounds) {
      setStatus('done');
    } else {
      setRound((value) => value + 1);
      setPosition(randomPoint());
      targetAt.current = performance.now();
    }
  };

  const average = errors.length ? errors.reduce((sum, value) => sum + value, 0) / errors.length : 0;
  const bestRound = errors.length ? Math.min(...errors) : 0;
  const p90 = errors.length
    ? [...errors].sort((a, b) => a - b)[Math.floor(errors.length * 0.9)]
    : 0;
  const averageTime = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : 0;
  const { best, newBest } = useLocalBest(
    `mouse-accuracy.${totalRounds}`,
    average,
    status === 'done',
    'lower'
  );
  const grade =
    average <= 8 ? 'S' : average <= 14 ? 'A' : average <= 22 ? 'B' : average <= 34 ? 'C' : 'D';
  return (
    <TestShell stem="mouseAccuracy">
      <Segmented
        value={totalRounds}
        options={[12, 20, 30]}
        onChange={(value) => {
          setTotalRounds(value);
          setStatus('idle');
        }}
        label={lab('rounds')}
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
        progress={errors.length / totalRounds}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${errors.length} / ${totalRounds}`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={average.toFixed(1)}
          unit="px"
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
            <MetricCard label={lab('bestRound')} value={`${bestRound.toFixed(1)} px`} />
            <MetricCard label={text('p90Error')} value={`${p90.toFixed(1)} px`} />
            <MetricCard label={text('responseTime')} value={`${Math.round(averageTime)} ms`} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${best.toFixed(1)} px` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
        </ReportShell>
      ) : (
        <div
          className={funStyles.gameArea}
          onPointerDown={register}
          role="application"
          aria-label={text('playArea')}
        >
          {status === 'idle' ? (
            <GamePanel className={funStyles.areaOverlay}>
              <Instructions>{text('instructions')}</Instructions>
              <button type="button" className={funStyles.inlinePrimary} onClick={start}>
                {text('start')}
              </button>
            </GamePanel>
          ) : (
            <span
              className={funStyles.crosshair}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </TestShell>
  );
}

export function ScrollSpeedTest() {
  const text = useGameText('scrollSpeed');
  const lab = useLabText();
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<TimedStatus>('idle');
  const [distance, setDistance] = useState(0);
  const [events, setEvents] = useState<{ time: number; value: number }[]>([]);
  const distanceRef = useRef(0);
  const startedAt = useRef(0);
  const { remaining, begin } = useTimedRun(duration, status, () => setStatus('done'));

  const start = () => {
    distanceRef.current = 0;
    setDistance(0);
    setEvents([]);
    startedAt.current = performance.now();
    begin();
    setStatus('running');
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (status !== 'running') return;
    distanceRef.current += Math.abs(event.deltaY);
    setDistance(Math.round(distanceRef.current));
    setEvents((values) => [...values, { time: performance.now(), value: event.deltaY }]);
  };

  const speed = distance / duration;
  const progress = status === 'done' ? 1 : Math.max(0, 1 - remaining / (duration * 1000));
  const curve = useMemo(
    () => buildWeightedCurve(events, startedAt.current, duration),
    [duration, events]
  );
  const peak = Math.max(0, ...curve.values);
  const reversals = events.reduce((count, event, index) => {
    if (index === 0) return 0;
    return count + (Math.sign(event.value) !== Math.sign(events[index - 1].value) ? 1 : 0);
  }, 0);
  const { best, newBest } = useLocalBest(`scroll.${duration}`, speed, status === 'done', 'higher');
  const grade =
    speed >= 12000 ? 'S' : speed >= 8000 ? 'A' : speed >= 5000 ? 'B' : speed >= 2500 ? 'C' : 'D';

  return (
    <TestShell stem="scrollSpeed">
      <Segmented
        value={duration}
        options={[5, 10, 30, 60]}
        onChange={(value) => {
          setDuration(value);
          setStatus('idle');
          setDistance(0);
        }}
        label={text('duration')}
        format={(value) => `${value} s`}
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
        progress={progress}
        active={status === 'running'}
        complete={status === 'done'}
        detail={status === 'running' ? `${(remaining / 1000).toFixed(1)} s` : `${duration} s`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={Math.round(speed).toLocaleString()}
          unit="px/s"
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail').replace('{distance}', distance.toLocaleString())}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={start}
        >
          <TelemetryGrid>
            <MetricCard label={text('distance')} value={`${distance.toLocaleString()} px`} />
            <MetricCard
              label={text('peakRate')}
              value={`${Math.round(peak).toLocaleString()} px/s`}
            />
            <MetricCard label={text('reversals')} value={reversals} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${Math.round(best).toLocaleString()} px/s` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
          <LineChart
            values={curve.values}
            label={text('timeline')}
            durationSeconds={duration}
            samplingLabel={text('sampling')
              .replace('{interval}', String(Math.round(curve.sampleIntervalMs)))
              .replace('{duration}', String(duration))}
          />
        </ReportShell>
      ) : (
        <>
          <div
            className={funStyles.scrollPad}
            tabIndex={0}
            onWheel={handleWheel}
            role="application"
            aria-label={text('playArea')}
          >
            <div
              className={clsx(
                funStyles.scrollTrack,
                status === 'running' && funStyles.scrollTrackActive
              )}
            />
            <strong>{status === 'idle' ? text('ready') : text('scrollNow')}</strong>
            <span>{text('instructions')}</span>
            {status === 'idle' && (
              <button type="button" className={funStyles.inlinePrimary} onClick={start}>
                {text('start')}
              </button>
            )}
          </div>
          <TelemetryGrid>
            <MetricCard label={text('distance')} value={`${distance.toLocaleString()} px`} />
            <MetricCard
              label={text('liveRate')}
              value={`${Math.round(distance / Math.max(0.25, duration - remaining / 1000)).toLocaleString()} px/s`}
              accent
            />
            <MetricCard
              label={text('peakRate')}
              value={`${Math.round(peak).toLocaleString()} px/s`}
            />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${Math.round(best).toLocaleString()} px/s` : '—'}
            />
          </TelemetryGrid>
        </>
      )}
    </TestShell>
  );
}
