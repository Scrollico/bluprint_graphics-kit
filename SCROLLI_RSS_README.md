# Scrolli.co RSS Feed Generator

A Cloudflare Worker that generates RSS feeds from Scrolli.co special stories page.

## Features

- ✅ Fetches stories from https://www.scrolli.co/global/ozel-hikayeler
- ✅ Extracts story titles and URLs automatically
- ✅ Generates valid RSS 2.0 XML feed
- ✅ Handles HTML entities and special characters
- ✅ Includes proper RSS metadata
- ✅ Caching for performance (1 hour cache)
- ✅ CORS headers for cross-origin access

## Files

- `scrolli-rss-worker.js` - Main Cloudflare Worker script
- `test-scrolli-rss.js` - Local testing script
- `wrangler.toml` - Cloudflare Worker configuration
- `package-rss.json` - Package configuration for deployment

## Quick Start

### 1. Install Dependencies

```bash
npm install -g wrangler
# or
pnpm add -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Deploy the Worker

```bash
wrangler deploy
```

### 4. Test the RSS Feed

Your RSS feed will be available at:

```
https://scrolli-rss-feed.your-subdomain.workers.dev
```

## Local Testing

### Test the RSS Generation

```bash
node test-scrolli-rss.js
```

This will:

- Fetch the Scrolli.co page
- Extract all stories
- Generate RSS XML
- Save the result to `scrolli-rss-test.xml`

### Development Mode

```bash
wrangler dev
```

This starts a local development server at `http://localhost:8787`

## Configuration

### Environment Variables

You can set these in your Cloudflare Worker dashboard:

- `CACHE_TTL` - Cache time-to-live in seconds (default: 3600)
- `MAX_STORIES` - Maximum number of stories to include (default: 50)

### Cron Triggers

The worker is configured to run every 6 hours automatically:

```toml
[[triggers]]
crons = ["0 */6 * * *"]
```

## RSS Feed Structure

The generated RSS feed includes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Scrolli Global: Özel Hikayeler</title>
    <link>https://www.scrolli.co/global/ozel-hikayeler</link>
    <description>All special stories from Scrolli Global</description>
    <language>en</language>
    <lastBuildDate>...</lastBuildDate>
    <atom:link href="..." rel="self" type="application/rss+xml"/>
    <generator>Scrolli RSS Worker</generator>
    <ttl>3600</ttl>

    <item>
      <title><![CDATA[Story Title]]></title>
      <link>https://www.scrolli.co/global/story/story-slug</link>
      <guid isPermaLink="true">https://www.scrolli.co/global/story/story-slug</guid>
      <pubDate>...</pubDate>
      <description><![CDATA[Story Title - Special story from Scrolli Global]]></description>
    </item>
    <!-- More items... -->
  </channel>
</rss>
```

## Troubleshooting

### Common Issues

1. **No stories found**: The page structure might have changed. Check the HTML selectors in the worker.

2. **CORS errors**: The worker includes CORS headers, but some RSS readers might still have issues.

3. **Rate limiting**: Scrolli.co might block requests. The worker includes proper User-Agent headers.

### Debug Mode

Add this to your worker for debugging:

```javascript
console.log('Stories found:', stories.length);
console.log('First story:', stories[0]);
```

### Monitoring

Check your Cloudflare Worker analytics for:

- Request count
- Error rate
- Response time
- Cache hit ratio

## Customization

### Change the Source Page

Edit the `pageURL` variable in `scrolli-rss-worker.js`:

```javascript
const pageURL = 'https://www.scrolli.co/your-custom-page';
```

### Modify Story Extraction

Update the regex patterns in `extractStories()` function to match different page structures.

### Add More Metadata

Enhance the RSS items with additional fields:

```javascript
<item>
  <title><![CDATA[${title}]]></title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${pubDate}</pubDate>
  <description><![CDATA[${description}]]></description>
  <category>News</category>
  <author>Scrolli Editorial</author>
</item>
```

## Deployment Options

### Cloudflare Workers (Recommended)

- Free tier: 100,000 requests/day
- Global edge network
- Automatic scaling

### Alternative Platforms

- **Vercel**: Use as a serverless function
- **Netlify**: Use as a serverless function
- **AWS Lambda**: Convert to Lambda function
- **Railway**: Deploy as a Node.js app

## License

MIT License - feel free to use and modify as needed.

## Support

If you encounter issues:

1. Check the Cloudflare Worker logs
2. Test locally with `node test-scrolli-rss.js`
3. Verify the page structure hasn't changed
4. Check for rate limiting or blocking

## Example Usage

Once deployed, you can use the RSS feed in:

- RSS readers (Feedly, Inoreader, etc.)
- News aggregators
- Custom applications
- Social media automation tools

The feed URL will be:

```
https://scrolli-rss-feed.your-subdomain.workers.dev
```
