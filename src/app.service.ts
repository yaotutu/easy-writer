import { Ollama } from '@langchain/ollama';
import { Injectable } from '@nestjs/common';
import { LangchainService } from './common/langchain.service';
import { UtilsService } from './common/utils.service';
const mockArticleContent = `
文/陈祥

编辑/漆菲

乌军发起的库尔斯克攻势，进入第9天。8月13日，乌军没有显著的攻城略地成绩，攻势看似缓了下来。乌军的最新战报，依然使用截至8月12日取得的领土面积数字，约1000平方公里。乌军宣布，8月13日向前推进了1到3公里，控制的俄方领土多了40平方公里。

美国智库“战争研究所”公布了截至8月12日的最新战况。

8月13日，乌总统泽连斯基与乌军总司令瑟尔斯基进行视频通话。泽连斯基随后在社交媒体上说，尽管战斗艰难而激烈，但乌军在库尔斯克地区继续推进，乌方的“谈判筹码”正在增加。他口里的“筹码”，指的是领土和战俘。

泽连斯基说，乌克兰已控制库尔斯克地区的74个定居点，并在这些地方开展检查和稳定措施。但根据俄方8月12日的通报，乌克兰占领了28个定居点，已深入至少12公里。

乌方称，它无意长期保留乌军在俄罗斯库尔斯克地区占领的领土，但这次行动可能会加大莫斯科向乌东前线增调军队的难度。泽连斯基说，自6月以来，俄罗斯已利用库尔斯克地区对乌克兰领土发动了2000多次跨境袭击。

8月11日，乌军的T-64坦克经过苏梅地区，驶向俄罗斯库尔斯克。

根据美国《福布斯》杂志网站报道，乌军此次投入库尔斯克作战的部队包括4个机械化旅和1个空中突击旅，理论总兵力约为1万人。但这些部队是否全员投入进攻，目前尚不清楚。

综合各方信息，乌军对库尔斯克州西部的斯洛博德卡-伊万诺夫卡、特特金诺、戈尔杰耶夫卡、乌斯彭卡和维克托罗夫卡等地区发动了新的进攻。在苏贾东南方向的吉里定居点，俄军伏击了乌军，这表明乌军已经推进至此。目前尚不清楚，乌军是否占领此地并修筑工事。俄国防部声称，在博尔基附近，俄军击退了乌军的进攻。

久明（左）被认为是普京的心腹。

过去一天，俄军最吸引眼球的动作在于普京任命库尔斯克人阿列克谢·久明（Alexey Dyumin）指挥库尔斯克州的防御。久明于1995年进联邦安全局，随后入联邦警卫局。普京入主克里姆林宫后，久明成为其副官，两人关系亲密。2024年5月，他成为总统助理，监督军工联合体。外界则将其视为普京的接班人人选之一。

久明能否完成使命，取决于他能获得多少资源。俄国防部近来公布的视频显示，其他地区的俄军及其装备正陆续转移到库尔斯克地区。据乌方说，俄罗斯已从乌克兰南部的扎波罗热和赫尔松州调走了一些部队。

眼下，俄军已开始在库尔斯克州中西部利戈夫的南面挖战壕，准备死守此地。作为铁路枢纽，这座人口不到2万人的小镇已然成为俄军的后勤重地。

乌克兰空军也于8月13日出动，预计将投掷精确制导炸弹。至于F-16是否出动，各方都不能确定。
`;
@Injectable()
export class AppService {
  private model: Ollama;
  constructor(
    private readonly utilsService: UtilsService,
    private readonly langchainService: LangchainService,
  ) {
    this.model = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'qwen2',
    });
  }
  async main() {
    const articleContent = await this.utilsService.getPageContent(
      'https://www.toutiao.com/article/7394687537068999202/?log_from=49dde80516ea9_1723715444078',
    );
    this.langchainService.analyzeAndSummarize(articleContent);
  }
}
