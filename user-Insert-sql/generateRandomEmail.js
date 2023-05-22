const hosts = [
    "@gmail.com",
    "@hotmail.com",
    "@yahoo.com",
    "@naver.com"
];

function generateRandomEmail(inputString) {
    let host = hosts[Math.floor(Math.random() * hosts.length)];
    return inputString + host;
}
  
module.exports = {
    generateRandomEmail: generateRandomEmail
};
