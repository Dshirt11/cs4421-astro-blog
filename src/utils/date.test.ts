import { describe, expect, it } from 'vitest';
import { formatDate } from './date';

describe('formatDate', () => {
	it('formats a date with an abbreviated month', () => {
		expect(formatDate(new Date('2026-09-29T12:00:00.000Z'))).toBe('Sep 29, 2026');
	});

	it('formats leap days correctly', () => {
		expect(formatDate(new Date('2024-02-29T12:00:00.000Z'))).toBe('Feb 29, 2024');
	});

	it('uses UTC when the local date differs from the UTC date', () => {
		expect(formatDate(new Date('2026-01-01T00:30:00+02:00'))).toBe('Dec 31, 2025');
	});
});