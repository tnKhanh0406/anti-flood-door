(() => {
  const headerMount = document.querySelector('[data-layout="header"]');
  const footerMount = document.querySelector('[data-layout="footer"]');

  const currentPage = document.body?.dataset.page || 'home';
  const isHomePage = currentPage === 'home';
  const isContactPage = currentPage === 'contact';
  const isPostsPage = currentPage === 'posts' || currentPage === 'post-detail';

  const logoHref = isHomePage ? '#home' : 'index.html';
  const homeHref = isHomePage ? '#home' : 'index.html#home';
  const productsHref = isHomePage ? '#products' : 'index.html#products';
  const projectsHref = isHomePage ? '#projects' : 'index.html#projects';
  const postsHref = 'posts.html';
  const contactHref = isContactPage ? '#contact-info' : 'contact.html#contact-info';
  const footerContactHref = isContactPage ? '#contact-info' : 'contact.html#contact-info';
  const currentYear = new Date().getFullYear();

  if (headerMount) {
    headerMount.innerHTML = `
      <nav class="site-header navbar navbar-expand-lg bg-white py-2 py-lg-3 shadow-sm">
        <div class="container">
          <a class="navbar-brand p-0" href="${logoHref}" aria-label="NGUYỄN PHÚ trang chủ">
            <img src="assets/images/logo.png" alt="NGUYỄN PHÚ" class="brand__logo">
          </a>

          <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Mở menu">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav mx-auto mb-3 mb-lg-0 gap-lg-4 align-items-lg-center fw-semibold">
              <li class="nav-item"><a class="nav-link text-dark ${currentPage === 'home' ? 'active' : ''}" href="${homeHref}">Trang chủ</a></li>
              <li class="nav-item"><a class="nav-link text-dark" href="${productsHref}">Sản phẩm</a></li>
              <li class="nav-item"><a class="nav-link text-dark ${isPostsPage ? 'active' : ''}" href="${postsHref}">Công trình</a></li>
              <li class="nav-item"><a class="nav-link text-dark ${currentPage === 'contact' ? 'active' : ''}" href="${contactHref}">Liên hệ</a></li>
            </ul>

            <a class="header-hotline ms-lg-3" href="tel:0948723379" aria-label="Gọi hotline tư vấn 24/7 0948 723 379">
              <span class="header-hotline__icon"><i class="bi bi-telephone-fill"></i></span>
              <span class="header-hotline__content">
                <span class="header-hotline__label">Hotline tư vấn 24/7</span>
                <span class="header-hotline__number">0948 723 379</span>
              </span>
            </a>
          </div>
        </div>
      </nav>
      <div class="site-header-spacer" aria-hidden="true"></div>
    `;

    const siteHeader = headerMount.querySelector('.site-header');
    const siteHeaderSpacer = headerMount.querySelector('.site-header-spacer');
    const syncHeaderHeight = () => {
      const headerHeight = siteHeader?.offsetHeight || 0;
      if (siteHeaderSpacer) {
        siteHeaderSpacer.style.height = `${headerHeight}px`;
      }
      document.documentElement.style.setProperty('--site-header-height', `${headerHeight}px`);
    };

    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);
    siteHeader?.addEventListener('shown.bs.collapse', syncHeaderHeight);
    siteHeader?.addEventListener('hidden.bs.collapse', syncHeaderHeight);

    if ('ResizeObserver' in window && siteHeader) {
      new ResizeObserver(syncHeaderHeight).observe(siteHeader);
    }
  }

  if (!document.querySelector('.floating-socials')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="floating-socials" aria-label="Kết nối nhanh">
        <a class="floating-socials__item floating-socials__item--zalo" href="https://zalo.me/0948723379" aria-label="Zalo">Zalo</a>
        <a class="floating-socials__item" href="https://www.facebook.com/profile.php?id=61582512945913" aria-label="Facebook">
          <i class="bi bi-facebook"></i>
        </a>
        <a class="floating-socials__item" href="https://www.tiktok.com/@chongngapnguyenphu1" aria-label="TikTok">
          <i class="bi bi-tiktok"></i>
        </a>
      </div>
    `);
  }

  if (footerMount) {
    footerMount.innerHTML = `
      <footer class="pre-footer-section__main py-4">
        <div class="container">
          <div class="row g-4">
            <div class="col-12 col-lg-4">
              <div class="pre-footer-brand">
                <img src="assets/images/logo.png" alt="Chống Ngập Nguyên Phú" class="pre-footer-brand__logo">
                <div>
                  <h4 class="pre-footer-brand__name mb-2">CHỐNG NGẬP<br>NGUYÊN PHÚ</h4>
                  <p class="pre-footer-brand__text mb-0">Giải pháp cửa chống ngập chủ động hiệu quả, bền bỉ, dễ lắp đặt.</p>
                </div>
              </div>
            </div>

            <div class="col-6 col-lg-2">
              <h4 class="pre-footer-section__title">Về chúng tôi</h4>
              <ul class="pre-footer-section__list list-unstyled mb-0">
                <li><a href="${homeHref}">Giới thiệu</a></li>
                <li><a href="${productsHref}">Sản phẩm</a></li>
                <li><a href="${postsHref}">Tin tức</a></li>
              </ul>
            </div>

            <div class="col-6 col-lg-2">
              <h4 class="pre-footer-section__title">Hỗ trợ</h4>
              <ul class="pre-footer-section__list list-unstyled mb-0">
                <li><a href="${homeHref}">Hướng dẫn lắp đặt</a></li>
                <li><a href="${footerContactHref}">Chính sách bảo hành</a></li>
                <li><a href="${footerContactHref}">Chính sách vận chuyển</a></li>
                <li><a href="${footerContactHref}">Chính sách đổi trả</a></li>
              </ul>
            </div>

            <div class="col-12 col-lg-2">
              <h4 class="pre-footer-section__title">Liên hệ</h4>
              <ul class="pre-footer-section__list list-unstyled mb-0">
                <li><a href="tel:0948723379">Hotline: 0948 723 379</a></li>
                <li><a href="mailto:chongngapnguyenphu@gmail.com">Email: chongngapnguyenphu@gmail.com</a></li>
                <li><a href="${footerContactHref}">Địa chỉ: 123 Đường ABC, P. An Phú, TP. Thủ Đức, TP.HCM</a></li>
              </ul>
            </div>

            <div class="col-12 col-lg-2">
              <h4 class="pre-footer-section__title">Kết nối với chúng tôi</h4>
              <div class="pre-footer-section__socials">
                <a href="https://www.facebook.com/profile.php?id=61582512945913" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                <a href="https://zalo.me/0948723379" aria-label="Zalo">Zalo</a>
                <a href="https://www.youtube.com/" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
                <a href="https://www.tiktok.com/@chongngapnguyenphu1" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
              </div>
            </div>
          </div>

          <p class="pre-footer-section__copyright mb-0 mt-4 text-center">© ${currentYear} Chống Ngập Nguyên Phú. All rights reserved.</p>
        </div>
      </footer>
    `;
  }
})();
