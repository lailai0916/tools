import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import TextArea from '@/components/TextArea';
import { useI18n } from '@/i18n';
import styles from './styles.module.css';

// Canonical HTTP status codes. `name` and `description` are the standard English
// reason phrases / definitions and are intentionally NOT translated.
const STATUS_TABLE: { code: number; name: string; description: string }[] = [
  { code: 100, name: 'Continue', description: 'The client should continue with its request.' },
  {
    code: 101,
    name: 'Switching Protocols',
    description: 'The server is switching protocols as requested by the client.',
  },
  {
    code: 200,
    name: 'OK',
    description: 'The request succeeded.',
  },
  {
    code: 201,
    name: 'Created',
    description: 'The request succeeded and a new resource was created.',
  },
  {
    code: 202,
    name: 'Accepted',
    description: 'The request was accepted but not yet processed.',
  },
  {
    code: 204,
    name: 'No Content',
    description: 'The request succeeded but returns no body.',
  },
  {
    code: 206,
    name: 'Partial Content',
    description: 'The server delivered part of the resource for a range request.',
  },
  {
    code: 301,
    name: 'Moved Permanently',
    description: 'The resource has permanently moved to a new URL.',
  },
  {
    code: 302,
    name: 'Found',
    description: 'The resource temporarily resides under a different URL.',
  },
  {
    code: 303,
    name: 'See Other',
    description: 'The response can be found at another URL using GET.',
  },
  {
    code: 304,
    name: 'Not Modified',
    description: 'The cached response is still valid; no need to retransfer.',
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    description: 'The request should be repeated at another URL with the same method.',
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    description: 'The resource permanently moved; repeat with the same method.',
  },
  {
    code: 400,
    name: 'Bad Request',
    description: 'The server cannot process the request due to a client error.',
  },
  {
    code: 401,
    name: 'Unauthorized',
    description: 'Authentication is required and has failed or not been provided.',
  },
  {
    code: 402,
    name: 'Payment Required',
    description: 'Reserved for future use; payment is required.',
  },
  {
    code: 403,
    name: 'Forbidden',
    description: 'The server understood the request but refuses to authorize it.',
  },
  {
    code: 404,
    name: 'Not Found',
    description: 'The server cannot find the requested resource.',
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    description: 'The request method is not supported for this resource.',
  },
  {
    code: 406,
    name: 'Not Acceptable',
    description: 'No content matching the acceptable criteria was found.',
  },
  {
    code: 408,
    name: 'Request Timeout',
    description: 'The server timed out waiting for the request.',
  },
  {
    code: 409,
    name: 'Conflict',
    description: 'The request conflicts with the current state of the resource.',
  },
  {
    code: 410,
    name: 'Gone',
    description: 'The resource is no longer available and will not return.',
  },
  {
    code: 411,
    name: 'Length Required',
    description: 'The request must specify a Content-Length header.',
  },
  {
    code: 413,
    name: 'Payload Too Large',
    description: 'The request body is larger than the server will process.',
  },
  {
    code: 414,
    name: 'URI Too Long',
    description: 'The requested URI is longer than the server will interpret.',
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    description: 'The request payload is in an unsupported format.',
  },
  {
    code: 418,
    name: "I'm a teapot",
    description: 'The server refuses to brew coffee because it is a teapot.',
  },
  {
    code: 422,
    name: 'Unprocessable Entity',
    description: 'The request was well-formed but semantically invalid.',
  },
  {
    code: 425,
    name: 'Too Early',
    description: 'The server is unwilling to risk processing a replayed request.',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    description: 'The client has sent too many requests in a given time.',
  },
  {
    code: 431,
    name: 'Request Header Fields Too Large',
    description: 'The header fields are too large for the server to process.',
  },
  {
    code: 451,
    name: 'Unavailable For Legal Reasons',
    description: 'The resource is unavailable for legal reasons.',
  },
  {
    code: 500,
    name: 'Internal Server Error',
    description: 'The server encountered an unexpected condition.',
  },
  {
    code: 501,
    name: 'Not Implemented',
    description: 'The server does not support the functionality required.',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    description: 'The server got an invalid response from an upstream server.',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    description: 'The server is not ready to handle the request.',
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    description: 'The upstream server failed to respond in time.',
  },
  {
    code: 505,
    name: 'HTTP Version Not Supported',
    description: 'The HTTP version used in the request is not supported.',
  },
  {
    code: 511,
    name: 'Network Authentication Required',
    description: 'The client must authenticate to gain network access.',
  },
];

function classOf(code: number): string {
  return `x${Math.floor(code / 100)}`;
}

export default function HttpStatus() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return STATUS_TABLE;
    }
    return STATUS_TABLE.filter(
      ({ code, name, description }) =>
        String(code).includes(q) ||
        name.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <ToolLayout
      title={t('tools.httpStatus.name')}
      description={t('tools.httpStatus.description')}
      backLabel={t('common.back')}
    >
      <TextArea
        className={styles.input}
        rows={1}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('tools.httpStatus.placeholder')}
        aria-label={t('tools.httpStatus.placeholder')}
      />

      {results.length === 0 ? (
        <p className={styles.hint}>{t('tools.httpStatus.noResults')}</p>
      ) : (
        <div className={styles.results}>
          {results.map(({ code, name, description }) => (
            <div className={styles.item} key={code}>
              <span className={styles.code} data-class={classOf(code)}>
                {code}
              </span>
              <div className={styles.text}>
                <span className={styles.name}>{name}</span>
                <span className={styles.desc}>{description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
