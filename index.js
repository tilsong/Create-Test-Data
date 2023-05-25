const { faker } = require('@faker-js/faker');
const fs = require('fs');
const randomUser = require('./user-random/generateRandomUserSql');

const userCount = 100000;

const twoSpecialty = 60000;
const threeSpecialty = 90000;

const selectedTimes = ['18:00:00', '19:00:00', '20:00:00'];

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
  let description =  descriptionList[Math.floor(Math.random() * descriptionList.length)];

  return [specialty, description.replace(/'/g, '')];
}

const makeSpecialtyInsertSQL = async (seq, userId) => {
  let sql = ` INSERT INTO directorsdb.specialty (user_id, property, description, created_time, updated_time) VALUES `;
  const specialtyList = [];

  try {
    const specialty = await generateRandomSpecialty();
    specialtyList.push(specialty[0]);

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    sql += ` ('${userId}', '${specialty[0]}', '${specialty[1]}', '${now}', '${now}' )`;

    if (twoSpecialty <= seq) { // specialty 추가
      const specialty2 = await generateRandomSpecialty();
      
      specialtyList.push(specialty2[0]);

      sql += `, ('${userId}', '${specialty2[0]}', '${specialty2[1]}', '${now}', '${now}' )`;
    }
    if (threeSpecialty <= seq) {
      const specialty3 = await generateRandomSpecialty();
      
      specialtyList.push(specialty3[0]);
      
      sql += `, ('${userId}', '${specialty3[0]}', '${specialty3[1]}', '${now}', '${now}' )`;
    }
    sql += ';';

    return [specialtyList, sql];
  } catch (e) {
    console.error("e: ", e);
  }
}

const makeScheduleInsertSQL = async (userId, scheduleTimes) => {
  let sql = `INSERT INTO directorsdb.schedule (user_id, start_time, status, created_time, updated_time) VALUES `;

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  for (let i = 0; i < scheduleTimes.length; i++) {
    if (i != scheduleTimes.length-1) {
      sql += ` ('${userId}', '${scheduleTimes[i]}', 'OPENED', '${now}', '${now}' ),`;  
    } else {
      sql += ` ('${userId}', '${scheduleTimes[i]}', 'OPENED', '${now}', '${now}' ); `;  
    }
  }

  return sql;
}

const makeStartTimes = async (plusDay, times) => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plusDay);

  const result = [];

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const currentDayOfWeek = currentDate.getDay();

    if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
      for (const time of times) {
        const startTime = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${time}`;
        result.push(startTime);
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
} 

const makeSql = async () => {
  await specialtyRead();

  const startTimes = await makeStartTimes(14, selectedTimes);
  const userData = [];

  let userSql = `INSERT INTO directorsdb.users (id, password, name, nickname, phone_number, user_status, region_id, reward, email, created_time, updated_time, withdrawal_date) VALUES `;
  let specialtySql = "ALTER TABLE directorsdb.specialty AUTO_INCREMENT = 0; ";
  let scheduleSql = "ALTER TABLE directorsdb.schedule AUTO_INCREMENT = 0; ";
  let questionSql = "";
  
  for (let i = 0; i < userCount; i++) {
    const user = await randomUser.makeUserInsertSQL(i);
    userSql += (user[1] + ', ');
    
    const specialty = await makeSpecialtyInsertSQL(i, user[0]);
    specialtySql += (specialty[1]);

    scheduleSql += await makeScheduleInsertSQL(user[0], startTimes);

    userData.push({"userId": user[0], "specialtyList": specialty[0]});
  }

  questionSql = await makeQuestionInsertSQL(userData, startTimes.length);

  await writeFile('users_insert.sql', userSql);
  await writeFile('specialty_insert.sql', specialtySql);
  await writeFile('schedule_insert.sql', scheduleSql);
  await writeFile('question_insert.sql', questionSql);
}

const makeQuestionInsertSQL = async (userData, stLength) => {
  let sql = `ALTER TABLE directorsdb.question AUTO_INCREMENT = 0; INSERT INTO directorsdb.question (title, content, questioner_id, director_id, question_check, director_check, schedule_id, category, comment, status, created_time, updated_time) VALUES `;

  for(let questionerIndex = 0; questionerIndex < userData.length-5; questionerIndex++) {
    let f = 0;
    for (let dirIndex = questionerIndex + 1; dirIndex < questionerIndex + 6; dirIndex++) {
      const title= faker.lorem.paragraph(1);
      const content = faker.lorem.paragraph({ min: 1, max: 3 });

      const schedule_id = dirIndex * stLength + (f+4);

      const specialtyList = userData[dirIndex].specialtyList;
      const specialty = specialtyList[Math.floor(specialtyList.length * Math.random())];

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      if (questionerIndex == userData.length-4 && dirIndex == questionerIndex + 5) {
        sql += `('${title}', '${content}', '${userData[questionerIndex].userId}', '${userData[dirIndex].userId}', 0, 0, ${schedule_id}, '${specialty}', null, 'WAITING', '${now}', '${now}');`;
      } else {
        sql += `('${title}', '${content}', '${userData[questionerIndex].userId}', '${userData[dirIndex].userId}', 0, 0, ${schedule_id}, '${specialty}', null, 'WAITING', '${now}', '${now}'), `;
      }
    }  
  }
  return sql;
}

const writeFile = async (fileName, data) => {
  fs.writeFile(fileName, data, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`${fileName} 작성을 완료했습니다.`);
  });  
}

makeSql();
