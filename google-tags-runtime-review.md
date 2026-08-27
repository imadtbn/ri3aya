## اختبار runtime بعد تفعيل GTM

بعد مسح Service Worker والكاش المحلي وإعادة تحميل `pages/sections.html`، أنشأ `site-tags.js` `dataLayer` مع حدث `gtm.js` واحد، وظهر سكريبت GTM واحد بعنوان `GTM-NPLKWQRN`. لم يظهر أي تحميل مباشر لـ`gtag.js`. ظهر وسم إثبات Google مرة واحدة. بقيت `gtmNoscript` غير مقروءة عبر `document.querySelectorAll` لأن محتوى `noscript` لا يُفسّر كـiframe حي في سياق JavaScript، بينما النص موجود في HTML المصدر بالمعرف الصحيح.
## فحص الموقع المنشور

على `https://imadtbn.github.io/ri3aya/pages/sections.html`، ظهر `site-tags.js` وظهر مصدر `https://www.googletagmanager.com/gtm.js?id=GTM-NPLKWQRN`، كما احتوى `dataLayer` على حدث `gtm.js` واحد، ولم يظهر تحميل مباشر لـ`gtag.js`. ظهر `noscript` الرسمي ووسم إثبات Google في HTML. في لحظة الفحص لم تكن `window.google_tag_manager['GTM-NPLKWQRN']` جاهزة بعد؛ لذلك يلزم الانتظار/فحص Network وGTM Preview قبل الحكم على أن الحاوية لا تعمل.
## تشخيص وإصلاح رسالة Google tag

استجابة `https://www.googletagmanager.com/gtm.js?id=GTM-NPLKWQRN` نجحت، وظهر `dataLayer` مع `gtm.js`، لكن جسم استجابة الحاوية لم يتضمن `G-GK64YX2FPB`. لذلك لم تكن حاوية `GTM-NPLKWQRN` تحتوي Google tag/GA4 منشورًا عند الفحص، وهو ما يفسر رسالة Google Tag Assistant. أضيف مسار GA4 المركزي إلى `site-tags.js` مع `ga4ManagedByGtm: false`، وبذلك يُحمّل `gtag.js` ويُرسل `config` مرة واحدة. عند إعداد GA4 داخل GTM لاحقًا، يجب تغيير المفتاح إلى `true` لتجنب التكرار.
