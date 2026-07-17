import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import Button from '@/components/Button';
import TextArea from '@/components/TextArea';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

type Token =
  | { t: 'num'; v: number }
  | { t: 'op'; v: string }
  | { t: 'fn'; v: string }
  | { t: 'lp' }
  | { t: 'rp' };

const FUNCS = new Set(['sqrt', 'abs', 'floor', 'ceil', 'round', 'sin', 'cos', 'tan', 'log', 'ln']);
const PREC: Record<string, number> = {
  'u-': 5,
  'u+': 5,
  '^': 4,
  '*': 3,
  '/': 3,
  '%': 3,
  '+': 2,
  '-': 2,
};
const RIGHT = new Set(['^', 'u-', 'u+']);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let prev: 'start' | 'val' | 'op' | 'lp' | 'rp' | 'fn' = 'start';
  let i = 0;
  const isDigit = (c: string) => c >= '0' && c <= '9';
  const isAlpha = (c: string) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');

  while (i < input.length) {
    const c = input[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++;
      continue;
    }
    if (isDigit(c) || c === '.') {
      const re = /[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/y;
      re.lastIndex = i;
      const m = re.exec(input);
      if (!m || m.index !== i) {
        throw new Error('bad number');
      }
      const v = Number(m[0]);
      if (!Number.isFinite(v)) {
        throw new Error('bad number');
      }
      tokens.push({ t: 'num', v });
      i += m[0].length;
      prev = 'val';
      continue;
    }
    if (isAlpha(c)) {
      let j = i;
      while (j < input.length && isAlpha(input[j])) {
        j++;
      }
      const name = input.slice(i, j).toLowerCase();
      i = j;
      if (name === 'pi') {
        tokens.push({ t: 'num', v: Math.PI });
        prev = 'val';
      } else if (name === 'e') {
        tokens.push({ t: 'num', v: Math.E });
        prev = 'val';
      } else if (FUNCS.has(name)) {
        tokens.push({ t: 'fn', v: name });
        prev = 'fn';
      } else {
        throw new Error(`unknown identifier: ${name}`);
      }
      continue;
    }
    if (c === '(') {
      tokens.push({ t: 'lp' });
      i++;
      prev = 'lp';
      continue;
    }
    if (c === ')') {
      tokens.push({ t: 'rp' });
      i++;
      prev = 'rp';
      continue;
    }
    if ('+-*/%^'.includes(c)) {
      let op = c;
      if ((c === '-' || c === '+') && (prev === 'start' || prev === 'op' || prev === 'lp')) {
        op = c === '-' ? 'u-' : 'u+';
      }
      tokens.push({ t: 'op', v: op });
      i++;
      prev = 'op';
      continue;
    }
    throw new Error(`unexpected character: ${c}`);
  }
  return tokens;
}

function toRPN(tokens: Token[]): Token[] {
  const out: Token[] = [];
  const stack: Token[] = [];
  for (const tk of tokens) {
    if (tk.t === 'num') {
      out.push(tk);
    } else if (tk.t === 'fn') {
      stack.push(tk);
    } else if (tk.t === 'op') {
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.t !== 'op') {
          break;
        }
        const higher = RIGHT.has(tk.v) ? PREC[top.v] > PREC[tk.v] : PREC[top.v] >= PREC[tk.v];
        if (!higher) {
          break;
        }
        out.push(stack.pop() as Token);
      }
      stack.push(tk);
    } else if (tk.t === 'lp') {
      stack.push(tk);
    } else {
      let matched = false;
      while (stack.length > 0) {
        const top = stack.pop() as Token;
        if (top.t === 'lp') {
          matched = true;
          break;
        }
        out.push(top);
      }
      if (!matched) {
        throw new Error('mismatched parentheses');
      }
      if (stack.length > 0 && stack[stack.length - 1].t === 'fn') {
        out.push(stack.pop() as Token);
      }
    }
  }
  while (stack.length > 0) {
    const top = stack.pop() as Token;
    if (top.t === 'lp' || top.t === 'rp') {
      throw new Error('mismatched parentheses');
    }
    out.push(top);
  }
  return out;
}

