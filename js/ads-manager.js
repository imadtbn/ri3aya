(function () {
    'use strict';

    const ADSENSE_CLIENT = 'ca-pub-5656416032906373';
    const AD_CONFIG = {
        'display-01': {
            slot: '3143411927',
            format: 'auto',
            responsive: true,
            label: 'إعلان'
        },
        'display-02': {
            slot: '1760836049',
            format: 'auto',
            responsive: true,
            label: 'إعلان'
        },
        'display-03': {
            slot: '5508509362',
            format: 'auto',
            responsive: true,
            label: 'إعلان'
        },
        'in-feed-01': {
            slot: '7867079394',
            format: 'fluid',
            layoutKey: '-fr+56+4k-d4+74',
            label: 'إعلان داخل الخلاصة'
        },
        'in-feed-02': {
            slot: '8546947691',
            format: 'fluid',
            layoutKey: '-h9-h+8-jr+r8',
            label: 'إعلان داخل الخلاصة'
        },
        'in-feed-03': {
            slot: '6152718642',
            format: 'fluid',
            layoutKey: '-h6-l+d-jc+qd',
            label: 'إعلان داخل الخلاصة'
        },
        'article-01': {
            slot: '6118497380',
            format: 'fluid',
            layout: 'in-article',
            label: 'إعلان ضمن المقال'
        },
        'article-02': {
            slot: '7319898418',
            format: 'fluid',
            layout: 'in-article',
            label: 'إعلان ضمن المقال'
        },
        multiplex: {
            slot: '6528123169',
            format: 'autorelaxed',
            label: 'إعلانات مقترحة'
        }
    };

    const pagePath = window.location.pathname.toLowerCase();
    const isHome = /(?:\/|\/index\.html)$/.test(pagePath);
    const isBlog = pagePath.endsWith('/blog.html');
    const isTools = pagePath.endsWith('/tools.html');
    const isLegal = /\/(?:privacy|disclaimer|terms)\.html$/.test(pagePath);
    const adQueue = window.adsbygoogle = window.adsbygoogle || [];
    const scheduled = new WeakSet();
    let observer;

    const idle = window.requestIdleCallback || function (callback) {
        return window.setTimeout(callback, 180);
    };

    function makeAdShell(type, modifier) {
        const config = AD_CONFIG[type];
        if (!config) return null;

        const shell = document.createElement('aside');
        shell.className = ['ad-slot', `ad-slot--${type.replace(/[^a-z0-9]+/gi, '-')}`, modifier || ''].filter(Boolean).join(' ');
        shell.dataset.adType = type;
        shell.dataset.adState = 'reserved';
        shell.setAttribute('aria-label', config.label);
        shell.setAttribute('role', 'complementary');

        const label = document.createElement('span');
        label.className = 'ad-slot__label';
        label.textContent = config.label;
        label.setAttribute('aria-hidden', 'true');
        shell.appendChild(label);

        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.dataset.adClient = ADSENSE_CLIENT;
        ins.dataset.adSlot = config.slot;
        ins.dataset.adFormat = config.format;

        if (config.responsive) ins.dataset.fullWidthResponsive = 'true';
        if (config.layoutKey) ins.dataset.adLayoutKey = config.layoutKey;
        if (config.layout) ins.dataset.adLayout = config.layout;
        if (config.format === 'autorelaxed') ins.dataset.adFormat = 'autorelaxed';

        shell.appendChild(ins);
        return shell;
    }

    function insertAfter(target, type, modifier) {
        if (!target || !target.parentNode || target.parentNode.querySelector(`:scope > .ad-slot[data-ad-type="${type}"]`)) return null;
        const shell = makeAdShell(type, modifier);
        if (!shell) return null;
        target.insertAdjacentElement('afterend', shell);
        return shell;
    }

    function insertBefore(target, type, modifier) {
        if (!target || !target.parentNode || target.parentNode.querySelector(`:scope > .ad-slot[data-ad-type="${type}"]`)) return null;
        const shell = makeAdShell(type, modifier);
        if (!shell) return null;
        target.insertAdjacentElement('beforebegin', shell);
        return shell;
    }

    function queueAd(shell) {
        if (!shell || shell.dataset.adState === 'loaded' || scheduled.has(shell)) return;
        scheduled.add(shell);
        const ins = shell.querySelector('.adsbygoogle');
        if (!ins) return;

        try {
            adQueue.push({});
            shell.dataset.adState = 'loaded';
        } catch (error) {
            shell.dataset.adState = 'error';
            shell.classList.add('ad-slot--error');
            console.warn('[ads] تعذرت تهيئة الوحدة الإعلانية.', error);
        }
    }

    function watchShell(shell) {
        if (!shell) return;
        if (!observer) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    queueAd(entry.target);
                    observer.unobserve(entry.target);
                });
            }, { rootMargin: '500px 0px', threshold: 0.01 });
        }
        observer.observe(shell);
    }

    function addHomeAds() {
        const hero = document.querySelector('.hero-section');
        const tools = document.querySelector('.quick-tools');
        const sections = document.querySelector('.main-sections');
        const latestBlog = document.querySelector('.latest-blog');
        insertAfter(hero, 'display-01', 'ad-slot--home-top');
        insertAfter(tools, 'in-feed-01', 'ad-slot--home-feed');
        insertBefore(latestBlog, 'display-02', 'ad-slot--home-mid');
        if (sections && !latestBlog) insertAfter(sections, 'display-02', 'ad-slot--home-mid');
    }

    function addArticleAds() {
        const sections = Array.from(document.querySelectorAll('main .content-section, main article.content-section'));
        if (!sections.length) return;
        insertAfter(sections[Math.min(1, sections.length - 1)], 'article-01', 'ad-slot--article-inline');
        if (sections.length > 3) {
            insertAfter(sections[Math.min(4, sections.length - 1)], 'article-02', 'ad-slot--article-inline');
        }
        const pageContent = document.querySelector('.page-content');
        if (pageContent) insertAfter(pageContent, 'display-03', 'ad-slot--content-end');
    }

    function addBlogAds() {
        const cards = Array.from(document.querySelectorAll('.articles-grid > .article-card'));
        if (!cards.length) return;
        insertAfter(cards[0], 'in-feed-02', 'ad-slot--blog-feed');
        if (cards.length > 4) insertAfter(cards[3], 'display-03', 'ad-slot--blog-mid');
        const sidebar = document.querySelector('.blog-sidebar');
        if (sidebar) insertAfter(sidebar, 'multiplex', 'ad-slot--sidebar');
    }

    function addToolsAds() {
        const quick = document.querySelector('.quick-tools-section');
        const advanced = document.querySelector('.advanced-tools');
        const management = document.querySelector('.data-management-section');
        insertAfter(quick, 'display-01', 'ad-slot--tools-top');
        insertAfter(advanced, 'in-feed-03', 'ad-slot--tools-feed');
        if (management) insertAfter(management, 'display-02', 'ad-slot--tools-end');
    }

    function addGenericContentAd() {
        const pageHeader = document.querySelector('.page-header');
        const main = document.querySelector('main');
        if (pageHeader && main && !main.querySelector('.ad-slot')) {
            insertBefore(main, 'display-01', 'ad-slot--content-top');
        }
    }

    function mount() {
        if (isLegal || !document.body) return;
        if (isHome) addHomeAds();
        else if (isBlog) addBlogAds();
        else if (isTools) addToolsAds();
        else if (document.querySelector('main .content-section, main article.content-section')) addArticleAds();
        else addGenericContentAd();

        document.querySelectorAll('.ad-slot').forEach(watchShell);
    }

    idle(mount);
})();
