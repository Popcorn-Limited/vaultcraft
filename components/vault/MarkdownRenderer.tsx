import MarkedReact from "marked-react"

function MarkdownRenderer({ content = "" }) {
  const formattedContent = content
    .replace(/---/g, "\n\n---\n")
    .replace(/ {3,}/g, "")

  // Enforce `---` to be in a solo line
  // Remove `   ` large spacing to be null (we asume it's vscode formatting)

  return (
    <MarkedReact
      renderer={{
        hr() {
          return <br />
        },
        link(href, text) {
          return (
            <a
              className="text-customPurple underline"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {text}
            </a>
          )
        },
        heading(children) {
          return <h3 className="font-medium text-lg mb-1">{children}</h3>
        },
      }}
      breaks
      gfm
    >
      {formattedContent}
    </MarkedReact>
  )
}

export default MarkdownRenderer
