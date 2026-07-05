import { supabase } from './supabase.js';

const postsGrid = document.getElementById('postsGrid');
const postsStatus = document.getElementById('postsStatus');

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

if (postsGrid) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, summary, thumbnail_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

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

    postsGrid.innerHTML = posts.length
      ? posts
          .map(
            (post) => `
              <div class="col-12 col-md-6 col-lg-4">
                <article class="card h-100 shadow-sm overflow-hidden">
                  ${post.thumbnail_url ? `<img src="${escapeHtml(post.thumbnail_url)}" class="card-img-top" alt="${escapeHtml(post.title)}" style="aspect-ratio: 16 / 10; object-fit: cover;">` : ''}
                  <div class="card-body">
                    <p class="text-secondary small text-uppercase mb-2">${formatDate(post.created_at)}</p>
                    <h2 class="h5 card-title">${escapeHtml(post.title)}</h2>
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
      : '<div class="col-12"><div class="alert alert-secondary">Chưa có bài viết nào.</div></div>';
  }
}