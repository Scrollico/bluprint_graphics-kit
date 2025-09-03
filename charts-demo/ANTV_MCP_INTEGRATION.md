# AntV MCP Server Chart Integration with Cursor

## Overview

This document demonstrates how to use the AntV MCP Server Chart with Cursor for advanced data visualization and chart generation in the graphics kit project.

## Features Available

The AntV MCP Server provides 25+ chart types:

### Basic Charts

- **Line Chart** (`generate_line_chart`) - Display trends over time
- **Bar Chart** (`generate_bar_chart`) - Horizontal comparisons
- **Column Chart** (`generate_column_chart`) - Vertical comparisons
- **Area Chart** (`generate_area_chart`) - Show data trends under continuous variables
- **Pie Chart** (`generate_pie_chart`) - Display data proportions

### Advanced Charts

- **Radar Chart** (`generate_radar_chart`) - Multi-dimensional data visualization
- **Funnel Chart** (`generate_funnel_chart`) - Show data loss at different stages
- **Dual Axes Chart** (`generate_dual_axes_chart`) - Two variables with different units
- **Boxplot Chart** (`generate_boxplot_chart`) - Data distribution with median and quartiles
- **Histogram Chart** (`generate_histogram_chart`) - Data distribution in intervals

### Specialized Charts

- **Liquid Chart** (`generate_liquid_chart`) - Percentage visualization as water-filled spheres
- **Network Graph** (`generate_network_graph`) - Show relationships between nodes
- **Organization Chart** (`generate_organization_chart`) - Display organizational structure
- **Mind Map** (`generate_mind_map`) - Hierarchical information display
- **Fishbone Diagram** (`generate_fishbone_diagram`) - Root cause analysis

### Geographic Charts

- **District Map** (`generate_district_map`) - Administrative divisions
- **Pin Map** (`generate_pin_map`) - POI distribution
- **Path Map** (`generate_path_map`) - Route planning visualization

## Setup Instructions

### 1. Installation

The MCP server has been installed globally:

```bash
npm install -g @antv/mcp-server-chart
```

### 2. Cursor Configuration

The following configuration has been added to Cursor settings:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"]
    }
  }
}
```

### 3. Restart Cursor

After adding the configuration, restart Cursor to load the MCP server.

## Usage in Cursor

Once configured, you can use natural language prompts in Cursor to generate charts:

### Example Prompts:

1. **"Generate a line chart showing monthly sales data"**

   - Cursor will use `generate_line_chart` tool
   - Provide your data in format: `[{"time": "2025-01", "value": 1000}, ...]`

2. **"Create a pie chart for market share data"**

   - Uses `generate_pie_chart` tool
   - Data format: `[{"category": "Product A", "value": 30}, ...]`

3. **"Show me a radar chart for performance metrics"**

   - Uses `generate_radar_chart` tool
   - Multi-dimensional data visualization

4. **"Generate a funnel chart for conversion rates"**
   - Uses `generate_funnel_chart` tool
   - Perfect for showing user journey drop-offs

## Sample Data Formats

### Line Chart Data

```json
[
  { "time": "2025-01", "value": 512 },
  { "time": "2025-02", "value": 1024 },
  { "time": "2025-03", "value": 756 }
]
```

### Pie Chart Data

```json
[
  { "category": "Desktop", "value": 45 },
  { "category": "Mobile", "value": 35 },
  { "category": "Tablet", "value": 20 }
]
```

### Radar Chart Data

```json
[
  { "dimension": "Speed", "value": 85 },
  { "dimension": "Quality", "value": 92 },
  { "dimension": "Cost", "value": 78 },
  { "dimension": "Reliability", "value": 88 }
]
```

## Integration with Graphics Kit

This MCP server is particularly useful for:

1. **Data Visualization Components** - Generate charts for Svelte components
2. **Dashboard Development** - Create interactive dashboards
3. **Report Generation** - Automated chart creation for reports
4. **Prototyping** - Quick visualization mockups
5. **Data Analysis** - Exploratory data visualization

## Advanced Features

### Environment Variables

You can customize the server behavior:

- `VIS_REQUEST_SERVER` - Custom chart generation service URL
- `SERVICE_ID` - Service identifier for records
- `DISABLED_TOOLS` - Comma-separated list of tools to disable

### Private Deployment

For private deployment, you can use your own GPT-Vis-SSR service:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"],
      "env": {
        "VIS_REQUEST_SERVER": "https://your-server.com/api/chart"
      }
    }
  }
}
```

## Troubleshooting

1. **MCP Server Not Found**: Ensure the package is installed globally
2. **Connection Issues**: Restart Cursor after configuration changes
3. **Chart Generation Fails**: Check your data format matches expected schema
4. **Performance Issues**: Consider disabling unused tools via `DISABLED_TOOLS`

## Next Steps

1. Try generating different chart types with your data
2. Integrate generated charts into Svelte components
3. Create reusable chart components for the graphics kit
4. Experiment with advanced visualizations like network graphs and mind maps

## Resources

- [AntV MCP Server Chart Repository](https://github.com/antvis/mcp-server-chart)
- [AntV Documentation](https://antv.vision/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
