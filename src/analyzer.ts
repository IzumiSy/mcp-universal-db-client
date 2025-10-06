import parserPkg from "node-sql-parser";
const { Parser } = parserPkg;

export type QueryType = "read" | "write";

const parser = new Parser();

const WRITE_OPERATIONS = new Set([
  "insert",
  "update",
  "delete",
  "replace",
  "create",
  "alter",
  "drop",
  "truncate",
  "merge",
  "rename",
]);

/**
 * SQLクエリのタイプを分析
 */
export function analyzeQueryType(query: string): QueryType {
  const ast = parser.astify(query);

  // 複数のステートメントの場合は配列
  const statements = Array.isArray(ast) ? ast : [ast];

  for (const stmt of statements) {
    const type = stmt.type?.toLowerCase();

    if (WRITE_OPERATIONS.has(type)) {
      return "write";
    }
  }

  return "read";
}
