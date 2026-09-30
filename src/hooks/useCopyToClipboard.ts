import { useState } from 'react';

/** Copies text and reports `copied` for 2s. Clipboard can reject (permissions, insecure context), so success is only claimed when it worked. */
export function useCopyToClipboard(): [copied: boolean, copy: (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {},
    );
  };
  return [copied, copy];
}
