/**
 * Scrolli.co RSS Feed Generator
 * Cloudflare Worker script for generating RSS feeds from Scrolli.co stories
 *
 * This worker fetches the Scrolli.co special stories page and generates an RSS feed
 * with all the stories found on the page.
 */

export default {
  async fetch(request, env, ctx) {
    const pageURL = 'https://www.scrolli.co/global/ozel-hikayeler';

    try {
      // Fetch the page with proper headers to avoid blocking
      const response = await fetch(pageURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Bot/1.0)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
        },
      });

      if (!response.ok) {
        return new Response(
          `Failed to fetch page: ${response.status} ${response.statusText}`,
          {
            status: 500,
          }
        );
      }

      const html = await response.text();

      // Extract stories using the correct selectors
      const stories = extractStories(html);

      if (stories.length === 0) {
        return new Response('No stories found on the page', { status: 404 });
      }

      // Generate RSS feed
      const rss = generateRSSFeed(stories, pageURL);

      return new Response(rss, {
        headers: {
          'Content-Type': 'application/rss+xml; charset=UTF-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Error generating RSS feed:', error);
      return new Response(`Error generating RSS feed: ${error.message}`, {
        status: 500,
      });
    }
  },
};

/**
 * Extract stories from HTML using the correct selectors
 * Based on the page structure: div.hero-split-4 contains h1.heading-118 and a[href*="/global/story/"]
 */
