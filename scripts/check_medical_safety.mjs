/** Static safety/medical-review guard. Run: node scripts/check_medical_safety.mjs */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const queue = JSON.parse(read('content/medical/review-queue.json'));
const catalog = JSON.parse(read('content/articles/catalog.json'));
assert.equal(queue.medical_review_completed, false);
assert.equal(queue.medical_review_status, 'not_reviewed');
assert.equal(queue.queue.length, 10, 'All 5 guides + 5 articles must be in review queue');
const paths = new Set();
for (const item of queue.queue) {
    assert.ok(!paths.has(item.path), 'Duplicate review path: ' + item.path);
    paths.add(item.path);
    assert.equal(item.medical_review.status, 'not_reviewed', 'False medical approval: ' + item.path);
    assert.equal(item.medical_review.reviewer, null);
    assert.ok(fs.existsSync(path.join(root, item.path)), 'Missing review target: ' + item.path);
}
const mainGuides = ['sleep', 'nutrition', 'vaccine', 'growth', 'diseases'];
for (const slug of mainGuides) {
    const file = 'pages/' + slug + '.html';
    const html = read(file);
    assert.ok(html.includes('data-medical-review="not-reviewed"'), 'Missing visible review status: ' + file);
    assert.ok(html.includes('لم يُراجع المحتوى من مختص طبي بعد'), 'Misleading medical status: ' + file);
    assert.ok(html.includes('editorial-policy.html'), 'Missing editorial policy link: ' + file);
}
for (const article of catalog.articles) {
    const file = 'pages/articles/' + article.slug + '.html';
    assert.equal(article.medical_review.status, 'not_reviewed', 'False article approval: ' + file);
    assert.equal(article.medical_review.reviewer, null);
    assert.ok(paths.has(file), 'Published article missing in review queue: ' + file);
    const html = read(file);
    assert.ok(html.includes('لم يُراجع طبيًا بعد'), 'Missing visible article status: ' + file);
}
const sleep = read('pages/sleep.html');
assert.ok(!sleep.includes('20-22°C'), 'Do not claim a universal room temperature');
assert.ok(!sleep.includes('90%'), 'Unverified SIDS percentage returned');
assert.ok(!sleep.includes('بنسبة تصل إلى 50%'), 'Unverified absolute risk claim returned');
const nutrition = read('pages/nutrition.html');
assert.ok(!nutrition.includes('ممنوعة تماماً حتى عمر 4-5 سنوات'), 'Whole nuts / nut paste advice conflated');
assert.ok(!nutrition.includes('ضاعف وزنه عند الولادة على الأقل'), 'Misleading feeding criterion returned');
const growth = read('pages/growth.html');
assert.ok(!growth.includes('زيادة سريعة جداً (استسقاء الرأس)'), 'Unjustified diagnostic inference returned');
const diseases = read('pages/diseases.html');
assert.ok(!diseases.includes('الراحة والنوم مع رفع الرأس قليلاً'), 'Unsafe inclined sleep returned');
assert.ok(!diseases.includes('التنفس في حمام مليء بالبخار الدافئ'), 'Scalding steam advice returned');
assert.ok(diseases.includes('أقل من 3 أشهر') && diseases.includes('38°م'));
const feedingCode = read('js/nutrition.js');
assert.ok(!feedingCode.includes("resultTitle = 'مستعد تماماً!'"), 'Unvalidated readiness verdict returned');
assert.ok(!feedingCode.includes('الكمية الموصى بها'), 'Unvalidated personal portion prescriptions returned');
assert.ok(feedingCode.includes('لا توجد كمية ثابتة مناسبة لكل رضيع'), 'Flexible feeding guidance missing');
const policy = read('pages/editorial-policy.html');
assert.ok(policy.includes('medical-review-queue'), 'Clinical review queue not public');
console.log('PASS: ' + mainGuides.length + ' medical guides + ' + catalog.articles.length + ' articles: review statuses visible and no false approvals.');
console.log('PASS: high-risk wording guards, clinician-review queue and feeding tool safety.');
