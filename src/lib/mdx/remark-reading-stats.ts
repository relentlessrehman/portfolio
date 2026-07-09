import { visit } from 'unist-util-visit'
import type { Node, Parent } from 'unist'

const WORDS_PER_MINUTE = 200

interface ValueNode extends Node {
  value?: unknown
}

function literalProperty(name: string, value: number) {
  return {
    type: 'Property',
    kind: 'init',
    method: false,
    shorthand: false,
    computed: false,
    key: { type: 'Identifier', name },
    value: { type: 'Literal', value },
  }
}

/**
 * Counts words in an MDX document at build time and injects
 * `export const readingStats = { words, minutes }` so pages get
 * reading metadata with zero runtime cost.
 */
export function remarkReadingStats() {
  return (tree: Parent) => {
    let words = 0
    visit(tree, ['text', 'code', 'inlineCode'], (node) => {
      words += String((node as ValueNode).value ?? '')
        .split(/\s+/)
        .filter(Boolean).length
    })
    const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

    tree.children.push({
      type: 'mdxjsEsm',
      value: '',
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExportNamedDeclaration',
              specifiers: [],
              declaration: {
                type: 'VariableDeclaration',
                kind: 'const',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'readingStats' },
                    init: {
                      type: 'ObjectExpression',
                      properties: [
                        literalProperty('words', words),
                        literalProperty('minutes', minutes),
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    } as unknown as Node)
  }
}
