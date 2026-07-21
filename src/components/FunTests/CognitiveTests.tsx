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
  useGameText,
  useLabText,
  useLocalBest,
} from './shared';

type Problem = { left: number; right: number; operator: '+' | '−' | '×'; answer: number };

function makeProblem(): Problem {
  const operator = (['+', '−', '×'] as const)[randomInt(0, 2)];
  if (operator === '×') {
    const left = randomInt(2, 12);
    const right = randomInt(2, 12);
    return { left, right, operator, answer: left * right };
  }
  const a = randomInt(4, 60);
  const b = randomInt(2, 40);
  if (operator === '−') {
    const left = Math.max(a, b);
    const right = Math.min(a, b);
    return { left, right, operator, answer: left - right };
  }
  return { left: a, right: b, operator, answer: a + b };
}

export function ArithmeticSprintTest() {
  const text = useGameText('arithmeticSprint');
  const lab = useLabText();
  const [questionCount, setQuestionCount] = useState(15);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [problem, setProblem] = useState(makeProblem);
  const [answer, setAnswer] = useState('');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [lastResult, setLastResult] = useState<{ correct: boolean; answer: number } | null>(null);
  const startedAt = useRef(0);
  const questionStartedAt = useRef(0);

  const start = () => {
    const now = performance.now();
    setProblem(makeProblem());
    setAnswer('');
    setRound(0);
    setCorrect(0);
    setElapsed(0);
    setResponseTimes([]);
    setLastResult(null);
    startedAt.current = now;
    questionStartedAt.current = now;
    setStatus('running');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const now = performance.now();
    const isCorrect = Number(answer) === problem.answer;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setCorrect(nextCorrect);
    setResponseTimes((values) => [...values, now - questionStartedAt.current]);
    setLastResult({ correct: isCorrect, answer: problem.answer });
    if (round + 1 >= questionCount) {
      setElapsed(now - startedAt.current);
      setStatus('done');
      return;
    }
    setRound((value) => value + 1);
    setProblem(makeProblem());
    setAnswer('');
    questionStartedAt.current = now;
  };

  const accuracy = questionCount ? (correct / questionCount) * 100 : 0;
  const averageResponse = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : 0;
  const scoredElapsed = Math.max(elapsed, questionCount * 200);
  const pace = elapsed > 0 ? Math.round(correct / (scoredElapsed / 60000)) : 0;
  const { best, newBest } = useLocalBest(
    `arithmetic.${questionCount}.pace`,
    pace,
    status === 'done'
  );
  const grade =
    accuracy >= 95 && pace >= 25
      ? 'S'
      : accuracy >= 90 && pace >= 18
        ? 'A'
        : accuracy >= 80
          ? 'B'
          : accuracy >= 65
            ? 'C'
            : 'D';

  return (
    <TestShell stem="arithmeticSprint">
      <Segmented
        value={questionCount}
        options={[10, 15, 25]}
        onChange={setQuestionCount}
        label={text('questions')}
        format={(value) => `${value}`}
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
        progress={status === 'done' ? 1 : round / questionCount}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${Math.min(round + (status === 'running' ? 1 : 0), questionCount)} / ${questionCount}`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={pace.toString()}
          unit={text('paceUnit')}
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail')
            .replace('{correct}', String(correct))
            .replace('{total}', String(questionCount))
            .replace('{time}', (elapsed / 1000).toFixed(1))}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={start}
        >
          <TelemetryGrid>
            <MetricCard label={lab('accuracy')} value={`${accuracy.toFixed(0)}%`} />
            <MetricCard
              label={text('averageResponse')}
              value={`${(averageResponse / 1000).toFixed(2)} s`}
            />
            <MetricCard label={lab('mistakes')} value={questionCount - correct} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${Math.round(best)} ${text('paceUnit')}` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
        </ReportShell>
      ) : status === 'idle' ? (
        <GamePanel>
          <Instructions>
            {text('instructions').replace('{count}', String(questionCount))}
          </Instructions>
          <button type="button" className={funStyles.inlinePrimary} onClick={start}>
            {text('start')}
          </button>
        </GamePanel>
      ) : (
        <GamePanel>
          <strong className={funStyles.mathProblem}>
            {problem.left} {problem.operator} {problem.right}
          </strong>
          <form className={funStyles.answerForm} onSubmit={submit}>
            <label htmlFor="arithmetic-answer">{text('answer')}</label>
            <input
              id="arithmetic-answer"
              className={funStyles.textInput}
              inputMode="numeric"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value.replace(/[^0-9-]/g, ''));
                if (lastResult) setLastResult(null);
              }}
              autoFocus
            />
            <button type="submit" className={funStyles.inlinePrimary} disabled={answer === ''}>
              {text('submit')}
            </button>
          </form>
          {lastResult && (
            <div className={funStyles.answerReveal} aria-live="polite">
              {lastResult.correct
                ? text('feedbackCorrect')
                : text('feedbackWrong').replace('{answer}', String(lastResult.answer))}
            </div>
          )}
        </GamePanel>
      )}
    </TestShell>
  );
}

