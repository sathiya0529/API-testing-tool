import { useEffect } from 'react';
export function useDocumentTitle(title) {
  useEffect(() => { document.title = title ? `${title} · API Tester` : 'API Tester'; }, [title]);
}
