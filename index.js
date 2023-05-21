const axios = require('axios');
const cheerio = require('cheerio');

async function crawlWebsite(url) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
  
      // 크롤링할 내용을 선택자를 사용하여 추출합니다.
      const title = $('title').text();
      const description = $('meta[name="description"]').attr('content');
      const nickname = $('h1.nickname').text().trim();
  
      // 추출한 데이터를 출력합니다.
      console.log('Title:', title);
      console.log('Description:', description);
      console.log('Nickname:', nickname);
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // // 크롤링할 사이트 URL을 전달하여 함수를 호출합니다.
  crawlWebsite('https://soomgo.com/profile/users/10537568?prev=searchPro&hasFilter=false&serviceSelected=true&from=pro_list&serviceInfo=%7B%22id%22%3A582,%22name%22%3A%22%EC%9B%B9%20%EA%B0%9C%EB%B0%9C%22,%22slug%22%3A%22%EC%9B%B9-%EA%B0%9C%EB%B0%9C%22%7D');
  
  