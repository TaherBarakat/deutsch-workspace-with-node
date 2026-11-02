import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const res = await fetch('https://www.verbformen.com/?w=gern', { headers: { 'User-Agent': UA } });
const html = await res.text();
const $ = cheerio.load(html);
const rows = $('.bTrf');
console.log('rows', rows.length);
rows.each((i, el) => {
  const row = $(el);
  const text = row.text().replace(/\s+/g, ' ').trim();
  if (!/gern/i.test(text)) return;
  console.log('\n==== MATCH ROW', i, '====');
  console.log('TEXT:', text.slice(0, 900));
  console.log('adverb title:', row.find('[title="adverb"]').length);
  console.log('lang en:', row.find('[lang="en"]').map((j, e) => $(e).text().replace(/\s+/g, ' ').trim()).get());
  console.log('q:', row.find('q').map((j, e) => $(e).text().trim()).get());
  console.log('wKnFmt:', row.find('.wKnFmt').map((j, e) => $(e).text().replace(/\s+/g, ' ').trim()).get());
  console.log('links:', row.find('a').map((j, e) => $(e).attr('href')).get().filter((h) => h && !h.startsWith('http')).slice(0, 10));
  console.log('HTML:', row.html().replace(/\s+/g, ' ').slice(0, 5000));
});