function applyBinary(op: string, a: number, b: number): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) {
        throw new Error('division by zero');
      }
      return a / b;
    case '%':
      if (b === 0) {
        throw new Error('division by zero');
      }
      return a % b;
    case '^':
      return Math.pow(a, b);
    default:
      throw new Error('unknown operator');
  }
}

function applyFn(name: string, x: number): number {
  switch (name) {
    case 'sqrt':
      return Math.sqrt(x);
    case 'abs':
      return Math.abs(x);
    case 'floor':
      return Math.floor(x);
    case 'ceil':
      return Math.ceil(x);
    case 'round':
      return Math.round(x);
    case 'sin':
      return Math.sin(x);
    case 'cos':
      return Math.cos(x);
    case 'tan':
      return Math.tan(x);
    case 'log':
      return Math.log10(x);
    case 'ln':
      return Math.log(x);
    default:
      throw new Error('unknown function');
  }
}

function evalRPN(rpn: Token[]): number {
  const stack: number[] = [];
  for (const tk of rpn) {
    if (tk.t === 'num') {
      stack.push(tk.v);
    } else if (tk.t === 'op') {
      if (tk.v === 'u-') {
        if (stack.length < 1) {
          throw new Error('invalid expression');
        }
        stack.push(-(stack.pop() as number));
      } else if (tk.v === 'u+') {
        if (stack.length < 1) {
          throw new Error('invalid expression');
        }
      } else {
        if (stack.length < 2) {
          throw new Error('invalid expression');
        }
        const b = stack.pop() as number;
        const a = stack.pop() as number;
        stack.push(applyBinary(tk.v, a, b));
      }
    } else if (tk.t === 'fn') {
      if (stack.length < 1) {
        throw new Error('invalid expression');
      }
      stack.push(applyFn(tk.v, stack.pop() as number));
    } else {
      throw new Error('invalid expression');
    }
  }
  if (stack.length !== 1) {
    throw new Error('invalid expression');
  }
  const r = stack[0];
  if (!Number.isFinite(r)) {
    throw new Error('result is not a finite number');
  }
  return r;
}

function fmt(n: number): string {
  if (Number.isInteger(n)) {
    return String(n);
  }
  const r = Math.round(n * 1e12) / 1e12;
  return Object.is(r, -0) ? '0' : String(r);
}

type Result = { kind: 'empty' } | { kind: 'error' } | { kind: 'ok'; value: string };

function evaluate(input: string): Result {
  if (input.trim() === '') {
    return { kind: 'empty' };
  }
  try {
    return { kind: 'ok', value: fmt(evalRPN(toRPN(tokenize(input)))) };
  } catch {
    return { kind: 'error' };
  }
}

export default function MathEvaluator() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const result = useMemo(() => evaluate(input), [input]);
  const value = result.kind === 'ok' ? result.value : '';

  return (
    <ToolLayout
      title={t('tools.mathEvaluator.name')}
      description={t('tools.mathEvaluator.description')}
      backLabel={t('common.back')}
    >
      <div className={styles.controls}>
        <label className={styles.paneLabel}>{t('common.input')}</label>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          {t('common.clear')}
        </Button>
      </div>

      <TextArea
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        invalid={result.kind === 'error'}
        placeholder={t('tools.mathEvaluator.placeholder')}
        aria-label={t('common.input')}
      />

      {result.kind === 'error' && <p className={styles.error}>{t('tools.mathEvaluator.error')}</p>}
      {result.kind === 'empty' && <p className={styles.hint}>{t('tools.mathEvaluator.empty')}</p>}

      {result.kind === 'ok' && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('tools.mathEvaluator.result')}</span>
          <code className={styles.rowValue}>{value}</code>
          <CopyButton value={value} label={t('common.copy')} copiedLabel={t('common.copied')} />
        </div>
      )}
    </ToolLayout>
  );
}
