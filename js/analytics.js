document.addEventListener('click', function (event) {
  const link = event.target.closest('a[href]');

  if (!link || typeof gtag !== 'function') return;

  const href = link.getAttribute('href') || '';

  // Gọi điện
  if (href.startsWith('tel:')) {
    gtag('event', 'phone_click', {
      phone_number: href.replace('tel:', ''),
      page_path: window.location.pathname
    });
    return;
  }

  // Zalo
  if (href.includes('zalo.me')) {
    gtag('event', 'zalo_click', {
      link_url: link.href,
      page_path: window.location.pathname
    });
    return;
  }

  // Email
  if (href.startsWith('mailto:')) {
    gtag('event', 'email_click', {
      page_path: window.location.pathname
    });
  }
});