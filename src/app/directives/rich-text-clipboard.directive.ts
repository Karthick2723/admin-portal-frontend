import { Directive, ElementRef, HostListener, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Directive({
  selector: '[appRichTextClipboard]'
})
export class RichTextClipboardDirective {

  constructor(public sanitizer: DomSanitizer, private el: ElementRef) {}

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    if (clipboardData) {
      let pastedHtml = clipboardData.getData('text/html');
      const pastedText = clipboardData.getData('text/plain');

      if (pastedHtml) {
        // Remove all <img> tags from the pasted HTML
        pastedHtml = this.removeImagesFromHtml(pastedHtml);

        // Wrap the sanitized HTML in a span with the default font family
        const sanitizedHtml = this.sanitizeHtml(pastedHtml);
        const wrappedHtml = `<span style="font-family: 'Work Sans';">${sanitizedHtml}</span>`;
        document.execCommand('insertHTML', false, wrappedHtml);
      } else {
        const sanitizedText = this.sanitizer.sanitize(SecurityContext.HTML, pastedText);
        const wrappedText = `<span style="font-family: 'Work Sans';">${sanitizedText}</span>`;
        document.execCommand('insertHTML', false, wrappedText);
      }
    }
  }

  private removeImagesFromHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove all <img> elements
    const images = tempDiv.getElementsByTagName('img');
    while (images.length > 0) {
      images[0].parentNode?.removeChild(images[0]);
    }

    return tempDiv.innerHTML;
  }

  private sanitizeHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Traverse through the elements and sanitize styles
    this.traverseAndSanitize(tempDiv);

    return tempDiv.innerHTML;
  }

  private traverseAndSanitize(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      // Remove all styles except font-size, and add the default font family
      const allowedStyles = ['font-size'];
      if (element.style) {
        const stylesToKeep = allowedStyles.map(style => {
          const value = element.style.getPropertyValue(style);
          return value ? `${style}: ${value};` : '';
        }).join(' ');
        element.setAttribute('style', `${stylesToKeep} font-family: 'Work Sans';`);
      }

      // Recursively sanitize child nodes
      element.childNodes.forEach(childNode => this.traverseAndSanitize(childNode));
    }
  }
}
