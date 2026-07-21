import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
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
  useGameText,
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
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [problem, setProblem] = useState(makeProblem);
  const [answer, setAnswer] = useState('');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  const start = () => {
    setProblem(makeProblem());
    setAnswer('');
    setRound(0);
    setCorrect(0);
    setElapsed(0);
    startedAt.current = performance.now();
    setStatus('running');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextCorrect = correct + (Number(answer) === problem.answer ? 1 : 0);
    setCorrect(nextCorrect);
    if (round + 1 >= 15) {
      setElapsed(performance.now() - startedAt.current);
      setStatus('done');
    } else {
      setRound((value) => value + 1);
      setProblem(makeProblem());
      setAnswer('');
    }
  };

  return (
    <TestShell stem="arithmeticSprint">
      <Stats>
        <Stat
          label={text('progress')}
          value={`${Math.min(round + (status === 'running' ? 1 : 0), 15)} / 15`}
        />
        <Stat label={text('correct')} value={correct} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${correct} / 15`}
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
              onChange={(event) => setAnswer(event.target.value.replace(/[^0-9-]/g, ''))}
              autoFocus
            />
            <button type="submit" className={funStyles.inlinePrimary} disabled={answer === ''}>
              {text('submit')}
            </button>
          </form>
        </GamePanel>
      )}
    </TestShell>
  );
}

type Stimulus = 'go' | 'stop';

export function GoNoGoTest() {
  const text = useGameText('goNoGo');
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [round, setRound] = useState(0);
  const [stimulus, setStimulus] = useState<Stimulus>('go');
  const [visible, setVisible] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const responded = useRef(false);

  useEffect(() => {
    if (status !== 'running') return;
    responded.current = false;
    setVisible(true);
    const displayTimer = window.setTimeout(() => {
      setVisible(false);
      if (stimulus === 'go' && !responded.current) setMisses((value) => value + 1);
    }, 650);
    const nextTimer = window.setTimeout(() => {
      if (round >= 19) {
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
  }, [round, status, stimulus]);

  const start = () => {
    setRound(0);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setStimulus('go');
    setVisible(false);
    setStatus('running');
  };

  const respond = () => {
    if (status !== 'running' || !visible || responded.current) return;
    responded.current = true;
    if (stimulus === 'go') setHits((value) => value + 1);
    else setFalseAlarms((value) => value + 1);
  };

  const keyRespond = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.code === 'Space') {
      event.preventDefault();
      respond();
    }
  };

  const score = Math.max(0, hits - falseAlarms);
  return (
    <TestShell stem="goNoGo">
      <Stats>
        <Stat
          label={text('progress')}
          value={`${Math.min(round + (status === 'running' ? 1 : 0), 20)} / 20`}
        />
        <Stat label={text('hits')} value={hits} />
        <Stat label={text('falseAlarms')} value={falseAlarms} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={score}
          detail={text('resultDetail')
            .replace('{misses}', String(misses))
            .replace('{falseAlarms}', String(falseAlarms))}
          onReset={start}
          resetLabel={text('again')}
        />
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
        <button
          type="button"
          className={funStyles.goPad}
          onPointerDown={respond}
          onKeyDown={keyRespond}
        >
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
  const { locale } = useI18n();
  const prompts = locale === 'zh-Hans' ? ZH_PROMPTS : EN_PROMPTS;
  const [promptIndex, setPromptIndex] = useState(() => randomInt(0, prompts.length - 1));
  const prompt = prompts[promptIndex % prompts.length];
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [input, setInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
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
    setStatus('idle');
  };

  const update = (value: string) => {
    const limited = value.slice(0, prompt.length);
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
  const minutes = Math.max(elapsed / 60000, 1 / 60000);
  const wpm =
    locale === 'zh-Hans'
      ? Math.round(correctCharacters / minutes)
      : Math.round(correctCharacters / 5 / minutes);

  return (
    <TestShell stem="typingSpeed">
      <Stats>
        <Stat
          label={locale === 'zh-Hans' ? text('cpm') : text('wpm')}
          value={status === 'idle' ? '—' : wpm}
        />
        <Stat label={text('accuracy')} value={`${accuracy.toFixed(0)}%`} />
        <Stat label={text('time')} value={`${(elapsed / 1000).toFixed(1)} s`} />
      </Stats>
      {status === 'done' ? (
        <Result
          title={text('result')}
          value={`${wpm} ${locale === 'zh-Hans' ? text('cpm') : text('wpm')}`}
          detail={text('resultDetail').replace('{accuracy}', accuracy.toFixed(0))}
          onReset={reset}
          resetLabel={text('again')}
        />
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
          <Instructions>{text('instructions')}</Instructions>
        </GamePanel>
      )}
    </TestShell>
  );
}
