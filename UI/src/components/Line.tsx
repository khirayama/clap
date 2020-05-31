import * as React from 'react';

import { Item, Inline as InlineType } from 'olot';

import { Inline } from './Inline';

export function Line(props: { item: Item }): JSX.Element {
  return (
    <div>
      l:
      {props.item.inline !== null
        ? props.item.inline.map((inline: InlineType) => {
            return <Inline key={inline.id} inline={inline} />;
          })
        : null}
    </div>
  );
}
