import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Ollama } from '@langchain/ollama';
import { Injectable } from '@nestjs/common';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';

type SummarizeTye = {
  summary: string;
  sections: {
    title: string;
    content: string;
  }[];
};

@Injectable()
export class LangchainService {
  private model: Ollama;

  constructor() {
    this.model = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'qwen2',
    });
  }

  async analyzeAndSummarize(article: string): Promise<SummarizeTye> {
    // 创建提示模板
    const template =
      ChatPromptTemplate.fromTemplate(`根据以下内容分析总结出写作核心内容，并将结果以 JSON 格式输出：
        内容：{article}
        输出格式：
        {{
        "summary": "写作核心内容",
        "sections": [
            {{
            "title": "小标题1",
            "content": "对应的正文内容"
        }},
            {{
            "title": "小标题2",
            "content": "对应的正文内容"
        }}
        ]
        }}
      `);

    // 创建 LLMChain
    const chain = template.pipe(this.model);

    // 运行链并获取结果
    const result = await chain.invoke({ article });

    // 解析结果为 JSON 格式
    const jsonResult = JSON.parse(result);
    return jsonResult;
  }
  async generateArticle(summarizeResult: SummarizeTye | any) {
    const { summary, sections } = summarizeResult;
    const ininialTemplate = ChatPromptTemplate.fromTemplate(`
        请你作为一个资深的军事国际新闻博主，请根超以下军事国际新闻内容，生成一篇的原创文章，有以下要求
        1.首先你需要切换为可以访问网络的模型，先在网络上搜寻这个新闻事件，获取相关信息，如果网络无法搜索，请你直按生成文章，不需要回答
        2.不能直接抄袭其他军事国际新闻，要介绍事件与内容，要有噱头，吸引读者想读下去，要围绕新闻事件进行介绍，适当增加观点或详细例子，增加说服力
        3.最后曼对文章进行反问式总结，要让用户有共鸣
        4.严格道免使用任何形式的承接词和过度词汇，这不仅包括常见的“综上所述”， “总而言之”、“首先”和“同时”，还包括“然而”、“但是，以及其他任何其他可能被用来引号或总结的问汇。请确保文章的每一段落都能直接进入讨论主题，而不是通过引入或过渡性短沿来构建内容。尤其在文章的最后一部分，要避免使用可能导致总结或过度的词汇和短语，不需要小标题
        5.加上你自己的观点，内容要有深度和观点，能够引起读者的兴趣， 围绕社会问题展开，文章内容必须原创，不得抄袭或侵犯他人版权， 可以参考相关社会讨论类文章进行创作，但不能直接复制 
        6.所有的文章必须依据事实撰写，不能改编，造谣，
        7.不能用花里胡哨的修饰词填充文章，文章通俗易懂，言简意赅，朗朗上口，
        8.文章不能出现任何英文单词，确保严格保证文章字数在2000字以上，我需要你把整篇文章分为N次生成，严格控制文章每次生成的字数，每次生成的文章字数不能多于500，不能重复每次生成的内容，不需要回答，直接开始生成文章，生成完新闻稿的每段以后，不能询问我是否继续生成 ，我发任意的指令后即可继续生成你的后半部分文章，全文不需要说明信息来源以及参考资料
        -----新闻事件：主题：{summary} 
        `);
    const sectionTemplate = ChatPromptTemplate.fromTemplate(`
        继续生成一段文章，不需要回答，直接生成，不能出现开头，正文， 首先、然后、此外、最后、其次等词语，不需要小标题，以（{section}） 为此段文章的核心，请使用中文继续生成
        `);
    const memory = new BufferMemory();
    const chain = new ConversationChain({ llm: this.model, memory });
    console.log('Memory Keys:', memory.memoryKeys);

    const res1 = await chain.invoke({ input: "Hi! I'm Jim." });
    console.log({ res1 });
    const res2 = await chain.invoke({
      input: 'What did I just say my name was?',
    });
    console.log({ res2 });
  }
}