type Stimulus = 'go' | 'stop';

export function GoNoGoTest() {
  const text = useGameText('goNoGo');
  const lab = useLabText();
  const [trialCount, setTrialCount] = useState(20);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [stimulus, setStimulus] = useState<Stimulus>('go');
  const [visible, setVisible] = useState(false);
  const [hits, setHits] = useState(0);
  const [correctStops, setCorrectStops] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const responded = useRef(false);
  const stimulusAt = useRef(0);

  useEffect(() => {
    if (status !== 'running') return;
    responded.current = false;
    stimulusAt.current = performance.now();
    setVisible(true);
    const displayTimer = window.setTimeout(() => {
      setVisible(false);
      if (stimulus === 'go' && !responded.current) setMisses((value) => value + 1);
      if (stimulus === 'stop' && !responded.current) setCorrectStops((value) => value + 1);
    }, 650);
    const nextTimer = window.setTimeout(() => {
      if (round + 1 >= trialCount) {
        setStatus('done');
      } else {
        setStimulus(Math.random() < 0.72 ? 'go' : 'stop');
        setRound((value) => value + 1);
      }
    }, 900);
    return () => {
      window.clearTimeout(displayTimer);
      window.clearTimeout(nextTimer);
    };
  }, [round, status, stimulus, trialCount]);

  const respond = () => {
    if (status !== 'running' || !visible || responded.current) return;
    responded.current = true;
    if (stimulus === 'go') {
      setHits((value) => value + 1);
      setResponseTimes((values) => [...values, performance.now() - stimulusAt.current]);
    } else {
      setFalseAlarms((value) => value + 1);
    }
  };

  useEffect(() => {
    if (status !== 'running') return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return;
      event.preventDefault();
      respond();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const start = () => {
    setRound(0);
    setHits(0);
    setCorrectStops(0);
    setMisses(0);
    setFalseAlarms(0);
    setResponseTimes([]);
    setStimulus('go');
    setVisible(false);
    setStatus('running');
  };

  const correctTrials = hits + correctStops;
  const accuracy = trialCount ? (correctTrials / trialCount) * 100 : 0;
  const averageResponse = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : 0;
  const { best, newBest } = useLocalBest(
    `go-no-go.${trialCount}.accuracy`,
    accuracy,
    status === 'done'
  );
  const grade =
    accuracy >= 97 && falseAlarms === 0
      ? 'S'
      : accuracy >= 92
        ? 'A'
        : accuracy >= 82
          ? 'B'
          : accuracy >= 70
            ? 'C'
            : 'D';

  return (
    <TestShell stem="goNoGo">
      <Segmented
        value={trialCount}
        options={[20, 40, 60]}
        onChange={setTrialCount}
        label={text('trials')}
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
        progress={status === 'done' ? 1 : round / trialCount}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${Math.min(round + (status === 'running' ? 1 : 0), trialCount)} / ${trialCount}`}
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
          insight={text('resultDetail')
            .replace('{misses}', String(misses))
            .replace('{falseAlarms}', String(falseAlarms))}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={start}
        >
          <TelemetryGrid>
            <MetricCard label={text('hits')} value={hits} />
            <MetricCard label={text('correctStops')} value={correctStops} />
            <MetricCard
              label={text('averageResponse')}
              value={averageResponse ? `${Math.round(averageResponse)} ms` : '—'}
            />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${best.toFixed(0)}%` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
          <div className={funStyles.roundStrip}>
            <span>
              {text('misses')}: {misses}
            </span>
            <span>
              {text('falseAlarms')}: {falseAlarms}
            </span>
          </div>
        </ReportShell>
      ) : status === 'idle' ? (
        <GamePanel>
          <Instructions>{text('instructions')}</Instructions>
          <div className={funStyles.goLegend}>
            <span>
              <i className={funStyles.goSignal} /> {text('go')}
            </span>
            <span>
              <i className={funStyles.stopSignal} /> {text('stop')}
            </span>
          </div>
          <button type="button" className={funStyles.inlinePrimary} onClick={start}>
            {text('start')}
          </button>
        </GamePanel>
      ) : (
        <button type="button" className={funStyles.goPad} onPointerDown={respond}>
          <span
            className={clsx(
              funStyles.goOrb,
              visible && (stimulus === 'go' ? funStyles.goSignal : funStyles.stopSignal)
            )}
          />
          <strong>
            {visible ? (stimulus === 'go' ? text('tap') : text('hold')) : text('wait')}
          </strong>
        </button>
      )}
    </TestShell>
  );
}

const EN_PROMPTS = [
  'Small daily practice builds steady focus and accurate hands. Keep a relaxed rhythm while you type each word.',
  'Bright morning light crossed the quiet room as the keyboard waited for another clear and careful sentence.',
  'Fast typing comes from consistent movement, gentle corrections, and attention to the words directly ahead.',
];
const ZH_PROMPTS = [
  '每天进行短暂练习，可以逐步提升专注力与准确度。输入时保持放松，并注意稳定的节奏。',
  '清晨的光线穿过安静的房间，键盘等待着下一段清晰、准确而流畅的文字。',
  '快速打字来自稳定的动作、及时的修正，以及对眼前每个词语持续而细致的关注。',
];

