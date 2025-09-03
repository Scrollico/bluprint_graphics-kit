# 🤖 AI-Powered Graphics Kit Usage Guide

## 🚀 Quick Start

### 1. Start the AI Backend Server

```bash
# From the project root directory
./start-ai-backend.sh
```

This will start the FastAPI server on `http://127.0.0.1:8000`

### 2. Access the Interactive API

Open your browser and visit:

- **API Documentation**: http://127.0.0.1:8000/docs
- **Alternative Docs**: http://127.0.0.1:8000/redoc
- **Health Check**: http://127.0.0.1:8000/health

## 📊 Available API Endpoints

### 🏥 Health & Status

- **GET** `/` - Root endpoint with service info
- **GET** `/health` - Detailed health check

### 📈 Chart Generation

- **POST** `/api/v1/charts/generate` - Generate chart code
- **GET** `/api/v1/charts/templates` - List available templates

### 🔍 Data Analysis

- **POST** `/api/v1/data/analyze` - Analyze data and get insights
- **GET** `/api/v1/data/sample` - Get sample data for testing

### 💬 AI Chat

- **POST** `/api/v1/chat` - Chat with the graphics AI agent

## 🛠 Example Usage

### Generate a Bar Chart

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/charts/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"category": "Q1", "value": 100},
      {"category": "Q2", "value": 150},
      {"category": "Q3", "value": 120},
      {"category": "Q4", "value": 180}
    ],
    "chart_type": "bar",
    "specifications": {
      "title": "Quarterly Sales",
      "style_theme": "reuters",
      "width": 800,
      "height": 600
    }
  }'
```

### Analyze Data for Insights

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/data/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"year": 2020, "revenue": 100000, "customers": 150},
      {"year": 2021, "revenue": 125000, "customers": 180},
      {"year": 2022, "revenue": 140000, "customers": 220},
      {"year": 2023, "revenue": 165000, "customers": 260}
    ],
    "analysis_type": "trend"
  }'
```

### Chat with AI Assistant

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have sales data by region. What chart should I use?",
    "context": {
      "data_type": "categorical_numeric",
      "regions": ["North", "South", "East", "West"]
    }
  }'
```

### Get Sample Data

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/data/sample"
```

## 📋 Available Chart Types

1. **bar** - Bar charts for comparing categories
2. **line** - Line charts for trends over time
3. **pie** - Pie charts for showing proportions
4. **scatter** - Scatter plots for relationships
5. **area** - Area charts for cumulative data

## 🎨 Available Themes

1. **reuters** - Official Reuters branding (orange/blue)
2. **dark** - Dark theme with cyan/pink accents
3. **minimal** - Clean minimal design

## 🔬 Analysis Types

1. **summary** - Basic data structure and statistics
2. **trend** - Time-based trend analysis
3. **correlation** - Relationships between variables
4. **outliers** - Outlier detection using IQR method
5. **distribution** - Data distribution analysis

## 🎯 Using the Generated Charts

The API returns complete Svelte components that you can use directly in your graphics kit:

1. Copy the generated chart code
2. Save it as a `.svelte` file (e.g., `GeneratedChart.svelte`)
3. Import and use in your Svelte app:

```javascript
import GeneratedChart from './GeneratedChart.svelte';

// In your component
<GeneratedChart data={yourData} />;
```

## 🔧 Advanced Configuration

### Environment Variables

Create a `.env` file in `ai-backend/` directory:

```bash
# Optional: Add API keys for enhanced AI features
DASHSCOPE_API_KEY=your_dashscope_key_here
OPENAI_API_KEY=your_openai_key_here

# Server configuration
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=true

# Chart defaults
DEFAULT_CHART_WIDTH=800
DEFAULT_CHART_HEIGHT=600
DEFAULT_THEME=reuters
```

### Custom Themes

You can add custom themes by modifying `ai-backend/config.py`:

```python
STYLE_THEMES = {
    "custom": {
        "primary_color": "#your_color",
        "secondary_color": "#your_secondary",
        "background": "#ffffff",
        "text_color": "#333333",
        "font_family": "Your Font, sans-serif"
    }
}
```

## 🐛 Troubleshooting

### Server Won't Start

1. Check if virtual environment exists: `ls ai-backend/venv`
2. Reinstall dependencies: `ai-backend/venv/bin/pip install -r ai-backend/requirements.txt`
3. Check Python version: `python --version` (requires Python 3.10+)

### Import Errors

- Make sure you're in the correct directory
- Restart the server: `Ctrl+C` then `./start-ai-backend.sh`

### API Not Responding

- Check if server is running: `curl http://127.0.0.1:8000/health`
- Check for port conflicts: `lsof -i :8000`

## 🚀 Next Steps

1. **Frontend Integration**: Add Svelte components to interact with the API
2. **Custom Tools**: Extend the AI agent with domain-specific tools
3. **Data Connectors**: Add database or API data sources
4. **Export Options**: Add PDF, PNG, SVG export capabilities

## 💡 Tips & Best Practices

1. **Use the Interactive Docs**: The `/docs` endpoint is the easiest way to test the API
2. **Start with Sample Data**: Use `/api/v1/data/sample` to get familiar with data formats
3. **Analyze Before Visualizing**: Always run data analysis first to get chart recommendations
4. **Theme Consistency**: Stick to one theme across your graphics for consistency
5. **Mobile Responsive**: All generated charts are responsive by default

## 🤝 Need Help?

The AI assistant at `/api/v1/chat` can help you with:

- Choosing the right chart type
- Data structure questions
- Styling recommendations
- Best practices for data visualization

Just ask in plain English! 🗣️
