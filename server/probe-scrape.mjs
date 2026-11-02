import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function grab(word) {
  const url = `https://www.verbformen.com/?w=${encodeURIComponent(word)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9,de;q=0.8' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log('\n================', word, res.status, res.url, 'len', html.length);
  console.log('TITLE:', $('h1').first().text().replace(/\s+/g, ' ').trim());
  console.log('INTRO:', $('h1').first().next('p').text().replace(/\s+/g, ' ').trim().slice(0, 800));
  console.log('EN:', $('dd[lang="en"]').first().text().replace(/\s+/g, ' ').trim().slice(0, 400));
  console.log('HEADINGS:', $('h2,h3').map((i, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().filter(Boolean).slice(0, 30).join(' | '));
  const tableHeads = $('.vTbl h3').map((i, el) => $(el).text().replace(/\s+/g, ' ').trim()).get();
  console.log('VTBL HEADS:', tableHeads.join(' | '));
  // Any comparison info
  for (const q of ['comparative', 'superlative', 'Comparative', 'Superlative', 'steigerung', 'Steigerung']) {
    const i = html.indexOf(q);
    if (i >= 0) console.log(`\n--- ${q} @${i}:`, html.slice(Math.max(0, i - 300), i + 500).replace(/\s+/g, ' '));
  }
  console.log('EXAMPLES:', $('.vBsp li').slice(0, 2).map((i, el) => $(el).text().replace(/\s+/g, ' ').trim()).get());
  const exSection = $('section').filter((i, n) => $(n).find('h2').first().text().trim() === 'Examples').first();
  console.log('EX SECTION:', exSection.text().replace(/\s+/g, ' ').trim().slice(0, 600));
  // print structure around '.vGrnd' or 'vStm'
  for (const sel of ['.vGrnd', '.vStm', '.rInf', 'p.rInf']) {
    const el = $(sel).first();
    if (el.length) console.log(sel, '=>', el.text().replace(/\s+/g, ' ').trim().slice(0, 400));
  }
}

for (const word of ['schnell', 'gern', 'glücklich', 'oft', 'heute']) {
  try {
    await grab(word);
  } catch (e) {
    console.log(word, 'ERROR', e.message);
  }
}
