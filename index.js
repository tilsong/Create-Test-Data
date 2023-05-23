const fs = require('fs');
const randomUser = require('./user-random/generateRandomUserSql');

const userCount = 100000;

const twoSpecialty = 90000;
const threeSpecialty = 100000;

const specialtyList = ["CONSTRUCTION", "LOGISTICS", "PROFESSIONAL" , "TRAVEL", "PARENTING", "FINANCE", "SERVICE", "BS", "HEALTHCARE", "LEGAL", "MARKETING", "PROGRAMMING", "HR", "EDUCATION", "HEALTH", "TRADE", "LIFESTYLE", "ART", "OTHER", "DESIGN"];
const specialtyMap = new Map();

const specialtyRead = () => {
  for (let i = 0; i < specialtyList.length; i++) {
    const filePath = `./crawling/results/${specialtyList[i]}.txt`
    
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const dataArr = data.split("&||");
      data.replace("\'", "")

      specialtyMap.set(specialtyList[i], dataArr);

      console.log(specialtyList[i], ".txt 파일을 읽어왔습니다.");
    } catch(e) {
      console.log(e);
    }
  }
}

const generateRandomSpecialty = async () => {
  const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
  const descriptionList = specialtyMap.get(specialty);

  return [specialty, descriptionList[Math.floor(Math.random() * descriptionList.length)]];
}

const makeSpecialtyInsertSQL = async (seq, userId) => {
  const specialtyPrefix = `INSERT INTO mydb.specialty (user_id, property, description, created_time, updated_time) VALUES `;
  let sql = "";

  try {
    const specialty = await generateRandomSpecialty();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    sql += `${specialtyPrefix} ('${userId}', '${specialty[0]}', '${specialty[1]}', '${now}', '${now}' ); \n`;

    if (twoSpecialty <= seq && seq < threeSpecialty) { // specialty 추가
      const specialty2 = await generateRandomSpecialty();
      sql += `${specialtyPrefix} ('${userId}', '${specialty2[0]}', '${specialty2[1]}', '${now}', '${now}' ); \n`;
    }
    if (threeSpecialty <= seq) {
      const specialty3 = await generateRandomSpecialty();
      sql += `${specialtyPrefix} ('${userId}', '${specialty3[0]}', '${specialty3[1]}', '${now}', '${now}' ); \n`;
    }

    return sql;
  } catch (e) {
    console.error("e: ", e);
  }
}

const makeSql = async () => {
  await specialtyRead();

  let userInsertSql = "";
  let specialtySql = "";

  for (let i = 0; i < userCount; i++) {
    const user = await randomUser.makeUserInsertSQL(i);
    userInsertSql += (user[1] + '; \n');

    specialtySql += await makeSpecialtyInsertSQL(i, user[0]);
  }

  fs.writeFile('users_insert.sql', userInsertSql, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('User insert sql 작성을 완료했습니다.');
  });  

  fs.writeFile('specialty_insert.sql', specialtySql, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Specialty insert sql 작성을 완료했습니다.');
  });  
}

makeSql();
