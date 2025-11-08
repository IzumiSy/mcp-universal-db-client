# MCP Universal DB Client

> 🚀 Execute SQL queries on any database through MCP

[![NPM Version](https://img.shields.io/npm/v/%40izumisy%2Fmcp-universal-db-client)](https://www.npmjs.com/package/@izumisy/mcp-universal-db-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Model Context Protocol (MCP) server for connecting to and querying multiple databases (PostgreSQL, MySQL, SQLite).

<a href="https://glama.ai/mcp/servers/@IzumiSy/mcp-universal-db-client">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@IzumiSy/mcp-universal-db-client/badge" alt="Universal DB Client MCP server" />
</a>

## Features

- 🔌 Support for multiple database types (PostgreSQL, MySQL, SQLite)
- 🔄 Manage multiple concurrent database connections
- 🔒 Separate read and write operations for better security
- 🛡️ SQL query validation to prevent unintended destructive operations
- 💾 Connection pooling and managementsal DB Client

## Supported Databases

- **PostgreSQL** (`psql`)
- **MySQL** (`mysql`)
- **SQLite** (`sqlite`)

## Configuration

Add the server to your MCP settings configuration file:

```json
{
  "mcpServers": {
    "universal-db-client": {
      "command": "npx",
      "args": ["-y", "@izumisy/mcp-universal-db-client"]
    }
  }
}
```

## Available Tools

### Database Connection Management

#### `connect_database`

Connect to a database using a connection string.

**Parameters:**
- `name`: Unique name for this connection (used as connection ID)
- `dialect`: Database type (`psql`, `mysql`, or `sqlite`)
- `connectionString`: Connection string for the database

**Example:**
```json
{
  "name": "my-postgres-db",
  "dialect": "psql",
  "connectionString": "postgresql://user:password@localhost:5432/mydb"
}
```

#### `list_connections`

List all active database connections.

**Returns:** Array of active connections with their IDs, dialects, and connection times

#### `disconnect_database`

Disconnect a specific database connection.

**Parameters:**
- `connectionID`: The connection ID to disconnect

#### `disconnect_all`

Disconnect all active database connections.

### Query Execution

#### `query_read` - Read-Only Queries

Run SELECT and other read-only SQL queries safely.

**Supported Operations:**
- `SELECT` - Query data
- `SHOW` - Show database information
- `DESCRIBE` / `DESC` - Describe table structure
- `EXPLAIN` - Explain query execution plan

**Parameters:**
- `connectionID`: The connection ID (connection name)
- `query`: Array of SQL query strings (read-only operations only)

**Example:**
```json
{
  "connectionID": "my-postgres-db",
  "query": [
    "SELECT * FROM users WHERE id = 1",
    "SELECT COUNT(*) FROM orders WHERE status = 'pending'"
  ]
}
```

**Security:** This tool validates queries and **rejects destructive operations**, making it safe for read-only access. If a destructive query is detected, it returns an error message suggesting to use `query_write` instead.

#### `query_write` - Destructive Queries ⚠️

Run INSERT, UPDATE, DELETE and other data-modifying queries.

**Supported Operations:**
- `INSERT` - Insert new data
- `UPDATE` - Update existing data
- `DELETE` - Delete data
- `CREATE` / `ALTER` / `DROP` - DDL operations
- `TRUNCATE` - Truncate table
- `REPLACE` / `MERGE` - Replace/merge data

**Parameters:**
- `connectionID`: The connection ID (connection name)
- `query`: Array of SQL query strings (any operation)

**Example:**
```json
{
  "connectionID": "my-postgres-db",
  "query": [
    "INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com')",
    "UPDATE orders SET status = 'completed' WHERE id = 123"
  ]
}
```

**Security:** Use with caution as this tool can modify data. Should be restricted to authorized users only.

## License

MIT