const generateRandomKoreanPhoneNumber = () => {
    let phoneNumber = "010";
  
    phoneNumber += Math.floor(Math.random() * 9) + 1;

    for (let i = 0; i < 7; i++) {
        phoneNumber += Math.floor(Math.random() * 10);
    }
  
    return phoneNumber;
}
  
module.exports = {
    generateRandomKoreanPhoneNumber: generateRandomKoreanPhoneNumber
};