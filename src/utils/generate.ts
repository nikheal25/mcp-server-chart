import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Generate a chart URL using local SVG generation only.
 * NO REMOTE UPLOADS - ALL FILES SAVED LOCALLY AS SVG IMAGES
 * @param type The type of chart to generate
 * @param options Chart options
 * @returns {Promise<string>} The generated local SVG file path.
 * @throws {Error} If the chart generation fails.
 */
export async function generateChartUrl(
  type: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  options: Record<string, any>,
): Promise<string> {
  return generateChartSvgLocally(type, options);
}

/**
 * Generate a chart as a local SVG image file
 * @param type Chart type
 * @param options Chart options  
 * @returns Local SVG file path
 */
async function generateChartSvgLocally(type: string, options: Record<string, any>): Promise<string> {
  const outputDir = process.env.CHART_OUTPUT_DIR || './generated-charts';
  
  // Ensure directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${type}_${timestamp}.svg`;
  const filepath = join(outputDir, filename);
  
  try {
    // Generate SVG content based on chart type
    const svgContent = generateSvgContent(type, options);
    
    // Save SVG to file
    writeFileSync(filepath, svgContent);
    
    console.log(`✅ Chart SVG saved locally: ${filepath}`);
    
    // Return file path
    return `file://${resolve(filepath)}`;
    
  } catch (error) {
    console.error('❌ Error generating chart SVG:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Fallback: Save error info to text file
    const errorFilename = `${type}_${timestamp}_error.txt`;
    const errorFilepath = join(outputDir, errorFilename);
    writeFileSync(errorFilepath, `Error generating chart: ${errorMessage}\nOptions: ${JSON.stringify(options, null, 2)}`);
    
    throw new Error(`Failed to generate chart SVG: ${errorMessage}`);
  }
}

/**
 * Generate SVG content for different chart types
 */
function generateSvgContent(type: string, options: any): string {
  const width = options.width || 800;
  const height = options.height || 600;
  const title = options.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`;
  const data = options.data || [];
  
  console.log('🔍 generateSvgContent called with:', { type, title, dataLength: data.length });
  
  let chartElements = '';
  
  switch (type.toLowerCase()) {
    case 'bar':
    case 'column':
      chartElements = generateColumnChart(data, width, height, options);
      break;
    case 'line':
      chartElements = generateLineChart(data, width, height, options);
      break;
    case 'pie':
      chartElements = generatePieChart(data, width, height, options);
      break;
    case 'area':
      chartElements = generateAreaChart(data, width, height, options);
      break;
    case 'scatter':
      chartElements = generateScatterChart(data, width, height, options);
      break;
    case 'radar':
      chartElements = generateRadarChart(data, width, height, options);
      break;
    case 'funnel':
      chartElements = generateFunnelChart(data, width, height, options);
      break;
    default:
      chartElements = generateColumnChart(data, width, height, options);
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .chart-title { font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; text-anchor: middle; fill: #333; }
    .axis-label { font-family: Arial, sans-serif; font-size: 12px; fill: #666; }
    .axis-title { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #333; }
    .chart-bar { stroke: #fff; stroke-width: 1; }
    .chart-line { fill: none; stroke-width: 2; }
    .chart-point { fill: #fff; stroke-width: 2; }
    .chart-area { fill-opacity: 0.3; }
    .axis { stroke: #333; stroke-width: 1; }
    .legend-text { font-family: Arial, sans-serif; font-size: 12px; fill: #333; }
  </style>
  
  <!-- Chart Title -->
  <text x="${width/2}" y="30" class="chart-title">${title}</text>
  
  <!-- Chart Content -->
  ${chartElements}
  
  <!-- Generated locally notice -->
  <text x="10" y="${height-10}" class="axis-label" fill="#888">Generated locally - No remote uploads</text>
</svg>`;
}

function generateColumnChart(data: any[], width: number, height: number, options: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No data available</text>';
  }
  
  console.log('📊 Column chart data:', JSON.stringify(data.slice(0, 3), null, 2));
  
  const chartArea = { x: 80, y: 60, width: width - 140, height: height - 140 };
  
  // Group data by category and group
  // Expected format: [{group: 'Revenue', value: 45000, category: 'Q1'}, ...]
  const groupedData = new Map();
  const categories = new Set();
  const groups = new Set();
  
  data.forEach(item => {
    if (typeof item === 'object' && item.category && item.value !== undefined) {
      const category = String(item.category);
      const group = item.group || 'Series 1';
      const value = Number(item.value);
      
      categories.add(category);
      groups.add(group);
      
      if (!groupedData.has(category)) {
        groupedData.set(category, new Map());
      }
      groupedData.get(category).set(group, value);
    }
  });
  
  const categoryArray = Array.from(categories);
  const groupArray = Array.from(groups);
  const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#9aa0a6', '#ff6d01'];
  
     // Find max value for scaling
   let maxValue = 0;
   groupedData.forEach(categoryMap => {
     categoryMap.forEach((value: number) => {
       maxValue = Math.max(maxValue, value);
     });
   });
  
  if (maxValue === 0) maxValue = 1;
  
  const categoryWidth = chartArea.width / categoryArray.length;
  const barWidth = categoryWidth / (groupArray.length * 1.2); // Space between groups
  
  let bars = '';
  let legend = '';
  
  // Draw bars
  categoryArray.forEach((category, catIndex) => {
    const categoryData = groupedData.get(category);
    if (!categoryData) return;
    
    const categoryX = chartArea.x + catIndex * categoryWidth;
    
    groupArray.forEach((group, groupIndex) => {
      const value = categoryData.get(group) || 0;
      const barHeight = (value / maxValue) * chartArea.height;
      const barX = categoryX + groupIndex * barWidth + (categoryWidth - groupArray.length * barWidth) / 2;
      const barY = chartArea.y + chartArea.height - barHeight;
      
      const color = colors[groupIndex % colors.length];
      
      bars += `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" fill="${color}" class="chart-bar"/>`;
      
      // Value label on top of bar
      if (barHeight > 20) {
        bars += `<text x="${barX + barWidth/2}" y="${barY - 5}" text-anchor="middle" class="axis-label">${value}</text>`;
      }
    });
    
    // Category label
    bars += `<text x="${categoryX + categoryWidth/2}" y="${chartArea.y + chartArea.height + 20}" text-anchor="middle" class="axis-label">${category}</text>`;
  });
  
  // Draw legend if multiple groups
  if (groupArray.length > 1) {
    const legendY = chartArea.y - 30;
    groupArray.forEach((group, index) => {
      const legendX = chartArea.x + index * 120;
      const color = colors[index % colors.length];
      
      legend += `<rect x="${legendX}" y="${legendY}" width="12" height="12" fill="${color}"/>`;
      legend += `<text x="${legendX + 18}" y="${legendY + 9}" class="legend-text">${group}</text>`;
    });
  }
  
  // Axes
  bars += `<line x1="${chartArea.x}" y1="${chartArea.y}" x2="${chartArea.x}" y2="${chartArea.y + chartArea.height}" class="axis"/>`;
  bars += `<line x1="${chartArea.x}" y1="${chartArea.y + chartArea.height}" x2="${chartArea.x + chartArea.width}" y2="${chartArea.y + chartArea.height}" class="axis"/>`;
  
  // Axis titles
  if (options.axisXTitle) {
    bars += `<text x="${chartArea.x + chartArea.width/2}" y="${chartArea.y + chartArea.height + 50}" text-anchor="middle" class="axis-title">${options.axisXTitle}</text>`;
  }
  if (options.axisYTitle) {
    bars += `<text x="30" y="${chartArea.y + chartArea.height/2}" text-anchor="middle" class="axis-title" transform="rotate(-90 30 ${chartArea.y + chartArea.height/2})">${options.axisYTitle}</text>`;
  }
  
  return legend + bars;
}

