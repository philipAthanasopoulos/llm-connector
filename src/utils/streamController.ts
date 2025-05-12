/**
 * Converts a stream that yields strings in chunks into a stream yielding one character at a time
 * based on given output speed.
 * 
 * @param stream raw async iterable stream of strings.
 * @param outputSpeed speed in milliseconds to stream response
 */
const streamToCharacters = async function* (
	stream: AsyncGenerator<string>,
	outputSpeed: number
): AsyncGenerator<string> {
	for await (const chunk of stream) {
		for (const char of chunk) {
			yield char;
			await new Promise((resolve) => setTimeout(resolve, outputSpeed));
		}
	}
};

/**
 * Yields string in chunks based on given output speed.
 * 
 * @param stream raw async iterable stream of strings.
 * @param outputSpeed speed in milliseconds to stream response
 */
const streamToChunk = async function* (
	stream: AsyncGenerator<string>,
	outputSpeed: number
): AsyncGenerator<string> {
	for await (const chunk of stream) {
		yield chunk;
		await new Promise((resolve) => setTimeout(resolve, outputSpeed));
	}
};

/**
 * Formats a raw stream according to the specified mode.
 *
 * @param stream raw async iterable stream of strings.
 * @param outputType 'character' for per-character output, 'chunk' for as-is.
 * @param outputSpeed speed in milliseconds to stream response
 */
const formatStream = async function* (
	stream: AsyncGenerator<string>,
	outputType: 'chunk' | 'character' | 'full',
	outputSpeed: number
): AsyncGenerator<string> {
	if (outputType === 'character') {
		yield* streamToCharacters(stream, outputSpeed);
	} else {
		yield* streamToChunk(stream, outputSpeed);
	}
};

export { formatStream };
