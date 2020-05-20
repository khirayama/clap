export type Decoration = 'bold' | 'italic' | 'code' | 'strike';

export type InlineText = {
  id: string;
  type: 'text';
  text: string[];
  parent: string | null;
  marks: Decoration[];
};

export type Inline = InlineText;
