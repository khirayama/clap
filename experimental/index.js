const iFrame = document.querySelector('iframe');
const input = document.querySelector('input');
const paper = document.querySelector('div');

iFrame.contentWindow.document.body.innerHTML = '<div contenteditable>test</div>';
const div = iFrame.contentWindow.document.querySelector('div');
div.addEventListener('keyup', () => {
  console.log(div.innerHTML);
});

input.addEventListener('keyup', () => {
  console.log(input.value);
});
