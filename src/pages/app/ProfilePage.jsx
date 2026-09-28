import { useRef, useState } from 'react';
import { Camera, Save, Trash2, User } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { TextField } from '../../components/ui/Fields';
import Avatar from '../../components/ui/Avatar';
import { ConfirmDialog } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../api/errors';
import { resizeImage } from '../../utils/download';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: user?.name || '', username: user?.username || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const dirty = form.name !== user?.name || form.username !== user?.username;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^[a-z0-9_.-]{3,24}$/i.test(form.username)) errs.username = 'Use 3-24 letters, numbers, dots, dashes or underscores';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try { const u = await userApi.updateProfile(form); updateUser(u); toast.success('Profile updated'); }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setSaving(false); }
  };

  const onPick = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    setUploading(true);
    try { const blob = await resizeImage(file); const { avatarUrl } = await userApi.uploadProfilePicture(blob); updateUser({ avatarUrl }); toast.success('Profile picture updated'); }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setUploading(false); }
  };

  const remove = async () => {
    try { await userApi.removeProfilePicture(); updateUser({ avatarUrl: null }); toast.success('Profile picture removed'); }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setRemoveOpen(false); }
  };

  return (
    <div className="page settings-page">
      <PageHeader title="Profile" />
      <section className="card settings-section profile-pic-section">
        <div className="row gap-16">
          <div className="avatar-upload">
            <Avatar user={user} size="xl" />
            <button className="avatar-edit" onClick={() => fileRef.current?.click()} aria-label="Change profile picture" disabled={uploading}><Camera size={14} /></button>
          </div>
          <div>
            <div className="row gap-8">
              <Button icon={Camera} loading={uploading} onClick={() => fileRef.current?.click()}>{user?.avatarUrl ? 'Change photo' : 'Upload photo'}</Button>
              {user?.avatarUrl && <Button icon={Trash2} onClick={() => setRemoveOpen(true)}>Remove</Button>}
            </div>
            <p className="muted small">JPG or PNG. We'll resize it automatically.</p>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onPick(e.target.files[0])} />
          </div>
        </div>
      </section>
      <form onSubmit={submit} noValidate className="card settings-section form">
        <h2 className="card-title"><User size={17} /> Details</h2>
        <div className="grid-2">
          <TextField label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
          <TextField label="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} error={errors.username} />
          <TextField label="Email" value={user?.email || ''} disabled hint="Contact support to change your email" />
          <TextField label="Role" value={user?.role || ''} disabled />
        </div>
        <Button type="submit" variant="primary" icon={Save} loading={saving} disabled={!dirty}>Save changes</Button>
      </form>
      <ConfirmDialog open={removeOpen} title="Remove profile picture" message="Remove your current profile picture?" confirmLabel="Remove" danger onConfirm={remove} onCancel={() => setRemoveOpen(false)} />
    </div>
  );
}
