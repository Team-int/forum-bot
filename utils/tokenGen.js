export default function tokenGen(client) {
  let chars = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'q',
    'w',
    'e',
    'r',
    't',
    'y',
    'u',
    'i',
    'o',
    'p',
    'a',
    's',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'z',
    'x',
    'c',
    'v',
    'b',
    'n',
    'm',
    'A',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    'Q',
    'W',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    ''
  ]
  let token = []
  for (var i = 0; i < 100; i++) {
    token.push(chars[Math.floor(Math.random() * chars.length)])
  }
  while (true) {
    if (!client.verifyQueue.find((x) => x.token == token.join(''))) break
    token = []
    for (var i = 0; i < 100; i++) {
      token.push(chars[Math.floor(Math.random() * chars.length)])
    }
  }
  return token.join('')
}