function generateLineChart(data: any[], width: number, height: number, options: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No data available</text>';
  }
  
  console.log('📈 Line chart data:', JSON.stringify(data.slice(0, 3), null, 2));
  
  const chartArea = { x: 80, y: 60, width: width - 140, height: height - 140 };
  
  // Expected format: [{time: 'Jan', value: 22}, {time: 'Feb', value: 24}, ...]
  const points = data.map(item => {
    if (typeof item === 'object' && item.time !== undefined && item.value !== undefined) {
      return { label: String(item.time), value: Number(item.value) };
    } else if (typeof item === 'object' && item.category !== undefined && item.value !== undefined) {
      return { label: String(item.category), value: Number(item.value) };
    }
    return { label: 'Unknown', value: Number(item) || 0 };
  });
  
  const values = points.map(p => p.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  
  let pathData = '';
  let pointElements = '';
  let labels = '';
  
  points.forEach((point, index) => {
    const x = chartArea.x + (index / Math.max(points.length - 1, 1)) * chartArea.width;
    const y = chartArea.y + chartArea.height - ((point.value - minValue) / range) * chartArea.height;
    
    if (index === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
    
    pointElements += `<circle cx="${x}" cy="${y}" r="4" fill="#4285f4" class="chart-point"/>`;
    
    // Labels
    if (index % Math.ceil(points.length / 8) === 0) { // Show every nth label to avoid crowding
      labels += `<text x="${x}" y="${chartArea.y + chartArea.height + 20}" text-anchor="middle" class="axis-label">${point.label}</text>`;
    }
    
    // Value labels
    labels += `<text x="${x}" y="${y - 10}" text-anchor="middle" class="axis-label" font-size="10">${point.value}</text>`;
  });
  
  let result = `<path d="${pathData}" stroke="#4285f4" class="chart-line"/>`;
  result += pointElements;
  result += labels;
  
  // Axes
  result += `<line x1="${chartArea.x}" y1="${chartArea.y}" x2="${chartArea.x}" y2="${chartArea.y + chartArea.height}" class="axis"/>`;
  result += `<line x1="${chartArea.x}" y1="${chartArea.y + chartArea.height}" x2="${chartArea.x + chartArea.width}" y2="${chartArea.y + chartArea.height}" class="axis"/>`;
  
  // Axis titles
  if (options.axisXTitle) {
    result += `<text x="${chartArea.x + chartArea.width/2}" y="${chartArea.y + chartArea.height + 50}" text-anchor="middle" class="axis-title">${options.axisXTitle}</text>`;
  }
  if (options.axisYTitle) {
    result += `<text x="30" y="${chartArea.y + chartArea.height/2}" text-anchor="middle" class="axis-title" transform="rotate(-90 30 ${chartArea.y + chartArea.height/2})">${options.axisYTitle}</text>`;
  }
  
  return result;
}

function generatePieChart(data: any[], width: number, height: number, options: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No data available</text>';
  }
  
  console.log('🥧 Pie chart data:', JSON.stringify(data.slice(0, 3), null, 2));
  
  const centerX = width / 2;
  const centerY = height / 2 + 20;
  const radius = Math.min(width, height) / 4;
  
  // Expected format: [{value: 45, category: 'Mobile'}, ...]
  const slices = data.map(item => {
    if (typeof item === 'object' && item.category !== undefined && item.value !== undefined) {
      return { label: String(item.category), value: Number(item.value) };
    }
    return { label: 'Unknown', value: Number(item) || 0 };
  });
  
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  
  if (total <= 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No valid data for pie chart</text>';
  }
  
  const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#9aa0a6', '#ff6d01', '#ab47bc', '#26c6da'];
  
  let currentAngle = -Math.PI / 2; // Start at top
  let sliceElements = '';
  let legend = '';
  
  slices.forEach((slice, index) => {
    if (slice.value <= 0) return;
    
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;
    
    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const color = colors[index % colors.length];
    
    sliceElements += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    
    // Percentage label on slice
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);
    const percentage = ((slice.value / total) * 100).toFixed(1);
    
    if (sliceAngle > 0.2) { // Only show label if slice is big enough
      sliceElements += `<text x="${labelX}" y="${labelY}" text-anchor="middle" class="axis-label" fill="white" font-weight="bold">${percentage}%</text>`;
    }
    
    // Legend
    const legendY = centerY - radius + index * 20;
    legend += `<rect x="${centerX + radius + 30}" y="${legendY - 8}" width="12" height="12" fill="${color}"/>`;
    legend += `<text x="${centerX + radius + 48}" y="${legendY + 3}" class="legend-text">${slice.label}: ${slice.value}</text>`;
    
    currentAngle = endAngle;
  });
  
  return sliceElements + legend;
}

