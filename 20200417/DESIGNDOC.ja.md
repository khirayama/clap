## olot(Out-Line Operational Transformation) Design Doc 

### Objective

アウトラインエディタを想定したドキュメントのデータ構造およびその更新方法として操作変換を利用したライブラリである。

### Background

### High Level Structure

- Node
  - DocumentNode
  - ItemNode
    - TextItemNode
      - ParagraphNode
    - NontextItemNode
      - HorizontalNode
  - InlineNode
    - TextNode
    - LinkNode
- Selection
- Traversal
- Transformation

### Core Classes

### Flows
