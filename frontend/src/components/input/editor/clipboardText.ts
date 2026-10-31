import type {Fragment, Slice, Node as ProseMirrorNode} from '@tiptap/pm/model'

// ProseMirror's default plain text drops list structure, so a copied bullet list pastes
// as bare lines. Writing the markers back out keeps the list readable outside the editor.
export function clipboardTextFromSlice(slice: Slice): string {
	return blocksText(slice.content).join('\n\n')
}

function blocksText(fragment: Fragment): string[] {
	const blocks: string[] = []

	fragment.forEach(node => {
		if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
			blocks.push(listText(node))
		} else if (node.isTextblock) {
			blocks.push(node.textContent)
		} else {
			blocks.push(...blocksText(node.content))
		}
	})

	return blocks
}

function listText(list: ProseMirrorNode): string {
	const ordered = list.type.name === 'orderedList'
	let number = Number(list.attrs.start ?? 1)
	const items: string[] = []

	list.forEach(item => {
		const marker = ordered ? `${number++}. ` : '- '
		const [first, ...rest] = blocksText(item.content).join('\n').split('\n')
		items.push([marker + first, ...rest.map(line => '  ' + line)].join('\n'))
	})

	return items.join('\n')
}
