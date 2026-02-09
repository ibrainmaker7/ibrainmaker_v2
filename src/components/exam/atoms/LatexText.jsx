import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function LatexText({ children, block = false, className = '' }) {
  if (!children) return null;

  const text = String(children);

  // 1. Explicit Block Mode
  if (block) {
    const cleanMath = text.replace(/^\$\$|\$\$$/g, '');
    return (
      <div className={`my-4 ${className}`}>
        <BlockMath math={cleanMath} />
      </div>
    );
  }

  // 2. Inline Mode (FORCE SPAN)
  // Replace double $$ with single $ to prevent block behavior
  const inlineText = text.replace(/\$\$/g, '$');

  const processInlineMath = (content) => {
    const inlinePattern = /\$(.*?)\$/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = inlinePattern.exec(content)) !== null) {
      if (lastIndex < match.index) {
        parts.push(content.substring(lastIndex, match.index));
      }

      parts.push(
        <InlineMath key={match.index} math={`\\displaystyle ${match[1]}`} />
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <span className={`inline-block text-gray-900 ${className}`}>
      {processInlineMath(inlineText)}
    </span>
  );
}
