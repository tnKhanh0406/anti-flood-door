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
  const contentInput = document.getElementById('content_html');
  let contentEditor = null;

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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      setStatus(`Không thể kiểm tra quyền admin: ${profileError.message}`, 'danger');
      return null;
    }

    if (!profile || profile.role !== 'admin' || profile.is_active === false) {
      await supabase.auth.signOut();
      location.href = 'login.html';
      return null;
    }

    return data.user;
  };

  const initEditor = async () => {
    if (!contentInput || !window.tinymce) {
      return;
    }

    try {
      const editors = await window.tinymce.init({
        selector: '#content_html',
        license_key: 'gpl',
        height: 420,
        menubar: false,
        promotion: false,
        branding: false,
        convert_urls: false,
        object_resizing: 'img',
        plugins: 'autolink lists link image media table code autoresize',
        toolbar:
          'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist blockquote | link image media table | removeformat code',
        images_file_types: 'jpg,jpeg,png,gif,webp',
        image_title: true,
        image_dimensions: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        images_upload_handler: async (blobInfo, progress) => {
          progress(10);
          const imageUrl = await uploadImage(blobInfo.blob());
          progress(100);
          return imageUrl;
        },
        file_picker_callback: (callback, value, meta) => {
          if (meta.filetype !== 'image') {
            return;
          }

          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';

          input.addEventListener('change', async () => {
            const file = input.files?.[0];

            if (!file) {
              return;
            }

            try {
              const imageUrl = await uploadImage(file);
              callback(imageUrl, { alt: file.name });
            } catch (error) {
              setStatus(error.message || 'Upload ảnh thất bại.', 'danger');
            }
          });

          input.click();
        },
        content_style: `
          body { font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7; }
          img { max-width: 100%; height: auto; }
        `,
      });

      contentEditor = editors[0] || null;
    } catch (error) {
      setStatus(`Không thể tải TinyMCE: ${error.message}`, 'warning');
    }
  };

  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      if (!slugInput.dataset.touched) {
        slugInput.value = slugify(titleInput.value);
      }
    });

    slugInput.addEventListener('input', () => {
      slugInput.dataset.touched = 'true';
      slugInput.value = slugify(slugInput.value);
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
      const slug = slugify(document.getElementById('slug').value.trim() || title);
      const summary = document.getElementById('summary').value.trim();
      const content = (contentEditor?.getContent() || contentInput?.value || '').trim();
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
        setStatus(file ? 'Đang tải ảnh và lưu bài viết...' : 'Đang lưu bài viết...', 'info');

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
  await initEditor();
}
