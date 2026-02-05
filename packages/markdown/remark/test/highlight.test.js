import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMarkdownProcessor } from '../dist/index.js';
import { normalizeLanguage } from '../dist/highlight.js';

describe('highlight', () => {
	it('highlights using shiki by default', async () => {
		const processor = await createMarkdownProcessor();
		const { code } = await processor.render('```js\nconsole.log("Hello, world!");\n```');
		assert.match(code, /background-color:/);
	});

	it('does not highlight math code blocks by default', async () => {
		const processor = await createMarkdownProcessor();
		const { code } = await processor.render('```math\n\\frac{1}{2}\n```');

		assert.ok(!code.includes('background-color:'));
	});

	it('highlights using prism', async () => {
		const processor = await createMarkdownProcessor({
			syntaxHighlight: {
				type: 'prism',
			},
		});
		const { code } = await processor.render('```js\nconsole.log("Hello, world!");\n```');
		assert.ok(code.includes('token'));
	});

	it('supports excludeLangs', async () => {
		const processor = await createMarkdownProcessor({
			syntaxHighlight: {
				type: 'shiki',
				excludeLangs: ['mermaid'],
			},
		});
		const { code } = await processor.render('```mermaid\ngraph TD\nA --> B\n```');

		assert.ok(!code.includes('background-color:'));
	});

	it('supports excludeLangs with prism', async () => {
		const processor = await createMarkdownProcessor({
			syntaxHighlight: {
				type: 'prism',
				excludeLangs: ['mermaid'],
			},
		});
		const { code } = await processor.render('```mermaid\ngraph TD\nA --> B\n```');

		assert.ok(!code.includes('token'));
	});
});

describe('normalizeLanguage', () => {
	it('resolves js to javascript', () => {
		assert.equal(normalizeLanguage('js'), 'javascript');
	});

	it('resolves ts to typescript', () => {
		assert.equal(normalizeLanguage('ts'), 'typescript');
	});

	it('resolves py to python', () => {
		assert.equal(normalizeLanguage('py'), 'python');
	});

	it('resolves rb to ruby', () => {
		assert.equal(normalizeLanguage('rb'), 'ruby');
	});

	it('resolves sh to bash', () => {
		assert.equal(normalizeLanguage('sh'), 'bash');
	});

	it('resolves yml to yaml', () => {
		assert.equal(normalizeLanguage('yml'), 'yaml');
	});

	it('resolves md to markdown', () => {
		assert.equal(normalizeLanguage('md'), 'markdown');
	});

	it('returns non-aliased languages unchanged', () => {
		assert.equal(normalizeLanguage('rust'), 'rust');
		assert.equal(normalizeLanguage('go'), 'go');
		assert.equal(normalizeLanguage('html'), 'html');
	});

	it('is case insensitive', () => {
		assert.equal(normalizeLanguage('JS'), 'javascript');
		assert.equal(normalizeLanguage('TS'), 'typescript');
		assert.equal(normalizeLanguage('Py'), 'python');
	});

	it('trims whitespace', () => {
		assert.equal(normalizeLanguage('  js  '), 'javascript');
		assert.equal(normalizeLanguage('\tts\n'), 'typescript');
	});
});
