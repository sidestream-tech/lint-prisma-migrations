// eslint-disable-next-line prefer-regex-literals, regexp/no-unused-capturing-group
const FOLDER_NAME_PATTERN = new RegExp(/\b(20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{6}_(.*)\b/)

export function isFormatValid(name: string) {
  return FOLDER_NAME_PATTERN.test(name)
}
