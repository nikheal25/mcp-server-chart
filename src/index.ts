#!/usr/bin/env node
import { parseArgs } from "node:util";
import {
  runHTTPStreamableServer,
  runSSEServer,
  runStdioServer,
} from "./server";

// Parse command line arguments
const { values } = parseArgs({
  options: {
    transport: {
      type: "string",
      short: "t",
      default: process.env.TRANSPORT || "stdio",
    },
    port: {
      type: "string", 
      short: "p",
      default: process.env.PORT || "1122",
    },
    endpoint: {
      type: "string",
      short: "e",
      default: "", // We'll handle defaults per transport type
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

// Display help information if requested
if (values.help) {
  console.log(`
MCP Server Chart CLI

Options:
  --transport, -t  Specify the transport protocol: "stdio", "sse", or "streamable" (default: "stdio")
  --port, -p       Specify the port for SSE or streamable transport (default: 1122)
  --endpoint, -e   Specify the endpoint for the transport:
                   - For SSE: default is "/sse"
                   - For streamable: default is "/mcp"
  --help, -h       Show this help message
  `);
  process.exit(0);
}

// Run in the specified transport mode
const transport = values.transport?.toLowerCase() || "stdio";
const port = Number.parseInt(values.port as string, 10);

if (transport === "sse") {
  // Use provided endpoint or default to "/sse" for SSE
  const endpoint = values.endpoint || "/sse";
  console.log(`🚀 Starting MCP Chart Server in SSE mode on port ${port} at ${endpoint}`);
  runSSEServer(endpoint, port).catch(console.error);
} else if (transport === "streamable") {
  // Use provided endpoint or default to "/mcp" for streamable
  const endpoint = values.endpoint || "/mcp";
  console.log(`🚀 Starting MCP Chart Server in streamable mode on port ${port} at ${endpoint}`);
  runHTTPStreamableServer(endpoint, port).catch(console.error);
} else {
  console.log(`🚀 Starting MCP Chart Server in stdio mode`);
  runStdioServer().catch(console.error);
}
