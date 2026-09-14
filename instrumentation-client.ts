/**
 * Next.js 16 + React 19 can throw in development when Flight records a
 * cancelled/notFound() render: Performance.measure('BlogDetailPage', …)
 * with a negative timestamp. Production is unaffected.
 */
if (process.env.NODE_ENV === "development" && typeof performance !== "undefined") {
  const originalMeasure = performance.measure.bind(performance);
  performance.measure = ((
    ...args: Parameters<typeof performance.measure>
  ) => {
    try {
      return originalMeasure(...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("negative time stamp")) {
        return undefined as unknown as PerformanceMeasure;
      }
      throw error;
    }
  }) as typeof performance.measure;
}
