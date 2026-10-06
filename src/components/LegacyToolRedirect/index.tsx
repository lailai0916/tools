import { Navigate, useLocation } from 'react-router';

export default function LegacyToolRedirect({ target }: { target: string }) {
  const location = useLocation();
  const [pathname, defaults] = target.split('?');
  const params = new URLSearchParams(defaults);
  for (const [key, value] of new URLSearchParams(location.search)) params.set(key, value);
  const search = params.toString();
  return <Navigate replace to={`${pathname}${search ? `?${search}` : ''}${location.hash}`} />;
}
