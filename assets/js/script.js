$(function () {
    // Lenis smooth scroll: desktop only (lg breakpoint), native scroll on tablet/phone.
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    let lenis = null;

    function setLenis(enabled) {
        if (enabled && !lenis) {
            document.documentElement.classList.remove('scroll-smooth');
            lenis = new Lenis();
            function raf(time) {
                if (!lenis) return;
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        } else if (!enabled && lenis) {
            lenis.destroy();
            lenis = null;
            document.documentElement.classList.add('scroll-smooth');
        }
    }

    setLenis(desktopQuery.matches);
    desktopQuery.addEventListener('change', (e) => setLenis(e.matches));

    // CTA parallax: background image drifts vertically (with a subtle zoom) at a
    // different rate than the page scroll, smoothed via lerp for a fluid feel.
    const ctaImgEl = document.querySelector('.cta-parallax img');
    const ctaSection = document.getElementById('cta');

    if (ctaImgEl && ctaSection) {
        const travel = 140;
        const maxScale = 1.12;
        let targetProgress = 0;
        let currentProgress = 0;

        function readCtaProgress() {
            const rect = ctaSection.getBoundingClientRect();
            const vh = window.innerHeight;
            targetProgress = 1 - Math.min(Math.max((rect.top + rect.height) / (vh + rect.height), 0), 1);
        }

        function tickCtaParallax() {
            currentProgress += (targetProgress - currentProgress) * 0.08;
            const offset = (currentProgress - 0.5) * travel;
            const scale = 1 + Math.abs(currentProgress - 0.5) * 2 * (maxScale - 1);
            ctaImgEl.style.transform = `translateY(${offset}px) scale(${scale})`;
            requestAnimationFrame(tickCtaParallax);
        }

        $(window).on('scroll resize', readCtaProgress);
        readCtaProgress();
        currentProgress = targetProgress;
        requestAnimationFrame(tickCtaParallax);
    }

    // Gallery slide sizing: default (untouched) state is a big -> medium -> small
    // staircase; once the user changes slides, it switches to active-slide-big /
    // rest-small, matching whichever slide is now centered.
    const gallerySizeClasses = {
        big: {
            w: '!w-[235px] sm:!w-[350px] md:!w-[400px] lg:!w-[430px] xl:!w-[470px] 2xl:!w-[510px]',
            h: 'h-[170px] sm:h-[255px] md:h-[285px] lg:h-[305px] xl:h-[330px] 2xl:h-[365px]',
        },
        medium: {
            w: '!w-[215px] sm:!w-[325px] md:!w-[365px] lg:!w-[390px] xl:!w-[430px] 2xl:!w-[460px]',
            h: 'h-[155px] sm:h-[235px] md:h-[260px] lg:h-[280px] xl:h-[305px] 2xl:h-[330px]',
        },
        small: {
            w: '!w-[195px] sm:!w-[290px] md:!w-[330px] lg:!w-[360px] xl:!w-[390px] 2xl:!w-[415px]',
            h: 'h-[140px] sm:h-[215px] md:h-[240px] lg:h-[260px] xl:h-[280px] 2xl:h-[300px]',
        },
    };
    const galleryAllWClasses = Object.values(gallerySizeClasses).map((t) => t.w).join(' ');
    const galleryAllHClasses = Object.values(gallerySizeClasses).map((t) => t.h).join(' ');

    function setGallerySlideSize($slide, tier) {
        $slide.removeClass(galleryAllWClasses).addClass(gallerySizeClasses[tier].w);
        $slide.find('.gallery-card').removeClass(galleryAllHClasses).addClass(gallerySizeClasses[tier].h);
    }

    new Swiper('.worlds-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: { rotate: 0, stretch: 0, depth: 150, modifier: 1.2, slideShadows: false },
        navigation: { prevEl: '#gallery-prev', nextEl: '#gallery-next' },
        on: {
            slideChange: function () {
                const lastIndex = this.slides.length - 1;
                $('.gallery-intro').css('opacity', this.activeIndex === 0 ? 1 : 0);
                $('.gallery-outro').css('opacity', this.activeIndex === lastIndex ? 1 : 0);

                $('.gallery-slide').each((i, el) => {
                    setGallerySlideSize($(el), i === this.activeIndex ? 'big' : 'small');
                });
            },
        },
    });

    new Swiper('.reasons-swiper', {
        slidesPerView: 1.2,
        spaceBetween: 16,
        grabCursor: true,
        pagination: { el: '.reasons-swiper .swiper-pagination', clickable: true },
        navigation: { prevEl: '#reasons-prev', nextEl: '#reasons-next' },
        breakpoints: {
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
        },
    });

    Fancybox.bind('[data-fancybox]', { theme: 'light' });

    $('.plan-type-btn').on('click', function () {
        const $btn = $(this);
        const $right = $('#plan-right-tower-' + $btn.data('tower'));
        $btn.siblings('.plan-type-btn').removeClass('active bg-gold text-ivory border-gold').addClass('border-gold/25 text-espresso');
        $btn.removeClass('border-gold/25 text-espresso').addClass('active bg-gold text-ivory border-gold');
        $right.find('.plan-display-img').attr('src', $btn.data('img'));
        $right.find('.plan-type-label').text($btn.data('label'));
        $btn.closest('.plan-left-panel').find('.plan-type-info').html(
            '<span class="text-espresso font-semibold">' + $btn.data('config') + '</span> &middot; ' + $btn.data('area')
        );
    });

    $('.plan-tab-btn').on('click', function () {
        const tab = $(this).data('plan-tab');
        $('.plan-tab-btn').removeClass('active bg-gold text-ivory').addClass('text-muted');
        $(this).addClass('active bg-gold text-ivory').removeClass('text-muted');
        $('.plan-left-panel, .plan-right-panel').addClass('hidden');
        $('#plan-left-' + tab + ', #plan-right-' + tab).removeClass('hidden');
    });

    function syncMapHeight() {
        const img = document.getElementById('loc-map-img');
        if (!img.naturalWidth) return;
        const w = $('#loc-map-wrap').width();
        $('#loc-panel-google').height(w * (img.naturalHeight / img.naturalWidth));
    }
    $('#loc-map-img').on('load', syncMapHeight);
    if (document.getElementById('loc-map-img').complete) syncMapHeight();
    $(window).on('resize', syncMapHeight);

    $('.loc-tab-btn').on('click', function () {
        const tab = $(this).data('loc-tab');
        $('.loc-tab-btn').removeClass('active bg-gold text-ivory').addClass('text-muted');
        $(this).addClass('active bg-gold text-ivory').removeClass('text-muted');
        $('.loc-panel').addClass('hidden');
        $('#loc-panel-' + tab).removeClass('hidden');
        if (tab === 'google') {
            const $iframe = $('#loc-panel-google');
            if (!$iframe.attr('src')) $iframe.attr('src', $iframe.data('src'));
            syncMapHeight();
        }
    });

    const $header = $('#site-header');
    const $logo = $('#logo-img');
    const $navPill = $('#nav-pill');

    function updateHeader() {
        if ($(window).scrollTop() > 40) {
            $header.removeClass('absolute bg-transparent text-white border-transparent')
                .addClass('fixed bg-white text-espresso border-gold/20 shadow-sm');
            $navPill.removeClass('bg-white/20 border-white/15 drop-shadow')
                .addClass('bg-transparent border-transparent');
            // $logo.attr('src', 'assets/images/logo/hori-logo-2.webp');
        } else {
            $header.removeClass('fixed bg-white text-espresso border-gold/20 shadow-sm')
                .addClass('absolute bg-transparent text-white border-transparent');
            $navPill.removeClass('bg-transparent border-transparent')
                .addClass('bg-white/20 border-white/15 drop-shadow');
            $logo.attr('src', 'assets/images/logo/main-logo.webp');
        }
    }

    updateHeader();
    $(window).on('scroll', updateHeader);

    const $stickyCta = $('#sticky-cta-mobile');
    function updateStickyCta() {
        const heroHeight = $('#home').outerHeight() || window.innerHeight;
        $stickyCta.toggleClass('visible', $(window).scrollTop() > heroHeight - 120);
    }
    updateStickyCta();
    $(window).on('scroll', updateStickyCta);

    const $mobileMenu = $('#mobile-menu');

    function openMobileMenu() {
        $mobileMenu.removeClass('hidden');
        $('body').addClass('overflow-hidden');
        $('#menu-toggle').attr('aria-expanded', true).find('i').removeClass('ri-menu-3-line').addClass('ri-close-line');
        requestAnimationFrame(() => requestAnimationFrame(() => $mobileMenu.addClass('menu-open')));
    }

    function closeMobileMenu() {
        $mobileMenu.removeClass('menu-open');
        $('body').removeClass('overflow-hidden');
        $('#menu-toggle').attr('aria-expanded', false).find('i').addClass('ri-menu-3-line').removeClass('ri-close-line');
        setTimeout(() => $mobileMenu.addClass('hidden'), 400);
    }

    $('#menu-toggle').on('click', function () {
        if ($mobileMenu.hasClass('menu-open')) closeMobileMenu();
        else openMobileMenu();
    });

    $('#mobile-menu-close').on('click', closeMobileMenu);
    $('#mobile-menu-backdrop').on('click', closeMobileMenu);
    $('#mobile-menu a.btn1').on('click', closeMobileMenu);

    function scrollToTarget($target) {
        if (!$target.length) return;
        const headerOffset = $('#site-header').outerHeight() || 0;
        const top = $target.offset().top - headerOffset;
        if (lenis) {
            lenis.scrollTo(top, { duration: 1.4 });
        } else {
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }

    $(document).on('click', 'a[href^="#"]:not(.btn1)', function (e) {
        const href = $(this).attr('href');
        if (!href || href.length < 2) return;
        const $target = $(href);
        if (!$target.length) return;
        e.preventDefault();
        const menuWasOpen = $mobileMenu.hasClass('menu-open');
        if (menuWasOpen) closeMobileMenu();
        setTimeout(() => scrollToTarget($target), menuWasOpen ? 400 : 0);
    });

    const videoId = 'JWTpPJhAzbI';
    const $videoModal = $('#video-modal');
    const $videoFrame = $('#video-modal-frame');

    function openVideoModal() {
        $videoFrame.html(
            '<iframe class="w-full h-full" src="https://www.youtube.com/embed/' + videoId +
            '?autoplay=1" title="Orizon video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        );
        $videoModal.removeClass('hidden').addClass('flex');
        $('body').addClass('overflow-hidden');
    }

    function closeVideoModal() {
        $videoModal.addClass('hidden').removeClass('flex');
        $videoFrame.empty();
        $('body').removeClass('overflow-hidden');
    }

    $('.faq-trigger').on('click', function () {
        const $trigger = $(this);
        const $item = $trigger.closest('.faq-item');
        const isOpen = $item.hasClass('active');

        $('.faq-item.active').not($item).removeClass('active').find('.faq-panel').slideUp(200);
        $('.faq-item.active').not($item).find('.faq-trigger').attr('aria-expanded', false);
        $('.faq-item.active').not($item).find('.faq-icon').removeClass('ri-subtract-line').addClass('ri-add-line');

        $item.toggleClass('active', !isOpen);
        $trigger.attr('aria-expanded', !isOpen);
        $item.find('.faq-icon').toggleClass('ri-add-line', isOpen).toggleClass('ri-subtract-line', !isOpen);
        $item.find('.faq-panel').stop(true, true).slideToggle(200);
    });

    $('#watch-video-btn').on('click', openVideoModal);
    $('#video-modal-close').on('click', closeVideoModal);
    $videoModal.on('click', function (e) {
        if (e.target === this) closeVideoModal();
    });

    const $enquiryModal = $('#enquiry-modal');

    function openEnquiryModal(heading) {
        $('#enquiry-heading').text(heading || 'Request A Callback');
        $enquiryModal.removeClass('hidden');
        $('body').addClass('overflow-hidden');
        requestAnimationFrame(() => requestAnimationFrame(() => $enquiryModal.addClass('enquiry-open')));
    }

    function closeEnquiryModal() {
        $enquiryModal.removeClass('enquiry-open');
        $('body').removeClass('overflow-hidden');
        setTimeout(() => $enquiryModal.addClass('hidden'), 400);
    }

    $(document).on('click', '.btn1', function (e) {
        if ($(this).closest('#enquiry-modal, #footer-cta-form').length) return;
        e.preventDefault();
        openEnquiryModal($(this).find('span').first().text().trim());
    });

    $('#enquiry-close').on('click', closeEnquiryModal);
    $('#enquiry-backdrop, #enquiry-overlay').on('click', function (e) {
        if (e.target === this) closeEnquiryModal();
    });

    $('#enquiry-form, #footer-cta-form').on('submit', function (e) {
        e.preventDefault();
        closeEnquiryModal();
        this.reset();
    });

    $(document).on('keydown', function (e) {
        if (e.key !== 'Escape') return;
        closeVideoModal();
        if ($enquiryModal.hasClass('enquiry-open')) closeEnquiryModal();
        if ($mobileMenu.hasClass('menu-open')) closeMobileMenu();
    });
});
