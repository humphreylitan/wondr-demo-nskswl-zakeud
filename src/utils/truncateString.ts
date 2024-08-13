export function truncateString(str: string, maxLength: number) {
	if (str.length <= maxLength) return str;

	// Find the last space or punctuation before the maxLength
	const truncated = str.slice(0, maxLength + 1).trim();
	const lastSpaceIndex = truncated.lastIndexOf(' ');

	// Truncate at the last space or punctuation
	if (lastSpaceIndex > 0) {
		return truncated.slice(0, lastSpaceIndex) + '...';
	}

	// If no space was found, truncate at the maxLength
	return truncated.slice(0, maxLength) + '...';
}
