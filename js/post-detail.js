import { supabase } from './supabase.js';

const postStatus = document.getElementById('postStatus');
const postDetail = document.getElementById('postDetail');
const postThumbnail = document.getElementById('postThumbnail');
const postMeta = document.getElementById('postMeta');
const postTitle = document.getElementById('postTitle');
const postSummary = document.getElementById('postSummary');
const postContent = document.getElementById('postContent');

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

if (!slug) {
  if (postStatus) {
    postStatus.className = 'alert alert-warning';
    postStatus.textContent = 'Thiếu slug bài viết.';
  }
} else {
  const { data, error } = await supabase
    .from('posts')
    .select('title, slug, summary, content_html, thumbnail_url, created_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    if (postStatus) {
      postStatus.className = 'alert alert-danger';
      postStatus.textContent = error?.message || 'Không tìm thấy bài viết.';
    }
  } else {
    if (postStatus) {
      postStatus.hidden = true;
    }

    if (postDetail) {
      postDetail.hidden = false;
    }

    if (postThumbnail) {
      if (data.thumbnail_url) {
        postThumbnail.src = data.thumbnail_url;
        postThumbnail.alt = data.title;
      } else {
        postThumbnail.remove();
      }
    }

    if (postMeta) {
      postMeta.textContent = new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'long',
      }).format(new Date(data.created_at));
    }

    if (postTitle) {
      postTitle.textContent = data.title;
    }

    if (postSummary) {
      postSummary.textContent = data.summary || '';
      postSummary.hidden = !data.summary;
    }

    if (postContent) {
      postContent.innerHTML = data.content_html || '<p>Nội dung đang cập nhật.</p>';
    }
  }
}