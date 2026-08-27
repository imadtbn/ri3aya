## اختبار runtime بعد تفعيل GTM

بعد مسح Service Worker والكاش المحلي وإعادة تحميل `pages/sections.html`، أنشأ `site-tags.js` `dataLayer` مع حدث `gtm.js` واحد، وظهر سكريبت GTM واحد بعنوان `GTM-NPLKWQRN`. لم يظهر أي تحميل مباشر لـ`gtag.js`. ظهر وسم إثبات Google مرة واحدة. بقيت `gtmNoscript` غير مقروءة عبر `document.querySelectorAll` لأن محتوى `noscript` لا يُفسّر كـiframe حي في سياق JavaScript، بينما النص موجود في HTML المصدر بالمعرف الصحيح.
