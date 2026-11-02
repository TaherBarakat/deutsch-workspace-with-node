import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function inspect(word) {
  const url = `https://www.verbformen.com/?w=${encodeURIComponent(word)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9,de;q=0.8' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log('\n===============', word, res.url);
  console.log('title', $('h1').first().text().trim());
  const adverby = $('*').filter((i, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    return /adverb/i.test(t) && t.length < 120 && $(el).children().length === 0;
  });
  console.log('adverb leaf count', adverby.length);
  adverby.slice(0, 15).each((i, el) => {
    let node = $(el);
    const ancestors = [];
    for (let d = 0; d < 5; d++) { node = node.parent(); ancestors.push(`<${node.get(0)?.tagName} class="${node.attr('class') ?? ''}">`); }
    console.log(i, JSON.stringify($(el).text().trim()), ancestors.join(' < '));
  });
  console.log('dd en count', $('dd[lang="en"]').length);
  $('dd[lang="en"]').slice(0, 5).each((i, el) => console.log('EN', i, $(el).text().replace(/\s+/g, ' ').trim()));
  console.log('search result links:', $('a[href*="declension/adjectives"], a[href*="/conjugation/"]').slice(0, 12).map((i, el) => ({ href: $(el).attr('href'), text: $(el).text().trim() })).get());
  console.log('has .vStm', $('.vStm').length, $('.vStm').first().text().replace(/\s+/g, ' ').trim());
  console.log('examples count', $('.vBsp li').length);
  const exSection = $('section').filter((i, n) => $(n).find('h2').first().text().trim() === 'Examples').first();
  console.log('example section:', exSection.text().replace(/\s+/g, ' ').trim().slice(0, 300));
}

for (const w of ['gern', 'oft', 'bald', 'sehr']) {
  await inspect(w);
}
