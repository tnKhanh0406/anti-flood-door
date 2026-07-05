import { supabase } from './supabase.js';
import { uploadImage } from './cloudinary.js';

const formRoot = document.querySelector('[data-edit-post-form]');

if (formRoot) {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  const form = document.getElementById('editPostForm');
  const statusText = document.getElementById('formStatus');
  const submitButton = document.getElementById('submitPostButton');
  const thumbnailInput = document.getElementById('thumbnail');
  const titleInput = document.getElementById('title');
  const slugInput = document.getElementById('slug');
  const summaryInput = document.getElementById('summary');
  const contentInput = document.getElementById('content_html');
  const statusInput = document.getElementById('status');
  const currentThumbnailWrap = document.getElementById('currentThumbnailWrap');
  const currentThumbnailPreview = document.getElementById('currentThumbnailPreview');
  const viewPublicPostLink = document.getElementById('viewPublicPostLink');
  let contentEditor = null;
  let currentPost = null;

  const slugify = (value) =>
    value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const setStatus = (message, kind = 'info', hidden = false) => {
    if (!statusText) {
      return;
    }

    statusText.className = `alert alert-${kind} mb-4`;
    statusText.textContent = message;
    statusText.hidden = hidden;
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
  };

  const loadPost = async () => {
    if (!postId) {
      setStatus('Thiếu id bài viết.', 'danger');
      return;
    }

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, summary, content_html, thumbnail_url, status')
      .eq('id', postId)
      .maybeSingle();

    if (error || !data) {
      setStatus(error?.message || 'Không tìm thấy bài viết.', 'danger');
      return;
    }

    currentPost = data;
    titleInput.value = data.title || '';
    slugInput.value = data.slug || '';
    summaryInput.value = data.summary || '';
    statusInput.value = data.status || 'published';
    contentInput.value = data.content_html || '';
    contentEditor?.setContent(data.content_html || '');

    if (data.thumbnail_url && currentThumbnailWrap && currentThumbnailPreview) {
      currentThumbnailPreview.src = data.thumbnail_url;
      currentThumbnailWrap.hidden = false;
    }

    if (viewPublicPostLink) {
      viewPublicPostLink.href = `../post-detail.html?slug=${encodeURIComponent(data.slug)}`;
      viewPublicPostLink.hidden = data.status !== 'published';
    }

    if (form) {
      form.hidden = false;
    }

    setStatus('', 'info', true);
  };

  if (slugInput) {
    slugInput.addEventListener('input', () => {
      slugInput.value = slugify(slugInput.value);
    });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const user = await ensureAdmin();
      if (!user || !currentPost) {
        return;
      }

      const title = titleInput.value.trim();
      const slug = slugify(slugInput.value.trim() || title);
      const summary = summaryInput.value.trim();
      const content = (contentEditor?.getContent() || contentInput.value || '').trim();
      const status = statusInput.value;
      const file = thumbnailInput?.files?.[0] || null;

      if (!title || !slug) {
        setStatus('Vui lòng nhập tiêu đề và slug.', 'warning');
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
      }

      try {
        setStatus(file ? 'Đang upload thumbnail và cập nhật bài viết...' : 'Đang cập nhật bài viết...', 'info');

        const thumbnailUrl = file ? await uploadImage(file) : currentPost.thumbnail_url;
        const { error } = await supabase
          .from('posts')
          .update({
            title,
            slug,
            summary,
            content_html: content,
            thumbnail_url: thumbnailUrl,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentPost.id);

        if (error) {
          throw error;
        }

        alert('Cập nhật bài viết thành công');
        location.href = 'dashboard.html';
      } catch (error) {
        setStatus(error.message || 'Không thể cập nhật bài viết.', 'danger');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }

  const user = await ensureAdmin();
  if (user) {
    try {
      await initEditor();
      await loadPost();
    } catch (error) {
      setStatus(error.message || 'Không thể tải form sửa bài viết.', 'danger');
    }
  }
}
