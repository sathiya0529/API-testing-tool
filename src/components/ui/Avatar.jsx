import { initials } from '../../utils/format';

export default function Avatar({ user, size = 'md' }) {
  return (
    <span className={`avatar avatar-${size}`} aria-hidden="true">
      {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user?.name)}
    </span>
  );
}
