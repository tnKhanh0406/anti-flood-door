import { supabase } from './supabase.js';

const form = document.getElementById('loginForm');
const statusText = document.getElementById('loginStatus');
const loginButton = document.getElementById('loginButton');

const setStatus = (message, kind = 'info') => {
  if (!statusText) {
    return;
  }

  statusText.className = `alert alert-${kind} mb-4`;
  statusText.textContent = message;
  statusText.hidden = false;
};

const getAdminProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể kiểm tra quyền admin: ${error.message}`);
  }

  return data;
};

const redirectIfAdmin = async () => {
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return;
  }

  const profile = await getAdminProfile(data.user.id);
  if (profile?.role === 'admin' && profile?.is_active !== false) {
    location.href = 'dashboard.html';
  }
};

if (form) {
  redirectIfAdmin().catch(() => {
    supabase.auth.signOut();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      setStatus('Vui lòng nhập email và mật khẩu.', 'warning');
      return;
    }

    if (loginButton) {
      loginButton.disabled = true;
    }

    try {
      setStatus('Đang đăng nhập...', 'info');

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      const profile = await getAdminProfile(data.user.id);

      if (!profile || profile.role !== 'admin' || profile.is_active === false) {
        await supabase.auth.signOut();
        setStatus('Tài khoản này chưa có quyền admin hoặc đã bị khóa.', 'danger');
        return;
      }

      location.href = 'dashboard.html';
    } catch (error) {
      setStatus(error.message || 'Không thể đăng nhập.', 'danger');
    } finally {
      if (loginButton) {
        loginButton.disabled = false;
      }
    }
  });
}
