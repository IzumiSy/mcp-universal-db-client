# MCP Universal DB Client

Model Context Protocol (MCP) server for connecting to and querying multiple databases (PostgreSQL, MySQL, SQLite).

## Features

- 🔌 Support for multiple database types (PostgreSQL, MySQL, SQLite)
- 🔄 Manage multiple concurrent database connections
- 🚀 Execute SQL queries through MCP tools
- 💾 Connection pooling and management

## Supported Databases

- **PostgreSQL** (`psql`)
- **MySQL** (`mysql`)
- **SQLite** (`sqlite`)

## Usage

### MCP Configuration

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

### Available Tools

#### 1. `connect_database`

Connect to a database using a connection string.

**Parameters:**
- `dialect`: Database type (`psql`, `mysql`, or `sqlite`)
- `connectionString`: Connection string for the database

**Example:**
```typescript
{
  "dialect": "psql",
  "connectionString": "postgresql://user:password@localhost:5432/mydb"
}
```

**Returns:** Connection ID for use in subsequent queries

#### 2. `list_connections`

List all active database connections.

**Returns:** Array of active connections with their IDs, dialects, and connection times

#### 3. `run_query`

Execute SQL queries on a connected database.

**Parameters:**
- `connectionID`: The connection ID returned from `connect_database`
- `query`: Array of SQL query strings to execute

**Example:**
```typescript
{
  "connectionID": "abc-123-def-456",
  "query": ["SELECT * FROM users WHERE id = 1", "SELECT COUNT(*) FROM orders"]
}
```

#### 4. `disconnect_database`

Disconnect a specific database connection.

**Parameters:**
- `connectionID`: The connection ID to disconnect

#### 5. `disconnect_all`

Disconnect all active database connections.

## License

MIT
