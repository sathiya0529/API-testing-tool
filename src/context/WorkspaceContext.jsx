import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { collectionApi } from '../api/collectionApi';
import { requestApi } from '../api/requestApi';
import { environmentApi } from '../api/environmentApi';
import { testApi } from '../api/testApi';
import { getErrorMessage } from '../api/errors';
import { useResource } from '../hooks/useResource';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { usePrefs } from '../utils/prefsStore';
import { varsFromEnvironment } from '../utils/variables';

const WorkspaceContext = createContext(null);

// Wrap an API call: show a success toast, reload the affected list, surface failures as toasts.
export function WorkspaceProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [prefs, setPrefs] = usePrefs();

  const collections = useResource(collectionApi.getCollections, { enabled: isAuthenticated, initial: [], deps: [isAuthenticated] });
  const environments = useResource(environmentApi.getEnvironments, { enabled: isAuthenticated, initial: [], deps: [isAuthenticated] });
  const history = useResource(requestApi.getHistory, { enabled: isAuthenticated, initial: [], deps: [isAuthenticated] });
  const tests = useResource(testApi.getTests, { enabled: isAuthenticated, initial: [], deps: [isAuthenticated] });

  const activeEnv = useMemo(() => {
    const list = environments.data || [];
    return list.find((e) => e.id === prefs.activeEnvId) || list.find((e) => e.id === prefs.defaultEnvId) || list[0] || null;
  }, [environments.data, prefs.activeEnvId, prefs.defaultEnvId]);
  const variables = useMemo(() => varsFromEnvironment(activeEnv), [activeEnv]);

  useEffect(() => { if (activeEnv && prefs.activeEnvId !== activeEnv.id) setPrefs({ activeEnvId: activeEnv.id }); }, [activeEnv, prefs.activeEnvId, setPrefs]);

  const res = useRef({});
  res.current = { collections, environments, history, tests };

  const act = useCallback(async (fn, { success, reload = [], quiet = false } = {}) => {
    try {
      const result = await fn();
      if (success) toast.success(typeof success === 'function' ? success(result) : success);
      await Promise.all(reload.map((name) => res.current[name].reload({ silent: true })));
      return result;
    } catch (e) {
      if (!quiet) toast.error(getErrorMessage(e));
      throw e;
    }
  }, [toast]);

  const allRequests = useMemo(
    () => (collections.data || []).flatMap((c) => c.requests.map((r) => ({ ...r, collectionName: c.name }))),
    [collections.data],
  );

  const actions = useMemo(() => ({
    createCollection: (name) => act(() => collectionApi.createCollection({ name }), { success: 'Collection created', reload: ['collections'] }),
    renameCollection: (id, name) => act(() => collectionApi.updateCollection(id, { name }), { success: 'Collection renamed', reload: ['collections'] }),
    deleteCollection: (id) => act(() => collectionApi.deleteCollection(id), { success: 'Collection deleted', reload: ['collections', 'tests'] }),
    createFolder: (id, name) => act(() => collectionApi.createFolder(id, { name }), { success: 'Folder created', reload: ['collections'] }),
    renameFolder: (id, fid, name) => act(() => collectionApi.updateFolder(id, fid, { name }), { success: 'Folder renamed', reload: ['collections'] }),
    deleteFolder: (id, fid) => act(() => collectionApi.deleteFolder(id, fid), { success: 'Folder deleted', reload: ['collections'] }),
    saveRequest: (req) => act(() => (req.id ? requestApi.updateRequest(req.id, req) : requestApi.saveRequest(req)), { success: 'Request saved', reload: ['collections'] }),
    createBlankRequest: (data) => act(() => requestApi.saveRequest(data), { success: 'Request created', reload: ['collections'] }),
    renameRequest: (r, name) => act(() => requestApi.updateRequest(r.id, { ...r, name }), { success: 'Request renamed', reload: ['collections'] }),
    duplicateRequest: (id) => act(() => requestApi.duplicateRequest(id), { success: 'Request duplicated', reload: ['collections'] }),
    deleteRequest: (id) => act(() => requestApi.deleteRequest(id), { success: 'Request deleted', reload: ['collections', 'tests'] }),

    createEnvironment: (payload) => act(() => environmentApi.createEnvironment(payload), { success: 'Environment created', reload: ['environments'] }),
    updateEnvironment: (id, payload) => act(() => environmentApi.updateEnvironment(id, payload), { success: 'Environment updated', reload: ['environments'] }),
    deleteEnvironment: (id) => act(() => environmentApi.deleteEnvironment(id), { success: 'Environment deleted', reload: ['environments'] }),
    setActiveEnvironment: (env) => { setPrefs({ activeEnvId: env.id }); toast.success(`Environment changed to ${env.name}`); },

    createTest: (payload) => act(() => testApi.createTest(payload), { success: 'Test created', reload: ['tests'] }),
    updateTest: (id, payload) => act(() => testApi.updateTest(id, payload), { success: 'Test updated', reload: ['tests'] }),
    deleteTest: (id) => act(() => testApi.deleteTest(id), { success: 'Test deleted', reload: ['tests'] }),
    runTest: (id) => act(() => testApi.runTest(id), { reload: ['tests'] }),
    runAllTests: () => act(() => testApi.runAllTests(), { reload: ['tests'] }),

    deleteHistoryItem: (id) => act(() => requestApi.deleteHistoryItem(id), { success: 'History entry deleted', reload: ['history'] }),
    clearHistory: () => act(() => requestApi.clearHistory(), { success: 'History cleared', reload: ['history'] }),
    reloadHistory: () => res.current.history.reload({ silent: true }),
    reloadCollections: () => res.current.collections.reload({ silent: true }),
    reloadEnvironments: () => res.current.environments.reload({ silent: true }),
    reloadTests: () => res.current.tests.reload({ silent: true }),
    reloadAll: () => Promise.all(Object.values(res.current).map((r) => r.reload({ silent: true }))),
  }), [act, setPrefs, toast]);

  const value = useMemo(() => ({
    collections, environments, history, tests, allRequests, activeEnv, variables, ...actions,
  }), [collections, environments, history, tests, allRequests, activeEnv, variables, actions]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export const useWorkspace = () => useContext(WorkspaceContext);
