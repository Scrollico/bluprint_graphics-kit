/**
 * Test script for Scrolli RSS Worker
 * This script tests the RSS generation locally
 */

import { extractStories, generateRSSFeed } from './scrolli-rss-worker.js';

async function testRSSGeneration() {
  const pageURL = 'https://www.scrolli.co/global/ozel-hikayeler';

  try {
    console.log('Fetching page...');
    const response = await fetch(pageURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Bot/1.0)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Page fetched successfully (${html.length} characters)`);

    // Extract stories
    const stories = extractStories(html);
    console.log(`Found ${stories.length} stories:`);

    stories.slice(0, 5).forEach((story, index) => {
      console.log(`${index + 1}. ${story.title}`);
      console.log(`   URL: ${story.url}`);
      console.log('');
    });

    if (stories.length > 5) {
      console.log(`... and ${stories.length - 5} more stories`);
    }

    // Generate RSS
    const rss = generateRSSFeed(stories, pageURL);
    console.log('\nRSS Feed generated successfully!');
    console.log(`RSS length: ${rss.length} characters`);

    // Save RSS to file for inspection
    const fs = await import('fs');
    fs.writeFileSync('./scrolli-rss-test.xml', rss);
    console.log('RSS saved to scrolli-rss-test.xml');

    return { success: true, storyCount: stories.length, rssLength: rss.length };
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testRSSGeneration().then((result) => {
  if (result.success) {
    console.log(`\n✅ Test completed successfully!`);
    console.log(`📊 Found ${result.storyCount} stories`);
    console.log(`📄 Generated RSS feed (${result.rssLength} characters)`);
  } else {
    console.log(`\n❌ Test failed: ${result.error}`);
  }
});
