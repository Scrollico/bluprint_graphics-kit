# 🚀 Quick Start: Scrollytelling with Bluprint

Get up and running with scrollytelling in under 5 minutes!

## 1. Start the Development Server

```bash
pnpm start
```

This will open your browser to `http://localhost:5173`

## 2. View the Demo

Visit the scrollytelling demo:

```
http://localhost:5173/scrollytelling
```

You'll see:

- ✅ Sticky graphic pane on the left
- ✅ Scrollable text on the right
- ✅ Charts that switch as you scroll
- ✅ Responsive design

## 3. Create Your First Story

Use the story generator:

```bash
pnpm story:add my-first-story
```

This creates:

- `pages/my-first-story/+page.svelte`
- `pages/my-first-story/+layout.ts`

Visit: `http://localhost:5173/my-first-story`

## 4. Customize Your Story

Edit `pages/my-first-story/+page.svelte`:

1. **Change the headline:**

   ```javascript
   hed: "Your Amazing Story Headline",
   ```

2. **Add your content:**

   ```svelte
   <section class="step">
     <BodyText text="Your first step content here..." />
   </section>
   ```

3. **Add your charts:**
   ```svelte
   {#if currentStep === 0}
     <YourChart1 />
   {:else if currentStep === 1}
     <YourChart2 />
   {/if}
   ```

## 5. Add Interactive Charts

### D3.js Charts

```bash
pnpm add d3
```

### Mapbox Maps

```bash
pnpm add mapbox-gl @types/mapbox-gl
```

## 6. Deploy Your Story

```bash
pnpm build
pnpm pub
```

## 🎯 What You Can Do Now

- ✅ Create scroll-driven stories
- ✅ Add interactive charts
- ✅ Use responsive design
- ✅ Deploy to production
- ✅ Follow Reuters Graphics standards

## 📚 Next Steps

1. Read `SCROLLYTELLING_README.md` for detailed documentation
2. Check out the example charts in `src/lib/components/charts/`
3. Explore the scroll utility in `src/utils/scroll.ts`
4. Customize the styling and layout

## 🆘 Need Help?

- Check the browser console for errors
- Enable debug mode: `debug: true` in scroll options
- Read the troubleshooting section in `SCROLLYTELLING_README.md`

---

Happy scrollytelling! 🎉
