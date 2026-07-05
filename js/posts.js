import { supabase } from './supabase.js';

const postsGrid = document.getElementById('postsGrid');
const postsStatus = document.getElementById('postsStatus');
const postsPagination = document.getElementById('postsPagination');
const postLimit = Number.parseInt(postsGrid?.dataset.postsLimit || '', 10);
const emptyMessage = postsGrid?.dataset.emptyMessage || 'Chưa có bài viết nào.';
const pageSize = Number.parseInt(postsGrid?.dataset.pageSize || '6', 10);
const hasPagination = Boolean(postsPagination);

const escapeHtml = (value = '') =>
  value
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatDate = (value) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
  }).format(new Date(value));

const getCurrentPage = () => {
  const params = new URLSearchParams(window.location.search);
  const page = Number.parseInt(params.get('page') || '1', 10);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

const getPageHref = (page) => {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page.toString());

  return `${url.pathname}${url.search}`;
};

const renderPosts = (posts) => {
  if (!postsGrid) {
    return;
  }

  postsGrid.innerHTML = posts.length
    ? posts
        .map(
          (post) => `
            <div class="col-12 col-md-6 col-lg-4">
              <article class="post-card card h-100 shadow-sm overflow-hidden">
                ${
                  post.thumbnail_url
                    ? `<a href="post-detail.html?slug=${encodeURIComponent(post.slug)}"><img src="${escapeHtml(post.thumbnail_url)}" class="card-img-top post-card__image" alt="${escapeHtml(post.title)}"></a>`
                    : `<a class="post-card__placeholder text-decoration-none" href="post-detail.html?slug=${encodeURIComponent(post.slug)}"><i class="bi bi-newspaper"></i></a>`
                }
                <div class="card-body">
                  <p class="text-secondary small text-uppercase mb-2">${formatDate(post.created_at)}</p>
                  <h2 class="h5 card-title"><a class="post-card__title-link text-decoration-none" href="post-detail.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
                  <p class="card-text text-muted">${escapeHtml(post.summary || '')}</p>
                </div>
                <div class="card-footer bg-white border-0 pt-0 pb-3 px-3">
                  <a class="btn btn-outline-primary btn-sm" href="post-detail.html?slug=${encodeURIComponent(post.slug)}">Xem chi tiết</a>
                </div>
              </article>
            </div>
          `,
        )
        .join('')
    : `<div class="col-12"><div class="alert alert-secondary">${escapeHtml(emptyMessage)}</div></div>`;
};

const getPaginationPages = (currentPage, totalPages) => {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
};

const renderPagination = (currentPage, totalPages, totalCount) => {
  if (!postsPagination) {
    return;
  }

  if (totalPages <= 1) {
    postsPagination.innerHTML = '';
    return;
  }

  const pages = getPaginationPages(currentPage, totalPages);
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
          <a class="page-link" href="${getPageHref(page)}" ${page === currentPage ? 'aria-current="page"' : ''}>${page}</a>
        </li>
      `;
    })
    .join('');

  postsPagination.innerHTML = `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      <p class="text-muted small mb-0">Tổng ${totalCount} bài viết, trang ${currentPage}/${totalPages}</p>
      <ul class="pagination mb-0">
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <a class="page-link" href="${getPageHref(Math.max(1, currentPage - 1))}" aria-label="Trang trước">Trước</a>
        </li>
        ${pageItems}
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <a class="page-link" href="${getPageHref(Math.min(totalPages, currentPage + 1))}" aria-label="Trang sau">Sau</a>
        </li>
      </ul>
    </div>
  `;
};

if (postsGrid) {
  const currentPage = hasPagination ? getCurrentPage() : 1;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('posts')
    .select('id, title, slug, summary, thumbnail_url, created_at', {
      count: hasPagination ? 'exact' : undefined,
    })
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (hasPagination) {
    query = query.range(from, to);
  } else if (Number.isInteger(postLimit) && postLimit > 0) {
    query = query.limit(postLimit);
  }

  const { data, error, count } = await query;

  if (error) {
    if (postsStatus) {
      postsStatus.className = 'alert alert-danger';
      postsStatus.textContent = error.message;
    }
  } else {
    const posts = data || [];

    if (postsStatus) {
      postsStatus.hidden = true;
    }

    renderPosts(posts);

    if (hasPagination) {
      const totalCount = count || 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

      if (currentPage > totalPages && totalCount > 0) {
        window.location.href = getPageHref(totalPages);
      } else {
        renderPagination(currentPage, totalPages, totalCount);
      }
    }
  }
}
