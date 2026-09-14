type JsonLdScriptProps = {
  content: string;
};

export default function JsonLdScript({ content }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
