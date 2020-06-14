import Quill from 'quill';

window.addEventListener('DOMContentLoaded', () => {
  const quill = new Quill('#editor', {
    theme: 'snow',
  });

  quill.on('editor-change', (eventType: string, delta: any) => {
    console.log('--- event ---');
    const contents = quill.getContents();
    const text = quill.getText();
    console.log(contents, text);
    console.log(eventType, delta);
  });
});
