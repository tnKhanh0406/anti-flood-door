import { supabase } from './supabase.js';
import { uploadImage } from './cloudinary.js';

const formRoot = document.querySelector('[data-create-post-form]');

if (formRoot) {
  const form = document.getElementById('createPostForm');
  const statusText = document.getElementById('formStatus');
  const submitButton = document.getElementById('submitPostButton');
  const thumbnailInput = document.getElementById('thumbnail');
  const slugInput = document.getElementById('slug');
  const titleInput = document.getElementById('title');

  const slugify = (value) =>
    value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const setStatus = (message, kind = 'info') => {
    if (!statusText) {
      return;
    }

    statusText.className = `alert alert-${kind} mb-4`;
    statusText.textContent = message;
    statusText.hidden = false;
  };

  const ensureAdmin = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      location.href = 'login.html';
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      location.href = 'login.html';
      return null;
    }

    return data.user;
  };

  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      if (!slugInput.value.trim()) {
        slugInput.value = slugify(titleInput.value);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const user = await ensureAdmin();
      if (!user) {
        return;
      }

      const title = document.getElementById('title').value.trim();
      const slug = document.getElementById('slug').value.trim() || slugify(title);
      const summary = document.getElementById('summary').value.trim();
      const content = document.getElementById('content_html').value.trim();
      const status = document.getElementById('status').value;
      const file = thumbnailInput?.files?.[0] || null;

      if (!title || !slug) {
        setStatus('Vui lòng nhập tiêu đề và slug.', 'warning');
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
      }

      try {
        setStatus('Đang tải ảnh và lưu bài viết...', 'info');

        const imageUrl = await uploadImage(file);

        const { error } = await supabase.from('posts').insert({
          title,
          slug,
          summary,
          content_html: content,
          thumbnail_url: imageUrl,
          status,
        });

        if (error) {
          throw error;
        }

        alert('Đăng bài thành công');
        location.href = 'dashboard.html';
      } catch (error) {
        setStatus(error.message || 'Không thể đăng bài.', 'danger');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }

  await ensureAdmin();
}