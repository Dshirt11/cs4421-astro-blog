import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	const startedAt = performance.now();

	try {
		const response = await next();
		const log = {
			timestamp: new Date().toISOString(),
			level: response.status >= 500 ? 'error' : 'info',
			event: 'http_request',
			method: context.request.method,
			path: context.url.pathname,
			status: response.status,
			durationMs: Math.round(performance.now() - startedAt),
		};

		console.log(JSON.stringify(log));
		return response;
	} catch (error) {
		console.error(
			JSON.stringify({
				timestamp: new Date().toISOString(),
				level: 'error',
				event: 'http_request',
				method: context.request.method,
				path: context.url.pathname,
				status: 500,
				durationMs: Math.round(performance.now() - startedAt),
				error: error instanceof Error ? error.message : String(error),
			}),
		);
		throw error;
	}
});
