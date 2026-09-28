import { dispatch, toAxiosError } from './handlers';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Axios adapter: receives the fully built config (after interceptors) and answers like a server would.
export default async function mockAdapter(config) {
  await wait(120 + Math.random() * 180);
  try {
    const result = await dispatch(config);
    if (result.delay) await wait(result.delay);
    return { data: result.data, status: result.status, statusText: 'OK', headers: {}, config, request: {} };
  } catch (e) {
    throw toAxiosError(e, config);
  }
}
