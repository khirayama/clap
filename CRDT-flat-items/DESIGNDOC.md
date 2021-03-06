- RemoteDocumentHandler
  - 通信レイヤーを管理する。remote documentの編集者と考える。
- CRDTBoard
  - Documentの構造を管理する。
  - Automergeを隠蔽する役割を担う。
  - Automerge/usecases/actionsへの参照が可能。
- factory
  - node/inline/selectionのプリミティブな生成を行う。
  - Automerge/traversalへの参照が可能。
- usecases
  - contextとしてuserIdとDocを与える。
  - selection/documentを元にした条件分岐を管理する。
  - factory/transformation/traversalへの参照が可能。
- actions
  - contextとしてuserIdとDocを与える。
  - factory/transformationを扱う。
  - プリミティブな操作はfactory/transformationで行う。
  - factory/transformation/traversalへの参照が可能。
  - 引数もしくは返り値にselectionをdocumentを利用するようなケース。
  - CRDTBoardのchangeの中でのみ呼ばれる。
  - selectionを元にした分のみ受け入れる。ユーザ入力やドキュメントの状態に依存する場合、usecasesで行う。
- transformation
  - contextとしてdocumentを与える。
  - node/inline/selectionのプリミティブな変換を行う。
  - factory/traversalへの参照が可能。
  - selectionを元にした操作は行わない。その場合、actionsで行う。
- traversal
  - contextとしてdocumentを与える。
  - node/inline/selectionの走査を行う。
- structures
  - document
  - item
  - inline
  - selection

- 実装時の注意
  - actionsを実装するとき、必ずSPECへの書き起こしを行う。
  - testcaseはSPECを元に書き起こされる。

## 用語

- document: ドキュメント。selectionを含まない。
- selection: 選択範囲。ユーザのカーソルを表現する。
- board: documentと各ユーザの選択範囲の全てを含んだもの。
