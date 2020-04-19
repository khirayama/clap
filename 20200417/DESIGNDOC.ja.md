## olot(Out-Line Operational Transformation) Design Doc 

### Objective

アウトラインエディタを想定したドキュメントのデータ構造およびその更新方法として操作変換を利用したライブラリである。

### Background

### High Level Structure

- Node
  - DocumentNode
  - ItemNode
    - ParagraphNode
    - HorizontalRuleNode
- nodeMap: nodeをtypeからclassを引けるMap
- Inline
  - InlineText
  - InlineLink
- inlineMap: inlineをtypeからclassを引けるMap
- Selection
- Traversal: NodeやInlineを探す。
- Transformation: Nodeの構造を変更する。OperationalTransformationからのみ使用できる。
- OperationalTransformation: Transformationを使用するための操作方法生成。Selectionから生成する。
- Editor

### Core Classes

### Flows

### Progress

- [x] Node
- [x] DocumentNode
- [x] ParagraphNode
- [x] HorizontalRuleNode
- [x] nodeMap
- [x] Inline
- [x] InlineText
- [ ] InlineLink
- [x] inlineMap
- [x] Selection
- [ ] Traversal
- [ ] Transformation
- [ ] OperationalTransformation
- [ ] Editor
