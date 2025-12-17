function string (Colour) {
  return `\x1b[${Colour}m `
}

function str (Colour, Str) {
  return `${string(Colour)}${Str}${string(0)}`
}

function print (Colour, Str) {
  return console.log(str(Colour, Str))
}

const red = 31
const green = 32
const orange = 33
const purple = 35
const darkGreen = 36

export default {
    string,
    str,
    print,
    red,
    green,
    orange,
    purple,
    darkGreen,
}