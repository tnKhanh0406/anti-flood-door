(() => {
  const headerMount = document.querySelector('[data-layout="header"]');
  const footerMount = document.querySelector('[data-layout="footer"]');

  if (!headerMount && !footerMount) {
    return;
  }

  const currentPage = document.body?.dataset.page || 'home';
  const isContactPage = currentPage === 'contact';
  const isPostsPage = currentPage === 'posts';

  const logoHref = isContactPage ? 'index.html' : '#home';
  const homeHref = isContactPage ? 'index.html#home' : '#home';
  const productsHref = isContactPage ? 'index.html#products' : '#products';
  const projectsHref = isContactPage ? 'index.html#projects' : '#projects';
  const postsHref = isContactPage ? 'posts.html' : 'posts.html';
  const contactHref = isContactPage ? '#contact-info' : 'contact.html#contact-info';
  const footerContactHref = isContactPage ? '#contact-info' : 'contact.html#contact-info';

  if (headerMount) {
    headerMount.innerHTML = `
      <div class="topbar py-2 py-md-3 text-white small">
        <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 text-center text-md-start">
          <p class="mb-0">Giải pháp bảo vệ ngôi nhà của bạn trước những trận mưa lớn</p>
          <a class="d-inline-flex align-items-center gap-2 fw-semibold text-white text-decoration-none" href="tel:0948723379">
            <span class="topbar__icon"><i class="bi bi-telephone-fill"></i></span>
            Tư vấn &amp; báo giá: 0948 723 379
          </a>
        </div>
      </div>

      <nav class="navbar navbar-expand-lg bg-white py-2 py-lg-3 shadow-sm sticky-top">
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
              <li class="nav-item"><a class="nav-link text-dark" href="${projectsHref}">Công trình</a></li>
              <li class="nav-item"><a class="nav-link text-dark ${isPostsPage ? 'active' : ''}" href="${postsHref}">Bài viết</a></li>
              <li class="nav-item"><a class="nav-link text-dark ${currentPage === 'contact' ? 'active' : ''}" href="${contactHref}">Liên hệ</a></li>
            </ul>

            <a class="btn btn-primary rounded-pill px-4 py-3 fw-semibold ms-lg-3" href="tel:0948723379">
              <i class="bi bi-telephone-fill me-2"></i>Gọi tư vấn ngay
            </a>
          </div>
        </div>
      </nav>
    `;
  }

  if (footerMount) {
    footerMount.innerHTML = `
      <footer class="site-footer py-5">
        <div class="container">
          <div class="row g-4">
            <div class="col-12 col-md-6 col-lg-3">
              <a class="site-footer__brand d-inline-flex align-items-center mb-3" href="${logoHref}" aria-label="NGUYỄN PHÚ trang chủ">
                <img src="assets/images/logo.png" alt="NGUYỄN PHÚ" class="site-footer__logo">
              </a>
              <p class="site-footer__text mb-4">
                Giải pháp cửa chống ngập panel nhôm ghép thanh cơ hiệu quả, bền bỉ, thẩm mĩ cao
              </p>
              <div class="site-footer__socials d-flex gap-2">
                <a class="site-footer__social" href="https://www.facebook.com/profile.php?id=61582512945913" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                <a class="site-footer__social" href="https://www.tiktok.com/@chongngapnguyenphu1" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
                <a class="site-footer__social site-footer__social--zalo" href="https://zalo.me/0948723379" aria-label="Zalo">Zalo</a>
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
              <h4 class="site-footer__title">Liên hệ</h4>
              <ul class="site-footer__list list-unstyled mb-0">
                <li><a href="tel:0948723379">Số điện thoại: 0948 723 379</a></li>
                <li><a href="mailto:chongngapnguyenphu@gmail.com">Email: chongngapnguyenphu@gmail.com</a></li>
                <li><a href="${footerContactHref}">Địa chỉ Hà nội: 123 Đường ABC, Quận XYZ, Hà Nội</a></li>
                <li><a href="${footerContactHref}">Địa chỉ TP HCM: 456 Đường DEF, Quận GHI, TP HCM</a></li>
              </ul>
            </div>

            <div class="col-12 col-md-6 col-lg-3">
              <h4 class="site-footer__title">Chính sách</h4>
              <ul class="site-footer__list list-unstyled mb-0">
                <li><a href="${footerContactHref}">Chính sách bảo hành</a></li>
                <li><a href="${footerContactHref}">Chính sách đổi trả</a></li>
                <li><a href="${footerContactHref}">Chính sách vận chuyển</a></li>
                <li><a href="${footerContactHref}">Chính sách thanh toán</a></li>
              </ul>
            </div>

            <div class="col-12 col-md-6 col-lg-2">
              <h4 class="site-footer__title">Kết nối với chúng tôi</h4>
              <div class="site-footer__social-grid d-flex gap-3 flex-wrap">
                <a class="site-footer__social site-footer__social--square" href="https://www.facebook.com/profile.php?id=61582512945913" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                <a class="site-footer__social site-footer__social--square" href="https://www.tiktok.com/@chongngapnguyenphu1" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
                <a class="site-footer__social site-footer__social--square site-footer__social--zalo" href="https://zalo.me/0948723379" aria-label="Zalo">Zalo</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
})();
