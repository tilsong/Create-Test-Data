const randomName = require('./generateRandomKoreanName');
const randomPhoneNumber = require('./generateRandomKoreanPhoneNumber');
const randomEmail = require('./generateRandomEmail');
const randomNickname = require('./generateRandomNickname');
const generateRandomRegionId= require('./generateRandomRegionId');

const makeUserInsertSQL = async (seq, schema) => {
  try {
    const userId = randomNickname.generateRandomNickname(seq);
    // 비밀번호 "1234567890"에 대한 bcrypt를 이용한 해시 값. 테스트에 중요하지 않으므로 동일하게 적용
    const password = "$2a$10$F04804igbywtTuZALAaZx.pmJmx3H2Zq4VvCQbcZfl2ezDKL6r02K"; 
    const nickname = userId; // crawling data
    const email = randomEmail.generateRandomEmail(userId);
    const name = randomName.generateRandomKoreanName();
    const phoneNumber = randomPhoneNumber.generateRandomKoreanPhoneNumber();
    const regionId = generateRandomRegionId.generateRandomRegionId();
    const now  = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const userSql = `INSERT INTO ${schema}.users (id, password, name, nickname, phone_number, user_status, region_id, reward, email, created_time, updated_time, withdrawal_date) VALUES ('${userId}', '${password}', '${name}', '${nickname}', '${phoneNumber}', 'JOINED', ${regionId}, 10, '${email}', '${now}', '${now}', null); `;
    
    return [userId, userSql];
  } catch (e) {
    console.error("e: ", e);
  }
}

module.exports = {
  makeUserInsertSQL: makeUserInsertSQL
};