function generateAreaChart(data: any[], width: number, height: number, options: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No data available</text>';
  }
  
  const chartArea = { x: 80, y: 60, width: width - 140, height: height - 140 };
  
  // Use same logic as line chart for parsing data
  const points = data.map(item => {
    if (typeof item === 'object' && item.time !== undefined && item.value !== undefined) {
      return { label: String(item.time), value: Number(item.value) };
    } else if (typeof item === 'object' && item.category !== undefined && item.value !== undefined) {
      return { label: String(item.category), value: Number(item.value) };
    }
    return { label: 'Unknown', value: Number(item) || 0 };
  });
  
  const values = points.map(p => p.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  
  let areaPath = `M ${chartArea.x} ${chartArea.y + chartArea.height}`;
  let linePath = '';
  
  points.forEach((point, index) => {
    const x = chartArea.x + (index / Math.max(points.length - 1, 1)) * chartArea.width;
    const y = chartArea.y + chartArea.height - ((point.value - minValue) / range) * chartArea.height;
    
    areaPath += ` L ${x} ${y}`;
    
    if (index === 0) {
      linePath += `M ${x} ${y}`;
    } else {
      linePath += ` L ${x} ${y}`;
    }
  });
  
  areaPath += ` L ${chartArea.x + chartArea.width} ${chartArea.y + chartArea.height} Z`;
  
  let result = `<path d="${areaPath}" fill="#4285f4" class="chart-area"/>`;
  result += `<path d="${linePath}" stroke="#4285f4" class="chart-line"/>`;
  
  // Axes
  result += `<line x1="${chartArea.x}" y1="${chartArea.y}" x2="${chartArea.x}" y2="${chartArea.y + chartArea.height}" class="axis"/>`;
  result += `<line x1="${chartArea.x}" y1="${chartArea.y + chartArea.height}" x2="${chartArea.x + chartArea.width}" y2="${chartArea.y + chartArea.height}" class="axis"/>`;
  
  return result;
}

