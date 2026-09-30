import { lazy, Suspense } from 'react';
import type { ApiTokenDialogProps } from './ApiTokenDialog';

// Code-split: the dialog is rarely opened, so its code is only fetched the first time it is.
const ApiTokenDialog = lazy(() => import('./ApiTokenDialog').then((m) => ({ default: m.ApiTokenDialog })));

interface Props extends ApiTokenDialogProps {
  isOpen: boolean;
}

export function ApiTokenModal({ isOpen, ...props }: Props) {
  if (!isOpen) return null;
  return (
    // fallback={null}: the chunk is tiny, so a spinner would only flash.
    <Suspense fallback={null}>
      <ApiTokenDialog {...props} />
    </Suspense>
  );
}
