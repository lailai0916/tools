import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from 'react';
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
  useGameText,
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

export function CpsTest() {
  const text = useGameText('cpsTest');
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<TimedStatus>('idle');
  const [clicks, setClicks] = useState(0);
  const clicksRef = useRef(0);
  const { remaining, begin } = useTimedRun(duration, status, () => setStatus('done'));

  const reset = () => {
    setStatus('idle');
    setClicks(0);
    clicksRef.current = 0;
  };

  const registerClick = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (status === 'done') return;
    if (status === 'idle') {
      begin();
      setStatus('running');
    }
    clicksRef.current += 1;
    setClicks(clicksRef.current);
  };

  const cps = clicks / duration;
  return (
    <TestShell stem="cpsTest">
      <Segmented
        value={duration}
        options={[5, 10, 30]}
        onChange={(next) => {
          setDuration(next);
          reset();
        }}
        label={text('duration')}
        format={(value) => `${value} s`}
        disabled={status === 'running'}
      />
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${cps.toFixed(1)} CPS`}
          detail={text('resultDetail').replace('{clicks}', String(clicks))}
          onReset={reset}
          resetLabel={text('again')}
        />
      ) : (
        <button
          type="button"
          className={funStyles.clickPad}
          onPointerDown={registerClick}
          onContextMenu={(event) => event.preventDefault()}
        >
          <span className={funStyles.giantValue}>{clicks}</span>
          <span className={funStyles.clickPrompt}>
            {status === 'idle' ? text('startPrompt') : text('clickPrompt')}
          </span>
          <span className={funStyles.timer}>{(remaining / 1000).toFixed(1)} s</span>
        </button>
      )}
    </TestShell>
  );
}

export function SpacebarTest() {
  const text = useGameText('spacebarTest');
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<TimedStatus>('idle');
  const [presses, setPresses] = useState(0);
  const pressesRef = useRef(0);
  const { remaining, begin } = useTimedRun(duration, status, () => setStatus('done'));

  const reset = () => {
    setStatus('idle');
    setPresses(0);
    pressesRef.current = 0;
  };

  const registerPress = () => {
    if (status === 'done') return;
    if (status === 'idle') {
      begin();
      setStatus('running');
    }
    pressesRef.current += 1;
    setPresses(pressesRef.current);
  };

  return (
    <TestShell stem="spacebarTest">
      <Segmented
        value={duration}
        options={[5, 10, 30]}
        onChange={(next) => {
          setDuration(next);
          reset();
        }}
        label={text('duration')}
        format={(value) => `${value} s`}
        disabled={status === 'running'}
      />
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${(presses / duration).toFixed(1)} /s`}
          detail={text('resultDetail').replace('{presses}', String(presses))}
          onReset={reset}
          resetLabel={text('again')}
        />
      ) : (
        <button
          type="button"
          className={funStyles.spacePad}
          onClick={() => undefined}
          onKeyDown={(event) => {
            if (event.code !== 'Space' || event.repeat === false) {
              if (event.code !== 'Space') return;
            }
            event.preventDefault();
            registerPress();
          }}
        >
          <span className={funStyles.giantValue}>{presses}</span>
          <kbd className={funStyles.spaceKey}>{text('space')}</kbd>
          <span className={funStyles.timer}>{(remaining / 1000).toFixed(1)} s</span>
        </button>
      )}
      <Instructions>{text('instructions')}</Instructions>
    </TestShell>
  );
}

type ReactionStatus = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

export function ReactionTimeTest() {
  const text = useGameText('reactionTime');
  const [status, setStatus] = useState<ReactionStatus>('idle');
  const [result, setResult] = useState(0);
  const readyAt = useRef(0);
  const timeout = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  const start = () => {
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

  const respond = () => {
    if (status === 'idle' || status === 'result' || status === 'early') {
      start();
    } else if (status === 'waiting') {
      window.clearTimeout(timeout.current);
      setStatus('early');
    } else {
      setResult(Math.round(performance.now() - readyAt.current));
      setStatus('result');
    }
  };

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
            : `${result} ms`;

  return (
    <TestShell stem="reactionTime">
      <button
        type="button"
        className={clsx(funStyles.reactionPad, stateClass)}
        onPointerDown={respond}
      >
        <strong className={funStyles.reactionPrompt}>{prompt}</strong>
        <span>{status === 'result' || status === 'early' ? text('again') : text('tapHint')}</span>
      </button>
      <Instructions>{text('instructions')}</Instructions>
    </TestShell>
  );
}

type Point = { x: number; y: number };
const randomPoint = (): Point => ({ x: randomInt(8, 92), y: randomInt(12, 88) });

export function AimTrainer() {
  const text = useGameText('aimTrainer');
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [hits, setHits] = useState(0);
  const [position, setPosition] = useState<Point>(randomPoint);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  const start = () => {
    setHits(0);
    setPosition(randomPoint());
    startedAt.current = performance.now();
    setStatus('running');
  };

  const hit = () => {
    const next = hits + 1;
    if (next >= 20) {
      setElapsed(performance.now() - startedAt.current);
      setStatus('done');
    } else {
      setHits(next);
      setPosition(randomPoint());
    }
  };

  return (
    <TestShell stem="aimTrainer">
      <Stats>
        <Stat label={text('hits')} value={`${hits} / 20`} />
        <Stat
          label={text('pace')}
          value={status === 'done' ? `${Math.round(elapsed / 20)} ms` : '—'}
        />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${Math.round(elapsed / 20)} ms`}
          detail={text('resultDetail')}
          onReset={start}
          resetLabel={text('again')}
        />
      ) : (
        <div className={funStyles.gameArea}>
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
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [position, setPosition] = useState<Point>(randomPoint);
  const [errors, setErrors] = useState<number[]>([]);

  const start = () => {
    setRound(0);
    setErrors([]);
    setPosition(randomPoint());
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
    if (round + 1 >= 12) {
      setStatus('done');
    } else {
      setRound((value) => value + 1);
      setPosition(randomPoint());
    }
  };

  const average = errors.length ? errors.reduce((sum, value) => sum + value, 0) / errors.length : 0;
  return (
    <TestShell stem="mouseAccuracy">
      <Stats>
        <Stat
          label={text('round')}
          value={`${Math.min(round + (status === 'running' ? 1 : 0), 12)} / 12`}
        />
        <Stat
          label={text('averageError')}
          value={errors.length ? `${average.toFixed(1)} px` : '—'}
        />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${average.toFixed(1)} px`}
          detail={text('resultDetail')}
          onReset={start}
          resetLabel={text('again')}
        />
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
  const [status, setStatus] = useState<TimedStatus>('idle');
  const [distance, setDistance] = useState(0);
  const distanceRef = useRef(0);
  const { remaining, begin } = useTimedRun(5, status, () => setStatus('done'));

  const start = () => {
    distanceRef.current = 0;
    setDistance(0);
    begin();
    setStatus('running');
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (status !== 'running') return;
    distanceRef.current += Math.abs(event.deltaY);
    setDistance(Math.round(distanceRef.current));
  };

  return (
    <TestShell stem="scrollSpeed">
      <Stats>
        <Stat label={text('distance')} value={`${distance.toLocaleString()} px`} />
        <Stat label={text('time')} value={`${(remaining / 1000).toFixed(1)} s`} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${Math.round(distance / 5).toLocaleString()} px/s`}
          detail={text('resultDetail').replace('{distance}', distance.toLocaleString())}
          onReset={start}
          resetLabel={text('again')}
        />
      ) : (
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
      )}
    </TestShell>
  );
}
