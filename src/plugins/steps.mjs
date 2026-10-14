// Sätteri hast plugin: turns numbered sections ("## 1. Start a server") into flight-path steps. Each <h2> that
// starts with "N. " and everything up to the next <h2> is wrapped in <section class="pk-step" data-step="N">.
// The heading keeps its text (so ids, the table of contents and search keep the number); the "N. " prefix goes
// into a span that theme.css hides visually because the kite marker shows the number.
const STEP = /^(\d+)\.\s+/;

export const stepsPlugin = {
	name: 'patchkite-steps',
	before(root, ctx) {
		const children = [];
		let section = null;
		let changed = false;
		for (const node of root.children) {
			if (node.type === 'element' && node.tagName === 'h2') {
				const [first, ...rest] = node.children;
				const match = first?.type === 'text' && first.value.match(STEP);
				if (match) {
					changed = true;
					const heading = {
						...node,
						children: [
							{ type: 'element', tagName: 'span', properties: { className: ['pk-step-n'] }, children: [{ type: 'text', value: match[0] }] },
							{ type: 'text', value: first.value.slice(match[0].length) },
							...rest,
						],
					};
					section = { type: 'element', tagName: 'section', properties: { className: ['pk-step'], dataStep: match[1] }, children: [heading] };
					children.push(section);
					continue;
				}
				section = null;
			}
			if (section) section.children.push(node);
			else children.push(node);
		}
		if (changed) ctx.replaceNode(root, { ...root, children });
	},
};
