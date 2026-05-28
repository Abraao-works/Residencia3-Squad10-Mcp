import {logger} from './logger.js';



export async function executeTool<TArgs, TResult>(
  toolName: string,
  args: TArgs,
  handler: () => Promise<TResult>,
): Promise<TResult> {

  const start = performance.now();

  try {
    const TIMEZONE = process.env['TZ'] ?? 'America/Sao_Paulo';

    const result = await handler();

    const durationMs = Math.round(performance.now() - start);

    logger.info({
      timestamp: new Date().toLocaleString('sv-SE', {timeZone: TIMEZONE}),
      tool: toolName,
      arguments: args,
      success: true,
      durationMs,
    });

    return result;

  } catch (error: any) {

    const durationMs = Math.round(performance.now() - start);

    logger.error({
      timestamp: new Date().toISOString(),
      tool: toolName,
      success: false,
      durationMs,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });

    throw error;
  }
}