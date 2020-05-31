import * as React from 'react';

import { Inline } from 'olot';

export function Inline(props: { inline: Inline }): JSX.Element {
  return <span>{props.inline.text.join('')}</span>;
}
