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
  const searchForm = document.getElementById('postSearchForm');
  const searchInput = document.getElementById('postSearchInput');
  const clearSearchButton = document.getElementById('clearSearchButton');
  const paginationRoot = document.getElementById('dashboardPagination');

  const pageSize = 8;
  let currentPage = 1;
  let searchTerm = '';
  let searchDebounce = null;

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
      .select('full_name, role, is_active')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      setStatus('Không thể kiểm tra quyền admin. Hãy thêm policy SELECT cho bảng profiles.', 'warning');
      return data.user;
    }

    if (!profile || profile.role !== 'admin' || profile.is_active === false) {
      await supabase.auth.signOut();
      location.href = 'login.html';
      return null;
    }

    if (authStatus) {
      authStatus.hidden = true;
    }

    return data.user;
  };

  const getCount = async (builder) => {
    const { count, error } = await builder.select('id', {
      count: 'exact',
      head: true,
    });

    if (error) {
      throw error;
    }

    return count || 0;
  };

  const loadStats = async () => {
    try {
      const [totalCount, publishedCount, draftCount, latestResult] = await Promise.all([
        getCount(supabase.from('posts')),
        getCount(supabase.from('posts').eq('status', 'published')),
        getCount(supabase.from('posts').neq('status', 'published')),
        supabase
          .from('posts')
          .select('updated_at, created_at')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (latestResult.error) {
        throw latestResult.error;
      }

      if (postCountEl) {
        postCountEl.textContent = totalCount.toString();
      }

      if (publishedCountEl) {
        publishedCountEl.textContent = publishedCount.toString();
      }

      if (draftCountEl) {
        draftCountEl.textContent = draftCount.toString();
      }

      if (lastUpdatedEl) {
        const latestPost = latestResult.data;
        lastUpdatedEl.textContent = latestPost ? formatDate(latestPost.updated_at || latestPost.created_at) : '-';
      }
    } catch (error) {
      console.warn('Không thể tải thống kê dashboard:', error);
    }
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
                <a class="btn btn-outline-primary" href="edit-post.html?id=${encodeURIComponent(post.id)}">Sửa</a>
                <button class="btn btn-outline-danger" type="button" data-delete-post="${escapeHtml(post.id)}">Xoá</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    if (emptyState) {
      emptyState.textContent = searchTerm ? 'Không tìm thấy bài viết phù hợp.' : 'Chưa có bài viết nào.';
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
        await loadStats();
      });
    });
  };

  const getPaginationPages = (totalPages) => {
    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

    return [...pages]
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  };

  const renderPagination = (totalCount) => {
    if (!paginationRoot) {
      return;
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    if (totalCount <= pageSize) {
      paginationRoot.innerHTML = totalCount
        ? `<p class="text-muted small mb-0">Hiển thị ${totalCount} bài viết${searchTerm ? ' phù hợp' : ''}.</p>`
        : '';
      return;
    }

    const pages = getPaginationPages(totalPages);
    let previousPage = 0;
    const pageItems = pages
      .map((page) => {
        const gap = previousPage && page - previousPage > 1
          ? '<li class="page-item disabled"><span class="page-link">...</span></li>'
          : '';
        previousPage = page;

        return `
          ${gap}
          <li class="page-item ${page === currentPage ? 'active' : ''}">
            <button class="page-link" type="button" data-page="${page}" ${page === currentPage ? 'aria-current="page"' : ''}>${page}</button>
          </li>
        `;
      })
      .join('');

    paginationRoot.innerHTML = `
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <p class="text-muted small mb-0">Tổng ${totalCount} bài viết${searchTerm ? ' phù hợp' : ''}, trang ${currentPage}/${totalPages}</p>
        <ul class="pagination mb-0">
          <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" type="button" data-page="${Math.max(1, currentPage - 1)}">Trước</button>
          </li>
          ${pageItems}
          <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" type="button" data-page="${Math.min(totalPages, currentPage + 1)}">Sau</button>
          </li>
        </ul>
      </div>
    `;

    paginationRoot.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', async () => {
        const page = Number.parseInt(button.getAttribute('data-page') || '1', 10);
        if (page === currentPage) {
          return;
        }

        currentPage = page;
        await loadPosts();
      });
    });
  };

  const buildListQuery = () => {
    let query = supabase
      .from('posts')
      .select('id, title, slug, status, thumbnail_url, created_at, updated_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }

    return query;
  };

  async function loadPosts() {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await buildListQuery().range(from, to);

    if (error) {
      setStatus(error.message, 'danger');
      return;
    }

    const totalCount = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    if (currentPage > totalPages && totalCount > 0) {
      currentPage = totalPages;
      await loadPosts();
      return;
    }

    renderPosts(data || []);
    renderPagination(totalCount);
  }

  const runSearch = async () => {
    searchTerm = searchInput?.value.trim() || '';
    currentPage = 1;
    await loadPosts();
  };

  if (refreshButton) {
    refreshButton.addEventListener('click', async () => {
      await loadPosts();
      await loadStats();
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await runSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      window.clearTimeout(searchDebounce);
      searchDebounce = window.setTimeout(runSearch, 350);
    });
  }

  if (clearSearchButton) {
    clearSearchButton.addEventListener('click', async () => {
      if (searchInput) {
        searchInput.value = '';
      }

      searchTerm = '';
      currentPage = 1;
      await loadPosts();
    });
  }

  if (signOutButton) {
    signOutButton.addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.href = 'login.html';
    });
  }

  const user = await requireAdmin();
  if (user) {
    await loadPosts();
    await loadStats();
  }
}
