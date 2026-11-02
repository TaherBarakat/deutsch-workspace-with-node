import * as cheerio from 'cheerio';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const res = await fetch('https://www.verbformen.com/?w=gern', { headers: { 'User-Agent': UA } });
const html = await res.text();
const $ = cheerio.load(html);
const rows = $('.bTrf');
console.log('rows', rows.length);
rows.slice(0, 4).each((i, el) => {
  console.log('\n==== ROW', i, '====');
  console.log($(el).html().replace(/\s+/g, ' ').slice(0, 3000));
});
