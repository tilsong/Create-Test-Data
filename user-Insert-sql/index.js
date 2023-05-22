const randomName = require('./generateRandomKoreanName');
const randomPhoneNumber = require('./generateRandomKoreanPhoneNumber');
const randomEmail = require('./generateRandomEmail');
const randomNickname = require('./generateRandomNickname');
const fs = require('fs');

const makeUserInsertSQL = async (seq) => {
  try {
    const userId = randomNickname.generateRandomNickname(seq);
    // 비밀번호 "1234567890"에 대한 bcrypt를 이용한 해시 값. 테스트에 중요하지 않으므로 동일하게 적용
    const password = "$2a$10$F04804igbywtTuZALAaZx.pmJmx3H2Zq4VvCQbcZfl2ezDKL6r02K"; 
    const nickname = userId; // crawling data
    const email = randomEmail.generateRandomEmail(userId);
    const name = randomName.generateRandomKoreanName();
    const phoneNumber = randomPhoneNumber.generateRandomKoreanPhoneNumber();
    const createdTime  = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    return "('" + userId + "', '" + password + "', '" + name + "', '" + nickname + "', '" + phoneNumber + "', 'JOINED', null, 10, '" + email + "', '" + createdTime + "', '" + createdTime + "', null)";
  } catch (e) {
    console.error("e: ", e);
  }
}

const makeSql = async () => {
  let sql = `INSERT INTO mydb.users (id, password, name, nickname, phone_number, user_status, region_id, reward, email, created_time, updated_time, withdrawal_date) VALUES `;
  let sqls= "";

  for (let i = 0; i < 1000; i++) {
    sqls += (sql + await makeUserInsertSQL(i) + '; \n');
    
  }
   
  fs.writeFile('users_insert.sql', sqls, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('write success.');
  });  
}

makeSql();
