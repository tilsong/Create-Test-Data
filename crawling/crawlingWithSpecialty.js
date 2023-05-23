process.setMaxListeners(0); // listener 제한 해제

const puppeteer = require('puppeteer');
const fs = require('fs');

const crawling_list = [
  ["CONSTRUCTION", "https://soomgo.com/search/pro/공사건설현장-알바/address알바--생산기능노무-알바/review_count"],
  ["LOGISTICS", "https://soomgo.com/search/pro/포장-물류-대행/address/비즈니스-아웃소싱--null/review_count"],
  ["PROFESSIONAL", "https://soomgo.com/search/pro/service/address/비즈니스--회계-세무-재무/review_count"],
  ["TRAVEL", "https://soomgo.com/search/pro/service/address/기타--여행/review_count"],
  ["PARENTING", "https://soomgo.com/search/pro/산후-육아-아이돌보미/address/홈-리빙--도우미/review_count"],
  ["FINANCE", "https://soomgo.com/search/pro/service/address/기타--금융/review_count"], 
  ["SERVICE", "https://soomgo.com/search/pro/service/address/알바/review_count"],
  ["BS", "https://soomgo.com/search/pro/경영-컨설팅/address/비즈니스-컨설팅/review_count"],
  ["HEALTHCARE", "https://soomgo.com/search/pro/service/address/건강-미용--심리/review_count"],
  ["LEGAL", "https://soomgo.com/search/pro/service/address/기타--법률/review_count"],
  ["MARKETING", "https://soomgo.com/search/pro/service/address/비즈니스--마케팅/review_count"],
  ["PROGRAMMING", "https://soomgo.com/search/pro/service/address/디자인-개발--개발-외주/review_count"],
  ["HR", "https://soomgo.com/search/pro/service/address/비즈니스--인사/review_count"],
  ["EDUCATION", "https://soomgo.com/search/pro/service/address/레슨--학업/review_count"],
  ["HEALTH", "https://soomgo.com/search/pro/퍼스널트레이닝/address/건강-미용--건강/review_count"],
  ["TRADE", "https://soomgo.com/search/pro/무역대행-수입수출포워딩등/address/비즈니스--아웃소싱/review_count"],
  ["LIFESTYLE", "https://soomgo.com/search/pro/service/address/홈-리빙--수도-보일러-전기/review_count"],
  ["ART", "https://soomgo.com/search/pro/service/address/레슨--미술/review_count"],
  ["OTHER", "https://soomgo.com/search/pro/service/address/레슨--취업준비/review_count"],
  ["DESIGN", "https://soomgo.com/search/pro/service/address/디자인-개발--디자인-외주/review_count"]
];

const separation = "&||";

const scrollToEnd = async (page) => {
  let previousHeight = 0;
  let currentHeight = await page.evaluate('document.body.scrollHeight');

  while (previousHeight !== currentHeight) {
    previousHeight = currentHeight;

    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(1000);

    currentHeight = await page.evaluate('document.body.scrollHeight');

    console.log("현재 scroll height -> ", currentHeight);
  }

  console.log("마지막 스크롤 페이지입니다.");
}

const extractText = async (nodes) => { 
  let texts = "";

  for (const node of nodes) {
    const text = await node.evaluate(n => n.textContent.trim());
    texts += (text + separation);
  }
  
  return "총 " + nodes.length +"개\n" + texts;
}

const writeFile = async (fileName, data) => {
  fs.writeFile(fileName, data, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`${fileName}의 작성을 완료했습니다.`);
  }); 
}

const calcTime = (startTime, endTime) => {
  let timeDiff = endTime - startTime;

  let seconds = Math.floor(timeDiff / 1000);
  let minutes = Math.floor(seconds / 60);
  seconds %= 60;
  let hours = Math.floor(minutes / 60);
  minutes %= 60;

  return (hours + "시간 " + minutes + "분 " + seconds + "초");
}

const crawlWebsite = async (specialty, url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);
  await scrollToEnd(page);

  const descriptionNodes = await page.$$(`.list-item a > div > div > div.pro-info > p`);

  const data = await extractText(descriptionNodes);
  await writeFile('results/' + specialty + '.txt', data);

  await browser.close();
}

const run = async () => {
  const totalStart = new Date();

  for (let i = 0; i < crawling_list.length; i++) {
    console.log(`${crawling_list[i][0]}의 크롤링을 시작했습니다.`);

    const startTime = new Date();
    await crawlWebsite(crawling_list[i][0], crawling_list[i][1]);

    console.log(`\n ${crawling_list[i][0]}의 크롤링에 ${calcTime(startTime, new Date())} 소요되었습니다.`);
  }

  console.log(`\n전체 크롤링에 ${calcTime(totalStart, new Date())} 소요되었습니다.`);
}

run();