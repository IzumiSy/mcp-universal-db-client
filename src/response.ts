/**
 * エラーレスポンスを作成するヘルパー関数
 */
export const makeError = (error: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: makeErrorText(error),
    },
  ],
  isError: true,
});

const makeErrorText = (e: unknown) => {
  if (e instanceof Error) {
    return `Error: ${e.message}`;
  } else if (typeof e === "string") {
    return `Error: ${e}`;
  } else {
    return "Unknown error";
  }
};

/**
 * 成功レスポンスを作成するヘルパー関数
 */
export const makeSuccess = (
  results: unknown[],
  additionalMessage?: string
) => ({
  content: [
    {
      type: "text" as const,
      text: JSON.stringify({ results }),
    },
    ...(additionalMessage && additionalMessage.length > 0
      ? [
          {
            type: "text" as const,
            text: additionalMessage,
          },
        ]
      : []),
  ],
});
