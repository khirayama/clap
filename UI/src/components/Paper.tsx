import * as React from 'react';

import { BoardHandler } from 'olot';

import { Line } from './Line';

type PaperProps = {
  userId: string;
  boardHandler: BoardHandler;
};

export function Paper(props: PaperProps): JSX.Element {
  const [doc, setDoc] = React.useState(props.boardHandler.data.document);

  props.boardHandler.on((boardHandler: BoardHandler) => {
    setDoc(boardHandler.data.document);
  });

  return (
    <div>
      {doc.items.map((item) => {
        return <Line key={item.id} item={item} />;
      })}
    </div>
  );
}
