import { marked } from 'marked'
import { useMemo } from 'react'

function MarkdownRenderer({ content, className = '' }) {
  const html = useMemo(() => {
    if (!content?.trim()) return '<p style="color:#aaa;font-style:italic">No content yet.</p>'
    return marked(content, { breaks: true, gfm: true })
  }, [content])

  return (
    <div
      className={`prose prose-sm max-w-none text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default MarkdownRenderer