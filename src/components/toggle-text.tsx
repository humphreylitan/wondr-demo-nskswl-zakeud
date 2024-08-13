import { useState } from 'react';

export function ToggleText({
	collapsedContent,
	expandedContent,
	readMoreLabel = 'Read more',
	showLessLabel = 'Show less',
}) {
	const [expanded, setExpanded] = useState(false);
	return (
		<>
			{expanded ? expandedContent : collapsedContent}{' '}
			<button
				className="font-medium underline hover:no-underline"
				onClick={() => setExpanded(!expanded)}
			>
				{expanded ? showLessLabel : readMoreLabel}
			</button>
		</>
	);
}
