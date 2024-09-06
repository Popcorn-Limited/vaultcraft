export default function HtmlRenderer({ htmlContent }: { htmlContent: string }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}