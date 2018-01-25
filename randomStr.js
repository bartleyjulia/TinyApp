const letters = 'abcdefghijklmnopqrstuvwxyz';
const alphabet = `${letters + letters.toUpperCase()}0123456789`;
  function generateRandomString() {
    let output = '';
    for (let i = 0; i < 6; i++) {
      output += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return output;
  }
console.log(generateRandomString());