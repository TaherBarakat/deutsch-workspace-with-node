import { Quote } from 'lucide-react';
import { SpeakButton } from '../ui/SpeakButton.jsx';

export function ExampleBlock({ example, compact = false }) {
  if (!example || (!example.de && !example.en)) return null;

  return (
    <blockquote className={compact ? 'example-block example-block--compact' : 'example-block'}>
      <Quote size={15} aria-hidden="true" />
      <div className="example-block__copy">
        {example.de ? <p className="example-block__de">{example.de}</p> : null}
        {example.en ? <p className="example-block__en">{example.en}</p> : null}
      </div>
      {example.de ? (
        <SpeakButton
          text={example.de}
          label="Listen to the example"
          size="sm"
          className="example-block__speak"
        />
      ) : null}
    </blockquote>
  );
}
