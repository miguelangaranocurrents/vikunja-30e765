import {describe, it, expect} from 'vitest'
import {Editor} from '@tiptap/core'
import {ref} from 'vue'

import {createEditorExtensions, type EditorExtensionDeps} from './editorExtensions'
import {clipboardTextFromSlice} from './clipboardText'

window.API_URL = 'http://localhost:3456'

function textOf(content: string): string {
	const holder = document.createElement('div')
	document.body.appendChild(holder)

	let editor: Editor
	const deps: EditorExtensionDeps = {
		t: key => key,
		isEditing: ref(true),
		isEditEnabled: () => true,
		placeholder: '',
		contentHasChanged: ref(false),
		bubbleSave: () => {},
		getEditor: () => editor,
		uploadCallback: undefined,
		uploadAndInsertFiles: () => {},
	}

	editor = new Editor({element: holder, extensions: createEditorExtensions(deps), content})
	const text = clipboardTextFromSlice(editor.state.doc.slice(0))
	editor.destroy()
	holder.remove()
	return text
}

describe('clipboardTextFromSlice', () => {
	it('writes bullet markers for list items', () => {
		expect(textOf('<ul><li><p>this</p></li><li><p>is</p></li></ul>')).toBe('- this\n- is')
	})

	it('numbers ordered list items', () => {
		expect(textOf('<ol><li><p>one</p></li><li><p>two</p></li></ol>')).toBe('1. one\n2. two')
	})

	it('keeps paragraphs apart from the list around them', () => {
		expect(textOf('<p>start</p><ul><li><p>this</p></li></ul><p>end</p>')).toBe('start\n\n- this\n\nend')
	})

	it('indents nested lists under their parent item', () => {
		expect(textOf('<ul><li><p>outer</p><ul><li><p>inner</p></li></ul></li></ul>')).toBe('- outer\n  - inner')
	})
})
