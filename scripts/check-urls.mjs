// wp-backup/urls.csv の全URLが新環境でも200を返すか確認する
// 使い方: node scripts/check-urls.mjs [BASE_URL]  例) Vercelのプレビュー環境URL
// プレビュー環境に認証がかかっている場合は、環境変数 VERCEL_AUTOMATION_BYPASS_SECRET に
// Vercelの「Protection Bypass for Automation」のシークレットを設定する
import fs from 'node:fs/promises';

const ORIGINAL = 'https://www.front-end-engineer-blog.com';
const BASE_URL = (process.argv[2] ?? ORIGINAL).replace(/\/$/, '');
const BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const headers = BYPASS_SECRET ? { 'x-vercel-protection-bypass': BYPASS_SECRET } : {};

const csv = await fs.readFile('wp-backup/urls.csv', 'utf8');
const urls = csv
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => line.split(',')[1].replace(/^"|"$/g, '').replace(ORIGINAL, BASE_URL));

let ng = 0;
for (const url of urls) {
  const res = await fetch(url, { redirect: 'manual', headers }).catch((e) => ({ status: String(e) }));
  if (res.status !== 200) {
    ng++;
    console.log(res.status, url, res.headers?.get?.('location') ?? '');
  }
}
console.log(`${urls.length - ng}/${urls.length} OK (${BASE_URL})`);
process.exit(ng ? 1 : 0);