function generateScatterChart(data: any[], width: number, height: number, options: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No data available</text>';
  }
  
  const chartArea = { x: 80, y: 60, width: width - 140, height: height - 140 };
  
  let points = '';
  
  data.forEach((item, index) => {
    let x, y;
    if (typeof item === 'object' && item.x !== undefined && item.y !== undefined) {
      x = chartArea.x + (Number(item.x) / 100) * chartArea.width;
      y = chartArea.y + chartArea.height - (Number(item.y) / 100) * chartArea.height;
    } else {
      // Random positioning if no x,y coordinates
      x = chartArea.x + (index / data.length) * chartArea.width;
      y = chartArea.y + chartArea.height - (Math.random() * chartArea.height);
    }
    
    points += `<circle cx="${x}" cy="${y}" r="5" fill="#4285f4" class="chart-point"/>`;
  });
  
  // Axes
  points += `<line x1="${chartArea.x}" y1="${chartArea.y}" x2="${chartArea.x}" y2="${chartArea.y + chartArea.height}" class="axis"/>`;
  points += `<line x1="${chartArea.x}" y1="${chartArea.y + chartArea.height}" x2="${chartArea.x + chartArea.width}" y2="${chartArea.y + chartArea.height}" class="axis"/>`;
  
  return points;
}

