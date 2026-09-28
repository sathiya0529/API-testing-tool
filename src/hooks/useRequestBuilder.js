import { useCallback, useEffect, useRef, useState } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';
import { newRequestModel, hydrateRequest, toExecutePayload, buildUrlPreview } from '../utils/request';
import { requestApi } from '../api/requestApi';
import { getErrorMessage } from '../api/errors';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';

// Owns one request's editable state, unsaved-changes tracking, sending and saving.
export function useRequestBuilder(initial) {
  const base = useRef(hydrateRequest(initial || newRequestModel()));
  const [req, setReq] = useState(base.current);
  const [dirty, setDirty] = useState(false);
  const [response, setResponse] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const { variables, activeEnv, saveRequest: persist } = useWorkspace();
  const toast = useToast();

  useEffect(() => {
    base.current = hydrateRequest(initial || newRequestModel());
    setReq(base.current); setDirty(false); setResponse(null); setSendError('');
  }, [initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback((patch) => {
    setReq((r) => { const next = typeof patch === 'function' ? patch(r) : { ...r, ...patch }; setDirty(JSON.stringify(next) !== JSON.stringify(base.current)); return next; });
  }, []);

  const urlPreview = buildUrlPreview(req.url, req.params, variables);

  const send = useCallback(async () => {
    if (!req.url.trim()) { setSendError('Enter a URL before sending'); return; }
    setSending(true); setSendError('');
    try {
      const payload = toExecutePayload(req, variables, activeEnv?.id);
      const res = await requestApi.executeRequest(payload);
      setResponse(res);
    } catch (e) { setSendError(getErrorMessage(e)); setResponse(null); } finally { setSending(false); }
  }, [req, variables, activeEnv]);

  const save = useCallback(async (over = {}) => {
    const payload = { ...req, ...over };
    const saved = await persist(payload);
    base.current = hydrateRequest(saved); setReq(base.current); setDirty(false);
    return saved;
  }, [req, persist]);

  // Ctrl+Enter send, Ctrl+S save (only while this builder is mounted and focus isn't in a modal).
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); send(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (req.collectionId) save(); else toast.info('Choose a collection to save this request into'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [send, save, req.collectionId, toast]);

  useBeforeUnload(useCallback((e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }, [dirty]));
  const blocker = useBlocker(useCallback(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname, [dirty]));

  return { req, update, dirty, response, setResponse, sending, sendError, send, save, urlPreview, blocker };
}
