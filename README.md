# MCP Chart Generator

A Model Context Protocol server that generates charts as **local SVG files** with complete privacy and zero external dependencies.

This fork focuses on **local-only chart generation** - your data never leaves your machine, no remote APIs, no tracking.

## 🔥 Key Features

✅ **100% Local Generation**: All charts created as SVG files on your machine  
✅ **Zero External Calls**: No remote APIs, no data uploads, complete privacy  
✅ **All Chart Types**: Column, Line, Pie, Area, Scatter, Radar, Funnel  
✅ **LLM Compatible**: Perfect integration with AI assistants  
✅ **Professional Quality**: Clean, scalable SVG output  
✅ **Instant Results**: Fast generation with file:// URLs  

## 📊 Supported Charts

| Type | Data Format | Example |
|------|-------------|---------|
| **Column** | `{category: 'Q1', value: 100, group: 'Sales'}` | Grouped bar charts |
| **Line** | `{time: 'Jan', value: 22}` | Time series |
| **Pie** | `{category: 'Mobile', value: 45}` | Proportional data |
| **Radar** | `{name: 'Speed', group: 'Car A', value: 85}` | Multi-dimensional |
| **Funnel** | `{category: 'Visitors', value: 10000}` | Conversion flows |

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/mcp-server-chart-1.git
cd mcp-server-chart-1
npm install
npm run build
npm start
```

## 📁 File Output

Charts saved as actual SVG image files:

```text
./generated-charts/
├── column_1703876543210.svg
├── pie_1703876543211.svg
├── line_1703876543212.svg
└── funnel_1703876543213.svg
```

**Format**: Scalable Vector Graphics (SVG)  
**Viewable**: Open in any browser or image viewer  
**Editable**: Customize with CSS or vector graphics tools  

## ⚙️ Configuration

Set output directory:

```bash
export CHART_OUTPUT_DIR=./my-charts
```

## 🐳 Docker

### Build Image

```bash
docker build -t mcp-chart-server .
```

### Run with Different Transports

**Streamable HTTP Transport (Default):**

```bash
docker run -e TRANSPORT=streamable -e PORT=1122 -p 1122:1122 mcp-chart-server
```

**SSE Transport:**

```bash
docker run -e TRANSPORT=sse -e PORT=1123 -p 1123:1123 mcp-chart-server
```

**Stdio Transport:**

```bash
docker run -e TRANSPORT=stdio mcp-chart-server
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TRANSPORT` | `stdio` | Transport type: `stdio`, `sse`, or `streamable` |
| `PORT` | `1122` | Port number for HTTP transports |
| `ENDPOINT` | `/mcp` | Endpoint path for streamable, `/sse` for SSE |

### Test the Server

```bash
# Health check
curl http://localhost:1122/health

# Ping test
curl http://localhost:1122/ping
```

### Remove/Cleanup

**Stop running container:**

```bash
docker ps                           # Find container ID
docker stop <container-id>          # Stop container
```

**Remove container:**

```bash
docker rm <container-id>            # Remove stopped container
```

**Remove image:**

```bash
docker rmi mcp-chart-server         # Remove the image
```

**Full cleanup:**

```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# Remove the image
docker rmi mcp-chart-server

# Clean up system (optional)
docker system prune -f
```

## 🤖 MCP Integration

### Claude/Cursor/VSCode

**Mac/Linux:**

```json
{
  "mcpServers": {
    "chart-generator": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/path/to/mcp-server-chart-1",
      "env": {
        "CHART_OUTPUT_DIR": "./charts"
      }
    }
  }
}
```

**Windows:**

```json
{
  "mcpServers": {
    "chart-generator": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "C:\\path\\to\\mcp-server-chart-1",
      "env": {
        "CHART_OUTPUT_DIR": "./charts"
      }
    }
  }
}
```

## 📈 Example Usage

### Column Chart with Groups

```javascript
{
  "data": [
    {"group": "Revenue", "value": 45000, "category": "Q1"},
    {"group": "Revenue", "value": 52000, "category": "Q2"},
    {"group": "Expenses", "value": 12000, "category": "Q1"},
    {"group": "Expenses", "value": 15000, "category": "Q2"}
  ],
  "title": "Quarterly Performance",
  "axisXTitle": "Quarter",
  "axisYTitle": "Amount ($)"
}
```

### Pie Chart

```javascript
{
  "data": [
    {"value": 45, "category": "Mobile"},
    {"value": 30, "category": "Desktop"},
    {"value": 15, "category": "Tablet"}
  ],
  "title": "Device Usage"
}
```

### Line Chart

```javascript
{
  "data": [
    {"time": "Jan", "value": 22},
    {"time": "Feb", "value": 24},
    {"time": "Mar", "value": 26}
  ],
  "title": "Monthly Temperature",
  "axisXTitle": "Month",
  "axisYTitle": "Temperature (°C)"
}
```

## 🎨 Chart Features

- **Professional Styling**: Clean, modern design
- **Color Schemes**: Carefully chosen palettes
- **Legends**: Automatic generation for grouped data
- **Responsive**: Perfect scaling at any size
- **Accessible**: Semantic SVG markup

## 🔧 Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Run Locally

```bash
npm start
```

## 🛡️ Privacy First

- **No External Dependencies**: Everything runs locally
- **No Data Uploads**: Your data stays on your machine
- **No Tracking**: Zero analytics or telemetry
- **Offline Ready**: Works without internet
- **Complete Control**: You own your data and charts

## 🆚 SVG to PNG Conversion

Convert SVG files to PNG:

```bash
npx ts-node convert-svg-to-png.ts ./generated-charts ./png-output
```

Supports multiple conversion tools:

- `rsvg-convert` (recommended)
- ImageMagick
- Inkscape
- Manual HTML fallback

## 🐛 Troubleshooting

### Charts Not Generating?

- Check directory permissions
- Verify `CHART_OUTPUT_DIR` is writable
- Check console for error messages

### Broken/Empty Charts?

- Ensure data format matches examples
- Verify required fields (`category`, `value`)
- Check that values are numeric

### File Issues?

- Try different output directory
- Check disk space
- Verify file permissions

## 📄 License

MIT License - Feel free to fork, modify, and use as needed.
