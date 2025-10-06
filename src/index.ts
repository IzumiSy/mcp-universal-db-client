import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v3";
import { connectDatabaseInputSchema, DatabaseConnections } from "./connection";
import { sql } from "kysely";

const mcpServer = new McpServer({
  name: "mcp-universal-db-client",
  version: "0.0.0",
});

const databaseConnections = new DatabaseConnections();

mcpServer.registerTool(
  "connect_database",
  {
    title: "Connect Database",
    description: "Connect to a database using connection string",
    inputSchema: connectDatabaseInputSchema.shape,
  },
  async (input) => {
    databaseConnections.addConnection(input);

    return {
      content: [
        {
          type: "text",
          text: `Connected to ${input.dialect} database.`,
        },
        {
          type: "text",
          text: `Connection Name: ${input.name} (use this name for future queries)`,
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "list_connections",
  {
    title: "List Connections",
    description: "List all active database connections",
  },
  async () => {
    const connections = databaseConnections.getAllConnections();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            connections: connections,
          }),
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "disconnect_database",
  {
    title: "Disconnect Database",
    description: "Disconnect from a database using connection ID",
    inputSchema: {
      connectionID: z.string().describe("The connection ID to disconnect"),
    },
  },
  async (input) => {
    databaseConnections.deleteConnection(input.connectionID);

    return {
      content: [
        {
          type: "text",
          text: `Disconnected connection ID: ${input.connectionID}`,
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "disconnect_all",
  {
    title: "Disconnect All",
    description: "Disconnect all active database connections",
  },
  async () => {
    await databaseConnections.deleteAllConnections();
    return {
      content: [
        {
          type: "text",
          text: "All connections have been disconnected.",
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "run_query",
  {
    title: "Run SQL Query",
    description: "Run SQL queries on the connected database",
    inputSchema: {
      connectionID: z.string().describe("The connection ID"),
      query: z.string().array().describe("The SQL queries to execute"),
    },
  },
  async (input) => {
    const connection = databaseConnections.getConnection(input.connectionID);
    if (!connection) {
      return {
        content: [
          {
            type: "text",
            text: `No active connection found for ID: ${input.connectionID}`,
          },
        ],
      };
    }

    let results = [];
    for (const query of input.query) {
      const q = sql.raw(query).compile(connection.instance);
      const result = await connection.instance.executeQuery(q);
      results.push({ query, res: result });
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ results }),
        },
      ],
    };
  }
);

const main = async () => {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
