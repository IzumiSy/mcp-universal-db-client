import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v3";
import { connectDatabaseInputSchema, DatabaseConnections } from "./connection";
import { sql } from "kysely";
import { analyzeQueryType } from "./analyzer";
import { makeError, makeSuccess } from "./response";

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
  "query_read",
  {
    title: "Run Read-Only SQL Query",
    description:
      "Run SELECT and other read-only SQL queries on the connected database. This tool only accepts non-destructive queries (SELECT, SHOW, DESCRIBE, EXPLAIN).",
    inputSchema: {
      connectionID: z.string().describe("The connection ID"),
      query: z
        .string()
        .array()
        .describe("The SQL queries to execute (read-only operations only)"),
    },
  },
  async (input) => {
    try {
      const connection = databaseConnections.getConnection(input.connectionID);
      const results = await executeQueries(connection, input.query, {
        readonly: true,
      });

      return makeSuccess(
        results,
        "Rows are the results of the structured query results, so show them in a table format if possible."
      );
    } catch (error) {
      return makeError(error);
    }
  }
);

mcpServer.registerTool(
  "query_write",
  {
    title: "Run Destructive SQL Query",
    description:
      "Run INSERT, UPDATE, DELETE and other destructive SQL queries on the connected database. Use with caution as this can modify data.",
    inputSchema: {
      connectionID: z.string().describe("The connection ID"),
      query: z
        .string()
        .array()
        .describe("The SQL queries to execute (INSERT, UPDATE, DELETE, etc.)"),
    },
  },
  async (input) => {
    try {
      const connection = databaseConnections.getConnection(input.connectionID);
      const results = await executeQueries(connection, input.query);
      return makeSuccess(results, "Query executed successfully.");
    } catch (error) {
      return makeError(error);
    }
  }
);

/**
 * クエリを実行するヘルパー関数
 */
const executeQueries = async (
  connection: ReturnType<typeof databaseConnections.getConnection>,
  queries: string[],
  options?: {
    readonly?: boolean;
  }
) => {
  const results = [];

  for (const query of queries) {
    // 読み取り専用検証（オプション）
    if (options?.readonly) {
      const queryType = analyzeQueryType(query);
      if (queryType !== "read") {
        throw new Error(
          `Destructive query detected. Use query_write instead.\nQuery: ${query}`
        );
      }
    }

    // クエリ実行
    const q = sql.raw(query).compile(connection!.instance);
    const result = await connection!.instance.executeQuery(q);
    results.push({ query, res: result });
  }

  return results;
};

const main = async () => {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
