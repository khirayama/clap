import { ComponentPool } from './ComponentPool';
import { Paragraph } from './items/Paragraph';
import { HorizontalRule } from './items/HorizontalRule';

export { Editor } from './Editor';
export { ComponentPool } from './ComponentPool';
export { Item } from './Item';
export { KeyBinder } from './KeyBinder';
export { Paragraph } from './items/Paragraph';
export { HorizontalRule } from './items/HorizontalRule';
export { Contents } from './Contents';

ComponentPool.register('paragraph', Paragraph);
ComponentPool.register('horizontal-rule', HorizontalRule);
