## olot(Out-Line Operational Transformation) Design Doc 

### Objective

アウトラインエディタを想定したドキュメントのデータ構造およびその更新方法として操作変換を利用したライブラリである。

### Background

### High Level Structure

#### Data Structures

- Node
  - DocumentNode
  - ItemNode
    - ParagraphNode
    - HorizontalRuleNode
- Inline
  - InlineText
  - InlineLink
- nodeMap
- inlineMap
- Selection

### Algorithm

- Traversal
- Transformation
- OperationalTransformation

### Core Classes

### Flows
