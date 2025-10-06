import { PostgresDialect, MysqlDialect, SqliteDialect, Kysely } from "kysely";
import { createPool } from "mysql2";
import { Pool } from "pg";
import z from "zod";
import SQLite from "better-sqlite3";

export const dialectsSchema = z
  .enum(["psql", "mysql", "sqlite"])
  .describe("The available database dialect (available: psql, mysql, sqlite)");

export const connectDatabaseInputSchema = z.object({
  dialect: dialectsSchema,
  connectionString: z
    .string()
    .describe(
      "The database connection string. e.g., postgresql://user:password@localhost:5432/dbname"
    ),
});

type ConnectDatabaseInput = z.infer<typeof connectDatabaseInputSchema>;

export const createDialect = (input: ConnectDatabaseInput) => {
  switch (input.dialect) {
    case "psql":
      return new PostgresDialect({
        pool: new Pool({
          connectionString: input.connectionString,
        }),
      });
    case "mysql":
      return new MysqlDialect({
        pool: createPool({
          uri: input.connectionString,
        }),
      });
    case "sqlite":
      return new SqliteDialect({
        database: new SQLite(input.connectionString),
      });
    default:
      throw new Error(`Unsupported dialect: ${input.dialect}`);
  }
};

type Connection = {
  instance: Kysely<any>;
  dialect: z.infer<typeof dialectsSchema>;
  connectedAt: Date;
};

/*
 * Manages multiple database connections identified by unique IDs.
 */
export class DatabaseConnections {
  private connections = new Map<string, Connection>();

  /**
   * Add a new database connection and store it with a unique ID.
   */
  public addConnection(input: ConnectDatabaseInput) {
    const id = crypto.randomUUID();
    this.connections.set(id, {
      instance: new Kysely({
        dialect: createDialect(input),
      }),
      dialect: input.dialect,
      connectedAt: new Date(),
    });

    return id;
  }

  /**
   * Retrieve a connection by its ID.
   */
  public getConnection(id: string) {
    return this.connections.get(id);
  }

  /**
   * Delete a connection by its ID and close the connection.
   */
  public deleteConnection(id: string) {
    const conn = this.connections.get(id);
    if (conn) {
      conn.instance.destroy();
      this.connections.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Get all connections with their IDs, dialects, and connection times.
   */
  public getAllConnections() {
    return Array.from(this.connections.entries()).map(
      ([connectionID, conn]) => ({
        connectionID,
        dialect: conn.dialect,
        connectedAt: conn.connectedAt,
      })
    );
  }

  /**
   * Close all connections and clear the map.
   */
  public async deleteAllConnections() {
    for (const [id, conn] of this.connections.entries()) {
      await conn.instance.destroy();
      this.connections.delete(id);
    }
  }
}
