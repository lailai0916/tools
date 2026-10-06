import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type MouseEvent,
} from 'react';

import clsx from 'clsx';

import {
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

  const registerClick = (
    event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (status === 'done') return;
    if (status === 'running' && performance.now() >= startedAt.current + duration * 1000) {
      setStatus('done');
      return;
    }
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
      x: event.type === 'click' ? rect.width / 2 : event.clientX - rect.left,
      y: event.type === 'click' ? rect.height / 2 : event.clientY - rect.top,
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
        continuous
        active={status === 'running'}
        complete={status === 'done'}
        detail={status === 'running' ? `${(remaining / 1000).toFixed(1)} s` : `${duration} s`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={text('reportTitle')}
          score={cps.toFixed(1)}
          unit="CPS"
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
            onClick={(event) => {
              if (event.detail === 0) registerClick(event);
            }}
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
          onClick={(event) => {
            if (event.detail === 0) respond();
          }}
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
