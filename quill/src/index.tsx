import Quill from 'quill';

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],

  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['link', 'image', 'video', 'formula'],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],

  ['clean'],
];

function formatContents(contents: any) {
  let text = '';
  for (let i = 0; i < contents.ops.length; i += 1) {
    const op = contents.ops[i];
    text += JSON.stringify(op) + '\n';
  }
  return text;
}

Quill.register('modules/counter', (quill: any, options: any) => {
  console.log(options);
  const container: HTMLDivElement = document.querySelector('#counter');
  quill.on('text-change', () => {
    const text = quill.getText();
    container.innerText = text.split(/\s+/).length;
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      counter: true,
      toolbar: toolbarOptions,
    },
  });

  const editorData: HTMLDivElement = window.document.querySelector('#editor-data');
  editorData.innerText = formatContents(quill.getContents());

  quill.on('editor-change', (eventType: string, delta: any) => {
    editorData.innerText = formatContents(quill.getContents());

    console.log('--- event ---');
    const contents = quill.getContents();
    const text = quill.getText();
    console.log(contents, text);
    console.log(eventType, delta);
  });
});
