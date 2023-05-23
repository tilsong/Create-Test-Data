const generateRandomRegionId = () => {
    const min = 10909;
    const max = 11025;
  
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
  
module.exports = {
    generateRandomRegionId: generateRandomRegionId
};