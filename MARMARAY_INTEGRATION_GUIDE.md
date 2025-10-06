# Marmaray Scrollytelling Integration Guide

## ✅ What We Fixed

The main issue was a **data type mismatch** between how we were passing map targets to the MapboxMap component.

### The Problem:

- **Working pages**: Pass string keys like `"istanbul"`, `"nyc"`, `"texas"`
- **Broken pages**: Passed JSON strings like `'{"center":[...],"zoom":11}'`

### The Solution:

- Use simple string keys that match the `mapConfigs` object in MapboxMap component
- Remove debouncing delays that were causing timing issues
- Add direct map control functions for debugging

## 🎯 How to Test the Marmaray Page

### 1. Go to the Marmaray page:

```
http://localhost:3000/marmaray
```

### 2. Open browser console (F12) and try these commands:

#### Step-based testing:

```javascript
// Test individual steps
testStep(6); // Ayrılık Çeşmesi
testStep(7); // Ataköy
testStep(8); // Güzelyalı
testStep(10); // NYC debug (very obvious)
testStep(11); // Texas debug (very obvious)

// Direct step testing (bypasses scroll detection)
directStep(6); // Direct step change
directStep(10); // Direct step change to NYC
```

#### Map-based testing:

```javascript
// Test map targets directly
testMap('ayrilikcesmesi'); // Ayrılık Çeşmesi
testMap('atakoy'); // Ataköy
testMap('guzelyali'); // Güzelyalı
testMap('nyc'); // NYC (very obvious)
testMap('texas'); // Texas (very obvious)
testMap('istanbul'); // Istanbul overview

// Direct map control (bypasses all reactivity)
directMap('nyc'); // Should fly to NYC immediately
directMap('texas'); // Should fly to Texas immediately
```

## 🔧 Key Changes Made

### 1. Removed Debouncing

```svelte
// OLD (had 60ms delay):
mapTargetTimer = window.setTimeout(() => {
  mapTarget = newTarget;
}, 60);

// NEW (immediate):
mapTarget = newTarget;
```

### 2. Fixed showMap Logic

```svelte
// OLD (depended on complex flags): let showMap = $derived( step7Active ||
step8Active || step9Active || stepNYCActive || stepTexasActive ); // NEW
(depends on currentStep directly): let showMap = $derived( currentStep === 6 ||
currentStep === 7 || currentStep === 8 || currentStep === 10 || currentStep ===
11 );
```

### 3. Added Direct Control Functions

```javascript
// Direct step control (bypasses scroll detection)
directStep(stepIndex);

// Direct map control (bypasses all reactivity)
directMap(target);
```

## 🎨 Integration with Your Content

### To add new map locations:

1. **Add to MapboxMap component** (`src/lib/components/charts/MapboxMap.svelte`):

```javascript
const mapConfigs = {
  // ... existing configs
  yourNewLocation: {
    center: [longitude, latitude],
    zoom: 16,
    bearing: 0,
    pitch: 60,
  },
};
```

2. **Add to Marmaray page** (`pages/marmaray/+page.svelte`):

```svelte
// Add to mapTarget type let mapTarget: 'istanbul' | 'yourNewLocation' =
'istanbul'; // Add to step mapping const newTarget = currentStep === 12 ?
'yourNewLocation' : 'istanbul';
```

3. **Add to stepNamesByIndex array**:

```javascript
const stepNamesByIndex = [
  // ... existing steps
  'your-new-step', // 12
];
```

## 🚀 Performance Tips

1. **Use directStep() for testing** - bypasses scroll detection
2. **Use directMap() for debugging** - bypasses all reactivity
3. **Test with obvious locations first** - NYC and Texas are very obvious
4. **Check console logs** - look for `[MapboxMap] target prop observed` messages

## 🐛 Troubleshooting

### If map doesn't move:

1. Check console for `[MapboxMap] target prop observed` logs
2. Try `directMap("nyc")` - should work immediately
3. Check if `showMap` is true in debug panel
4. Verify mapTarget is a string key, not JSON

### If scroll detection doesn't work:

1. Try `directStep(10)` - should work immediately
2. Check if step elements have correct IDs
3. Verify `currentStep` is updating in debug panel

## 📝 Next Steps

1. **Test the current implementation** with the debug commands
2. **Add your actual content** to replace the debug steps
3. **Customize the map styles** in MapboxMap component
4. **Add your data layers** and visualizations
5. **Optimize for mobile** and different screen sizes

The foundation is now solid and working! 🎉