export function extractStories(html) {
  const stories = [];

  // Use regex to find all story containers with images
  // Pattern: <div class="hero-split-4">...<img class="shadow-two-3" src="IMAGE_URL">...<h1 class="heading-118">TITLE</h1>...<a href="/global/story/SLUG">Explore</a>...</div>
  const storyPattern =
    /<div class="hero-split-4"[^>]*>[\s\S]*?<img[^>]+class="shadow-two-3"[^>]+src="([^"]+)"[^>]*>[\s\S]*?<h1 class="heading-118"[^>]*>([^<]+)<\/h1>[\s\S]*?<a href="(\/global\/story\/[^"]+)"[^>]*>[\s\S]*?<\/div>/gi;

  let match;
  while ((match = storyPattern.exec(html)) !== null) {
    if (match.length >= 4) {
      const imageUrl = match[1];
      const title = match[2].trim();
      const relativeUrl = match[3];

      // Clean up the title (remove HTML entities and extra whitespace)
      const cleanTitle = title
        .replace(/&[#A-Za-z0-9]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Create full URL
      const fullUrl =
        relativeUrl.startsWith('http') ? relativeUrl : (
          `https://www.scrolli.co${relativeUrl}`
        );

      stories.push({
        title: cleanTitle,
        url: fullUrl,
        imageUrl: imageUrl,
        pubDate: new Date().toUTCString(), // Use current date as fallback
      });
    }
  }

  // If regex didn't work, try alternative approach
  if (stories.length === 0) {
    console.log('Regex failed, trying alternative extraction');
    return extractStoriesAlternative(html);
  }

  return stories;
}

/**
 * Alternative extraction method using different patterns
 */
export function extractStoriesAlternative(html) {
  const stories = [];

  // Extract English stories only - look for stories with "Explore" button and /global/story/ URLs
  // Pattern: <div class="hero-split-4"><h1 class="heading-118">TITLE</h1><a href="/global/story/URL" class="button-primary-20 w-button">Explore</a></div>
  const englishStoryPattern =
    /<div class="hero-split-4"[^>]*>[\s\S]*?<h1 class="heading-118"[^>]*>([^<]+)<\/h1>[\s\S]*?<a href="(\/global\/story\/[^"]+)"[^>]*class="button-primary-20 w-button"[^>]*>Explore<\/a>[\s\S]*?<\/div>/gi;

  let englishMatch;
  while ((englishMatch = englishStoryPattern.exec(html)) !== null) {
    if (englishMatch.length >= 3) {
      const title = englishMatch[1].trim();
      const relativeUrl = englishMatch[2];

      // Clean up the title
      const cleanTitle = title
        .replace(/&[#A-Za-z0-9]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Create full URL
      const fullUrl =
        relativeUrl.startsWith('http') ? relativeUrl : (
          `https://www.scrolli.co${relativeUrl}`
        );

      // Only add English stories (filter out Turkish titles)
      if (
        !cleanTitle.includes('mi yoksa') &&
        !cleanTitle.includes('da yeni') &&
        !cleanTitle.includes('anatomisi') &&
        !cleanTitle.includes('yıkıma') &&
        !cleanTitle.includes('roller') &&
        !cleanTitle.includes('zaferi') &&
        !cleanTitle.includes('geleceği') &&
        !cleanTitle.includes('zirvesi') &&
        !cleanTitle.includes('Pax Americana') &&
        !cleanTitle.includes('savaşlarının') &&
        !cleanTitle.includes('doğum oranları') &&
        !cleanTitle.includes('Prof. Dr.') &&
        !cleanTitle.includes('Tekno-Mesihler') &&
        !cleanTitle.includes('kemer sıkma') &&
        !cleanTitle.includes('Altan Öymen') &&
        !cleanTitle.includes('Sevil Atasoy') &&
        !cleanTitle.includes('Merz dönemi') &&
        !cleanTitle.includes('Terörsüz') &&
        !cleanTitle.includes('Deprem ve ekonomi') &&
        !cleanTitle.includes('Tarifeler') &&
        !cleanTitle.includes('Kadın, güç') &&
        !cleanTitle.includes('Veride yeni') &&
        !cleanTitle.includes('Anoreksiya') &&
        !cleanTitle.includes('NATO Zirvesi') &&
        !cleanTitle.includes('Merkez dağılırken') &&
        !cleanTitle.includes('Nadir toprak') &&
        !cleanTitle.includes('süpernova') &&
        !cleanTitle.includes('Yap-İşlet-Devret') &&
        !cleanTitle.includes('endemik türleri') &&
        !cleanTitle.includes("ABD'siz Avrupa") &&
        !cleanTitle.includes('Eurovision') &&
        !cleanTitle.includes('merkez siyaset') &&
        !cleanTitle.includes('askeri varlığı') &&
        !cleanTitle.includes('Kumlardan göğe') &&
        !cleanTitle.includes('Oğlunun gözünden') &&
        !cleanTitle.includes('toplanma alanları') &&
        !cleanTitle.includes('Jeo-ekonomi') &&
        !cleanTitle.includes('Osmanlı hatasından') &&
        !cleanTitle.includes('gölgesi İmamoğlu') &&
        !cleanTitle.includes("1923'te kurulan") &&
        !cleanTitle.includes('Transatlantik') &&
        !cleanTitle.includes('AGI yolculuğu') &&
        !cleanTitle.includes('tarifeler çağı') &&
        !cleanTitle.includes('Protestoların') &&
        !cleanTitle.includes('Lazarus') &&
        !cleanTitle.includes('Saraçhane')
      ) {
        stories.push({
          title: cleanTitle,
          url: fullUrl,
          imageUrl: null, // Will be added separately
          pubDate: new Date().toUTCString(),
        });
      }
    }
  }

  // Now find images for these stories by matching them with the same pattern
  const imagePattern = /class="shadow-two-3".*?src="([^"]+)"/gi;
  const images = [];
  let imageMatch;
  while ((imageMatch = imagePattern.exec(html)) !== null) {
    images.push(imageMatch[1]);
  }

  // Pair images with stories (assuming they appear in the same order)
  const maxLength = Math.min(images.length, stories.length);
  for (let i = 0; i < maxLength; i++) {
    if (stories[i]) {
      stories[i].imageUrl = images[i];
    }
  }

  // If the container pattern didn't work, try the old method
  if (stories.length === 0) {
    // Try to find h1 elements with heading-118 class
    const titlePattern = /<h1 class="heading-118"[^>]*>([^<]+)<\/h1>/gi;
    const titles = [];
    let titleMatch;

    while ((titleMatch = titlePattern.exec(html)) !== null) {
      titles.push(titleMatch[1].trim());
    }

    // Try to find story links
    const linkPattern = /<a href="(\/global\/story\/[^"]+)"[^>]*>/gi;
    const links = [];
    let linkMatch;

    while ((linkMatch = linkPattern.exec(html)) !== null) {
      links.push(linkMatch[1]);
    }

    // Match titles with links (assuming they appear in the same order)
    const maxLength = Math.min(titles.length, links.length);
    for (let i = 0; i < maxLength; i++) {
      const title = titles[i]
        .replace(/&[#A-Za-z0-9]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const relativeUrl = links[i];
      const fullUrl =
        relativeUrl.startsWith('http') ? relativeUrl : (
          `https://www.scrolli.co${relativeUrl}`
        );

      stories.push({
        title: title,
        url: fullUrl,
        pubDate: new Date().toUTCString(),
      });
    }
  }

  return stories;
}

/**
 * Generate RSS XML feed from stories array
 */
export function generateRSSFeed(stories, pageURL) {
  const currentDate = new Date().toUTCString();

  // Generate RSS items
  const rssItems = stories
    .map((story) => {
      const title = escapeXml(story.title);
      const url = escapeXml(story.url);
      const imageUrl = story.imageUrl ? escapeXml(story.imageUrl) : null;
      const pubDate = story.pubDate || currentDate;

      // Include image if available
      const imageElement =
        imageUrl ?
          `
      <enclosure url="${imageUrl}" type="image/jpeg"/>
      <media:content url="${imageUrl}" type="image/jpeg" medium="image"/>`
        : '';

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${title} - Special story from Scrolli Global]]></description>${imageElement}
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Scrolli Global: Özel Hikayeler</title>
    <link>${pageURL}</link>
    <description>All special stories (Özel Hikayeler) from Scrolli Global - In-depth media experience</description>
    <language>en</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${pageURL}" rel="self" type="application/rss+xml"/>
    <generator>Scrolli RSS Worker</generator>
    <ttl>3600</ttl>
    
${rssItems}
  </channel>
</rss>`;

  return rss;
}

/**
 * Escape XML special characters
 */
export function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
