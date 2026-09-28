import { ConfirmDialog } from '../ui/Modal';

// Wired to the react-router `useBlocker` result from useRequestBuilder.
export default function UnsavedChangesPrompt({ blocker }) {
  if (blocker.state !== 'blocked') return null;
  return (
    <ConfirmDialog open title="Leave this page?" message="You have unsaved changes. Are you sure you want to leave?"
      confirmLabel="Leave" cancelLabel="Stay" danger onConfirm={async () => blocker.proceed()} onCancel={() => blocker.reset()} />
  );
}