function generateRadarChart(data: any[], width: number, height: number, options: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No data available</text>';
  }
  
  console.log('🕸️ Radar chart data:', JSON.stringify(data.slice(0, 3), null, 2));
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  // Expected format: [{name: 'Speed', group: 'Car A', value: 85}, ...]
  const groupedData = new Map();
  const dimensions = new Set();
  
  data.forEach(item => {
    if (typeof item === 'object' && item.name && item.group && item.value !== undefined) {
      const name = String(item.name);
      const group = String(item.group);
      const value = Number(item.value);
      
      dimensions.add(name);
      
      if (!groupedData.has(group)) {
        groupedData.set(group, new Map());
      }
      groupedData.get(group).set(name, value);
    }
  });
  
  const dimensionArray = Array.from(dimensions);
  const groupArray = Array.from(groupedData.keys());
  const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853'];
  
  if (dimensionArray.length === 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No valid radar data</text>';
  }
  
  let result = '';
  
  // Draw grid circles
  for (let i = 1; i <= 5; i++) {
    const gridRadius = (radius * i) / 5;
    result += `<circle cx="${centerX}" cy="${centerY}" r="${gridRadius}" fill="none" stroke="#ddd" stroke-width="1"/>`;
  }
  
  // Draw axes and labels
  dimensionArray.forEach((dimension, index) => {
    const angle = (index / dimensionArray.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    result += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#ddd" stroke-width="1"/>`;
    
    const labelX = centerX + (radius + 20) * Math.cos(angle);
    const labelY = centerY + (radius + 20) * Math.sin(angle);
    result += `<text x="${labelX}" y="${labelY}" text-anchor="middle" class="axis-label">${dimension}</text>`;
  });
  
  // Draw data for each group
  groupArray.forEach((group, groupIndex) => {
    const groupData = groupedData.get(group);
    const color = colors[groupIndex % colors.length];
    
    let pathData = '';
    dimensionArray.forEach((dimension, index) => {
      const value = groupData.get(dimension) || 0;
      const normalizedValue = value / 100; // Assume 0-100 scale
      const angle = (index / dimensionArray.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * normalizedValue * Math.cos(angle);
      const y = centerY + radius * normalizedValue * Math.sin(angle);
      
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    });
    pathData += ' Z';
    
    result += `<path d="${pathData}" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2"/>`;
    
    // Legend
    const legendY = 100 + groupIndex * 20;
    result += `<rect x="20" y="${legendY - 8}" width="12" height="12" fill="${color}"/>`;
    result += `<text x="38" y="${legendY + 3}" class="legend-text">${group}</text>`;
  });
  
  return result;
}

function generateFunnelChart(data: any[], width: number, height: number, options: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '<text x="400" y="300" text-anchor="middle" class="axis-label">No data available</text>';
  }
  
  console.log('🔻 Funnel chart data:', JSON.stringify(data.slice(0, 3), null, 2));
  
  const chartArea = { x: 100, y: 80, width: width - 200, height: height - 160 };
  
  // Expected format: [{value: 10000, category: 'Website Visitors'}, ...]
  const stages = data.map(item => {
    if (typeof item === 'object' && item.category !== undefined && item.value !== undefined) {
      return { label: String(item.category), value: Number(item.value) };
    }
    return { label: 'Unknown', value: Number(item) || 0 };
  });
  
  const maxValue = Math.max(...stages.map(s => s.value));
  const stageHeight = chartArea.height / stages.length;
  const colors = ['#4285f4', '#5bb974', '#fbbc04', '#ea4335', '#9aa0a6', '#ff6d01'];
  
  let result = '';
  
  stages.forEach((stage, index) => {
    const widthRatio = stage.value / maxValue;
    const stageWidth = chartArea.width * widthRatio;
    const x = chartArea.x + (chartArea.width - stageWidth) / 2;
    const y = chartArea.y + index * stageHeight;
    
    const color = colors[index % colors.length];
    
    // Draw trapezoid
    if (index === stages.length - 1) {
      // Last stage - rectangle
      result += `<rect x="${x}" y="${y}" width="${stageWidth}" height="${stageHeight - 10}" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    } else {
      // Trapezoid shape
      const nextStage = stages[index + 1];
      const nextWidthRatio = nextStage ? nextStage.value / maxValue : widthRatio * 0.8;
      const nextStageWidth = chartArea.width * nextWidthRatio;
      const nextX = chartArea.x + (chartArea.width - nextStageWidth) / 2;
      
      result += `<polygon points="${x},${y} ${x + stageWidth},${y} ${nextX + nextStageWidth},${y + stageHeight - 10} ${nextX},${y + stageHeight - 10}" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    }
    
    // Label and value
    const labelX = chartArea.x + chartArea.width / 2;
    const labelY = y + stageHeight / 2;
    result += `<text x="${labelX}" y="${labelY - 5}" text-anchor="middle" class="axis-label" fill="white" font-weight="bold">${stage.label}</text>`;
    result += `<text x="${labelX}" y="${labelY + 10}" text-anchor="middle" class="axis-label" fill="white">${stage.value.toLocaleString()}</text>`;
    
    // Conversion rate
    if (index > 0) {
      const conversionRate = ((stage.value / stages[index - 1].value) * 100).toFixed(1);
      result += `<text x="${chartArea.x + chartArea.width + 10}" y="${labelY}" class="axis-label">${conversionRate}%</text>`;
    }
  });
  
  return result;
}

