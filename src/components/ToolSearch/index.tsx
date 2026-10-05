import { ButtonLink, Dialog, EmptyState, Icon, IconButton, Input } from '@lailai0916/ui';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useI18n } from '@/i18n';
import type { MessageKey } from '@/i18n/en';
import { TOOLS } from '@/tools/registry';
import { rememberTool } from '@/utils/toolStorage';
import { matchesToolSearch } from '@/utils/toolSearch';
import styles from './styles.module.css';

export default function ToolSearch() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const dialogId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.altKey) return;
      const command =
        (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'k';
      const editable =
        event.target instanceof Element &&
        event.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'
        );
      const slash = event.key === '/' && !event.metaKey && !event.ctrlKey && !editable;
      if ((!command && !slash) || (!open && document.querySelector('dialog[open]'))) return;
      event.preventDefault();
      setOpen((current) => (command ? !current : true));
    };
    const onPopState = () => setOpen(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('popstate', onPopState);
    };
  }, [open]);

  return (
    <>
      <IconButton
        variant="header"
        label={t('site.searchPlaceholder')}
        title={t('site.searchHint')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-keyshortcuts="Meta+K Control+K /"
        onClick={() => setOpen(true)}
      >
        <Icon icon="lucide:search" width={17} />
      </IconButton>
      {open && <SearchDialog id={dialogId} onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => TOOLS.filter((tool) => matchesToolSearch(tool.id, query)), [query]);
  const active = Math.min(selected, Math.max(0, results.length - 1));
  const resultsId = `${id}-results`;

  useEffect(() => {
    resultsRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, query]);

  const choose = (toolId: string) => {
    rememberTool(toolId);
    onClose();
    navigate(`/${toolId}`);
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    });
  };

  return (
    <Dialog open onClose={onClose} id={id} label={t('site.searchPlaceholder')}>
      <div className={styles.searchBox}>
        <Icon icon="lucide:search" width={20} />
        <Input
          autoFocus
          value={query}
          placeholder={t('site.searchPlaceholder')}
          aria-label={t('site.searchPlaceholder')}
          role="combobox"
          aria-expanded="true"
          aria-controls={resultsId}
          aria-autocomplete="list"
          aria-activedescendant={results[active] ? `${id}-${results[active].id}` : undefined}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (results.length && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
              event.preventDefault();
              setSelected(
                (active + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
              );
            } else if (event.key === 'Enter' && results[active]) {
              event.preventDefault();
              choose(results[active].id);
            }
          }}
        />
        <IconButton size="sm" label={t('site.closeSearch')} onClick={onClose}>
          <Icon icon="lucide:x" />
        </IconButton>
      </div>
      <div
        ref={resultsRef}
        id={resultsId}
        className={styles.results}
        role="listbox"
        aria-label={t('site.searchResults')}
      >
        {results.map((tool, index) => (
          <ButtonLink
            key={tool.id}
            id={`${id}-${tool.id}`}
            to={`/${tool.id}`}
            variant="ghost"
            className={styles.result}
            role="option"
            aria-selected={active === index}
            tabIndex={-1}
            leftIcon={<Icon icon={tool.icon} width={20} />}
            onMouseMove={() => setSelected(index)}
            onMouseDown={(event) => {
              if (event.button === 0 && !event.metaKey && !event.ctrlKey) event.preventDefault();
            }}
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                event.button !== 0
              )
                return;
              event.preventDefault();
              choose(tool.id);
            }}
          >
            <span className={styles.resultCopy}>
              <strong>{t(`tools.${tool.key}.name` as MessageKey)}</strong>
              <small>{t(`tools.${tool.key}.description` as MessageKey)}</small>
            </span>
            <Icon icon="lucide:arrow-right" className={styles.resultArrow} />
          </ButtonLink>
        ))}
      </div>
      {results.length === 0 && (
        <EmptyState
          title={t('site.noResults')}
          description={t('site.searchNoResultsDescription')}
        />
      )}
      <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">
        {results.length} {t(results.length === 1 ? 'site.toolAvailable' : 'site.toolsAvailable')}
      </p>
      <div className={styles.footer}>
        <span>{t('site.searchLocal')}</span>
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> {t('site.searchSelect')} <kbd>↵</kbd> {t('site.searchOpen')}
        </span>
      </div>
    </Dialog>
  );
}
