import { supabase } from './supabase.js';

const dashboardRoot = document.querySelector('[data-dashboard-root]');

if (dashboardRoot) {
  const authStatus = document.getElementById('authStatus');
  const postCountEl = document.getElementById('postCount');
  const publishedCountEl = document.getElementById('publishedCount');
  const draftCountEl = document.getElementById('draftCount');
  const lastUpdatedEl = document.getElementById('lastUpdated');
  const postsTableBody = document.getElementById('postsTableBody');
  const emptyState = document.getElementById('postsEmptyState');
  const refreshButton = document.getElementById('refreshPosts');
  const signOutButton = document.getElementById('signOutButton');

  const escapeHtml = (value = '') =>
    value
      .toString()
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const setStatus = (message, kind = 'info') => {
    if (!authStatus) {
      return;
    }

    authStatus.className = `alert alert-${kind} mb-4`;
    authStatus.textContent = message;
    authStatus.hidden = false;
  };

  const requireAdmin = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      location.href = 'login.html';
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      setStatus('Không thể kiểm tra quyền admin. Hãy thêm policy SELECT cho bảng profiles.', 'warning');
      return data.user;
    }

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      location.href = 'login.html';
      return null;
    }

    if (authStatus) {
      authStatus.hidden = true;
    }

    return data.user;
  };

  const renderPosts = (posts) => {
    if (!postsTableBody) {
      return;
    }

    postsTableBody.innerHTML = posts
      .map((post) => {
        const thumbnail = post.thumbnail_url
          ? `<img src="${escapeHtml(post.thumbnail_url)}" alt="${escapeHtml(post.title)}" class="rounded" style="width:72px;height:48px;object-fit:cover;">`
          : '<span class="text-muted">No image</span>';

        return `
          <tr>
            <td>${thumbnail}</td>
            <td>
              <div class="fw-semibold">${escapeHtml(post.title)}</div>
              <div class="text-muted small">/${escapeHtml(post.slug)}</div>
            </td>
            <td><span class="badge text-bg-${post.status === 'published' ? 'success' : 'secondary'}">${escapeHtml(post.status || 'published')}</span></td>
            <td>${formatDate(post.created_at)}</td>
            <td>${formatDate(post.updated_at)}</td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <a class="btn btn-outline-primary" href="create-post.html?edit=${encodeURIComponent(post.id)}">Sửa</a>
                <button class="btn btn-outline-danger" type="button" data-delete-post="${escapeHtml(post.id)}">Xoá</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    if (emptyState) {
      emptyState.hidden = posts.length > 0;
    }

    postsTableBody.querySelectorAll('[data-delete-post]').forEach((button) => {
      button.addEventListener('click', async () => {
        const postId = button.getAttribute('data-delete-post');
        if (!postId || !confirm('Xoá bài viết này?')) {
          return;
        }

        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) {
          alert(error.message);
          return;
        }

        await loadPosts();
      });
    });
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, status, thumbnail_url, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      setStatus(error.message, 'danger');
      return;
    }

    const posts = data || [];
    const publishedPosts = posts.filter((post) => post.status === 'published');
    const draftPosts = posts.filter((post) => post.status !== 'published');

    if (postCountEl) {
      postCountEl.textContent = posts.length.toString();
    }

    if (publishedCountEl) {
      publishedCountEl.textContent = publishedPosts.length.toString();
    }

    if (draftCountEl) {
      draftCountEl.textContent = draftPosts.length.toString();
    }

    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = posts.length ? formatDate(posts[0].updated_at || posts[0].created_at) : '-';
    }

    renderPosts(posts);
  };

  if (refreshButton) {
    refreshButton.addEventListener('click', loadPosts);
  }

  if (signOutButton) {
    signOutButton.addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.href = 'login.html';
    });
  }

  await requireAdmin();
  await loadPosts();
}