export function TypingSpeedTest() {
  const text = useGameText('typingSpeed');
  const lab = useLabText();
  const { locale } = useI18n();
  const prompts = locale === 'zh-Hans' ? ZH_PROMPTS : EN_PROMPTS;
  const [promptIndex, setPromptIndex] = useState(() => randomInt(0, prompts.length - 1));
  const prompt = prompts[promptIndex % prompts.length];
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [input, setInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [corrections, setCorrections] = useState(0);
  const startedAt = useRef(0);

  useEffect(() => {
    if (status !== 'running') return;
    let frame = 0;
    const tick = () => {
      setElapsed(performance.now() - startedAt.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  const reset = () => {
    setPromptIndex((value) => (value + 1) % prompts.length);
    setInput('');
    setElapsed(0);
    setCorrections(0);
    setStatus('idle');
  };

  const update = (value: string) => {
    const limited = value.slice(0, prompt.length);
    if (limited.length < input.length) setCorrections((count) => count + 1);
    if (status === 'idle' && limited.length > 0) {
      startedAt.current = performance.now();
      setStatus('running');
    }
    setInput(limited);
    if (limited.length === prompt.length) {
      setElapsed(performance.now() - startedAt.current);
      setStatus('done');
    }
  };

  const correctCharacters = useMemo(
    () => input.split('').filter((character, index) => character === prompt[index]).length,
    [input, prompt]
  );
  const accuracy = input.length ? (correctCharacters / input.length) * 100 : 100;
  const scoredElapsed = Math.max(elapsed, input.length * 25, 1);
  const minutes = scoredElapsed / 60000;
  const speed =
    locale === 'zh-Hans'
      ? Math.round(correctCharacters / minutes)
      : Math.round(correctCharacters / 5 / minutes);
  const rawCpm = Math.round(input.length / minutes);
  const unit = locale === 'zh-Hans' ? text('cpm') : text('wpm');
  const { best, newBest } = useLocalBest(`typing.${locale}.speed`, speed, status === 'done');
  const grade =
    accuracy >= 98 && speed >= (locale === 'zh-Hans' ? 55 : 60)
      ? 'S'
      : accuracy >= 95 && speed >= (locale === 'zh-Hans' ? 40 : 45)
        ? 'A'
        : accuracy >= 90
          ? 'B'
          : accuracy >= 80
            ? 'C'
            : 'D';

  return (
    <TestShell stem="typingSpeed">
      <SessionBar
        status={
          status === 'idle'
            ? lab('status.ready')
            : status === 'running'
              ? lab('status.running')
              : lab('status.done')
        }
        progress={input.length / prompt.length}
        active={status === 'running'}
        complete={status === 'done'}
        detail={`${input.length} / ${prompt.length}`}
      />
      {status === 'done' ? (
        <ReportShell
          eyebrow={lab('report')}
          score={speed.toString()}
          unit={unit}
          grade={grade}
          gradeLabel={lab('rating')}
          newBest={newBest}
          newBestLabel={lab('newBest')}
          insight={text('resultDetail').replace('{accuracy}', accuracy.toFixed(0))}
          replayLabel={text('again')}
          replayHint={lab('replayHint')}
          onReplay={reset}
        >
          <TelemetryGrid>
            <MetricCard label={lab('accuracy')} value={`${accuracy.toFixed(1)}%`} />
            <MetricCard label={text('rawSpeed')} value={`${rawCpm} ${text('cpm')}`} />
            <MetricCard label={text('corrections')} value={corrections} />
            <MetricCard
              label={lab('personalBest')}
              value={best ? `${Math.round(best)} ${unit}` : '—'}
              accent={newBest}
            />
          </TelemetryGrid>
        </ReportShell>
      ) : (
        <GamePanel>
          <p className={funStyles.typingPrompt} aria-label={text('prompt')}>
            {prompt.split('').map((character, index) => (
              <span
                key={index}
                className={clsx(
                  index < input.length &&
                    (input[index] === character ? funStyles.charCorrect : funStyles.charWrong),
                  index === input.length && funStyles.charCurrent
                )}
              >
                {character}
              </span>
            ))}
          </p>
          <textarea
            className={funStyles.typingInput}
            value={input}
            onChange={(event) => update(event.target.value)}
            onPaste={(event) => event.preventDefault()}
            placeholder={text('placeholder')}
            aria-label={text('input')}
            autoFocus
          />
          <TelemetryGrid>
            <MetricCard label={unit} value={status === 'idle' ? '—' : speed} />
            <MetricCard label={lab('accuracy')} value={`${accuracy.toFixed(0)}%`} />
            <MetricCard label={lab('time')} value={`${(elapsed / 1000).toFixed(1)} s`} />
          </TelemetryGrid>
          <Instructions>{text('instructions')}</Instructions>
        </GamePanel>
      )}
    </TestShell>
  );
}
