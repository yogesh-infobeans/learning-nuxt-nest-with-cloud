import { XmlParserService } from './xml-parser.service';

describe('XmlParserService', () => {
  let service: XmlParserService;

  beforeEach(() => {
    service = new XmlParserService();
  });

  it('parses book XML into HTML and plain text', async () => {
    const xml = `<book>
      <title>Learning Nest</title>
      <chapters>
        <chapter>
          <title>Chapter 1</title>
          <paragraph>First paragraph.</paragraph>
          <paragraph>Second paragraph.</paragraph>
        </chapter>
      </chapters>
    </book>`;

    const result = await service.parseBookXml(xml);

    expect(result.htmlContent).toContain('<h1>Learning Nest</h1>');
    expect(result.htmlContent).toContain('<h2>Chapter 1</h2>');
    expect(result.htmlContent).toContain('<p>First paragraph.</p>');
    expect(result.plainTextContent).toContain('Learning Nest');
    expect(result.plainTextContent).toContain('First paragraph.');
  });

  it('escapes HTML in XML content', async () => {
    const xml = `<book>
      <title>&lt;script&gt;alert(1)&lt;/script&gt;</title>
      <chapter>
        <title>Safe</title>
        <paragraph>Tom &amp; Jerry</paragraph>
      </chapter>
    </book>`;

    const result = await service.parseBookXml(xml);

    expect(result.htmlContent).not.toContain('<script>');
    expect(result.htmlContent).toContain('&lt;script&gt;');
    expect(result.htmlContent).toContain('Tom &amp; Jerry');
  });

  it('uses default chapter title when missing', async () => {
    const xml = `<book>
      <title>Untitled Sections</title>
      <chapter>
        <paragraph>Body text.</paragraph>
      </chapter>
    </book>`;

    const result = await service.parseBookXml(xml);

    expect(result.htmlContent).toContain('<h2>Chapter 1</h2>');
  });

});