type ResponseResult = {
  metadata: unknown;
  /**
   * @docs https://modelcontextprotocol.io/specification/2025-03-26/server/tools#tool-result
   */
  content: CallToolResult["content"];
  isError?: CallToolResult["isError"];
};

/**
 * Generate a map locally as an SVG image
 * NO REMOTE UPLOADS - ALL FILES SAVED LOCALLY
 * @param tool - The tool name
 * @param input - The input
 * @returns
 */
export async function generateMap(
  tool: string,
  input: unknown,
): Promise<ResponseResult> {
  return generateMapSvgLocally(tool, input);
}

/**
 * Generate a map as a local SVG file
 * @param tool Tool name
 * @param input Input data
 * @returns Response result
 */
async function generateMapSvgLocally(tool: string, input: unknown): Promise<ResponseResult> {
  const outputDir = process.env.CHART_OUTPUT_DIR || './generated-charts';
  
  // Ensure directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate unique filename for map
  const timestamp = Date.now();
  const filename = `${tool}_${timestamp}.svg`;
  const filepath = join(outputDir, filename);
  
  try {
    // Generate simple map SVG
    const width = 800;
    const height = 600;
    
    const mapSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .map-title { font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; text-anchor: middle; }
    .map-area { fill: #e1f5fe; stroke: #01579b; stroke-width: 2; }
    .map-point { fill: #f44336; stroke: #fff; stroke-width: 2; }
    .map-label { font-family: Arial, sans-serif; font-size: 12px; }
  </style>
  
  <!-- Map Title -->
  <text x="${width/2}" y="30" class="map-title">${tool} - Map Visualization</text>
  
  <!-- Simple map outline -->
  <rect x="100" y="80" width="600" height="400" class="map-area"/>
  
  <!-- Sample map points -->
  <circle cx="300" cy="200" r="8" class="map-point"/>
  <text x="315" y="205" class="map-label">Location 1</text>
  
  <circle cx="500" cy="300" r="8" class="map-point"/>
  <text x="515" y="305" class="map-label">Location 2</text>
  
  <!-- Generated locally notice -->
  <text x="10" y="${height-10}" class="map-label" fill="#888">Generated locally - No remote uploads</text>
  
  <!-- Input data as text -->
  <text x="10" y="${height-30}" class="map-label" fill="#666">Input: ${JSON.stringify(input).slice(0, 50)}...</text>
</svg>`;
    
    // Save SVG to file
    writeFileSync(filepath, mapSvg);
    
    console.log(`✅ Map SVG saved locally: ${filepath}`);
    
    const localPath = `file://${resolve(filepath)}`;
    
    return {
      metadata: { tool, input, localPath },
      content: [
        {
          type: "text",
          text: `Map SVG saved locally: ${localPath}`,
        },
      ],
      isError: false,
    };
    
  } catch (error) {
    console.error('❌ Error generating map SVG:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      metadata: { tool, input, error: errorMessage },
      content: [
        {
          type: "text", 
          text: `Error generating map SVG: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
