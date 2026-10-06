import { TextArea } from '@lailai0916/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useI18n } from '@/i18n';
import {
  GamePanel,
  Instructions,
  MetricCard,
  ReportShell,
  SessionBar,
  TelemetryGrid,
  TestShell,
  funStyles,
  randomInt,
  useGameText,
  useLabText,
  useLocalBest,
} from './shared';

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
  const composing = useRef(false);

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

  const update = (value: string, complete = true) => {
    const limited = value.slice(0, prompt.length);
    if (limited.length < input.length) setCorrections((count) => count + 1);
    if (status === 'idle' && limited.length > 0) {
      startedAt.current = performance.now();
      setStatus('running');
    }
    setInput(limited);
    if (complete && limited.length === prompt.length) {
      setElapsed(performance.now() - startedAt.current);
      setStatus('done');
    }
  };

  const correctCharacters = useMemo(
    () => input.split('').filter((character, index) => character === prompt[index]).length,
    [input, prompt]
  );
  const accuracy = input.length ? (correctCharacters / input.length) * 100 : 100;
  const scoredElapsed = Math.max(elapsed, 1);
  const minutes = scoredElapsed / 60000;
  const speed =
    locale === 'zh-Hans'
      ? Math.round(correctCharacters / minutes)
      : Math.round(correctCharacters / 5 / minutes);
  const rawCpm = Math.round(input.length / minutes);
  const unit = locale === 'zh-Hans' ? text('cpm') : text('wpm');
  const { best, newBest } = useLocalBest(`typing.${locale}.speed`, speed, status === 'done');

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
          <TextArea
            className={funStyles.typingInput}
            value={input}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={(event) => {
              composing.current = false;
              update(event.currentTarget.value);
            }}
            onChange={(event) => update(event.target.value, !composing.current)}
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
