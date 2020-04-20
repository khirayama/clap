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

### Ref

- [automerge/automerge: A JSON-like data structure (a CRDT) that can be modified concurrently by different users, and merged again automatically.](https://github.com/automerge/automerge)
- [Real Differences between OT and CRDT for Co-Editors](https://arxiv.org/pdf/1810.02137.pdf)
- [Lessons learned from creating a rich-text editor with real-time collaboration](https://ckeditor.com/blog/Lessons-learned-from-creating-a-rich-text-editor-with-real-time-collaboration/)
- [テキストエディタの共同編集機能はどのように実装されているのか - GIGAZINE](https://gigazine.net/news/20181022-text-editor-real-time-collaboration/)
- [Building real-time collaboration applications: OT vs CRDT](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/)
