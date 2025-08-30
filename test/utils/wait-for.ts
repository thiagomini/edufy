export async function waitFor(
  callback: () => void | Promise<void>,
  {
    timeout = 2000, // max ms to wait
    interval = 50, // ms between retries
    onTimeout,
  }: {
    timeout?: number;
    interval?: number;
    onTimeout?: (error: Error) => void;
  } = {},
): Promise<void> {
  const startTime = Date.now();
  let lastError: Error | null = null;

  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        await callback();
        resolve();
        return;
      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      if (Date.now() - startTime >= timeout) {
        lastError ??= new Error(
          'waitFor: timed out after ' + timeout.toString() + 'ms',
        );
        if (onTimeout) {
          onTimeout(lastError);
        }
        reject(lastError);
        return;
      }
      setTimeout(() => {
        void check();
      }, interval);
    };

    void check();
  });
}
