export type TextData = string[];

export const charCodes = {
  NEWLINE: 10,
};

export function textToTextData(text: string): TextData {
  return Array.from(text);
}

export function textDataToDoc(textData: TextData) {
  for (let i = 0; i < textData.length; i += 1) {
    const chara = textData[i];

    if (chara.charCodeAt() === charCodes.NEWLINE) {
      console.log('new Item');
    }
  }
}
