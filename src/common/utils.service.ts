import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
const articleUrl = 'https://www.toutiao.com/article/7402819502838202907/';
@Injectable()
export class UtilsService {
  async getPageContent() {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    // 监听页面导航事件
    page.on('framenavigated', (frame) => {
      console.log(`Navigated to: ${frame.url()}`);
    });

    // 监听请求事件
    page.on('request', (request) => {
      console.log(`Request: ${request.url()}`);
    });

    // 监听响应事件
    page.on('response', (response) => {
      console.log(`Response: ${response.url()} - ${response.status()}`);
    });
    await page.goto(articleUrl, { waitUntil: 'networkidle2', timeout: 90000 }); // 等待页面加载完成
    const text = await page.evaluate(() => {
      return document.querySelector('article').innerText;
    });
    console.log(text);
    await browser.close();
    return text;
  }
}
