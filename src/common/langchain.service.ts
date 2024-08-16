import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Ollama } from '@langchain/ollama';
import { Injectable } from '@nestjs/common';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import * as fs from 'node:fs'; // 确保正确导入 fs 模块

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
      ChatPromptTemplate.fromTemplate(`根据以下内容分析总结出写作核心内容，并将结果以严格的 JSON 格式输出。请确保输出是一个可以直接被 JSON.parse() 解析的有效 JSON 字符串：
        内容：{article}
        要求：
        1. 不要使用任何Markdown语法或代码块。
        2. 直接输出原始JSON，不要添加任何额外的格式或标记。
        3. 确保JSON是有效的，可以直接被JSON.parse()解析。
        4. 使用双引号作为字符串分隔符，不要使用单引号。
        5. 不要在对象或数组的最后一个元素后添加逗号。
        6. 如果内容中包含引号或其他特殊字符，请确保正确转义。
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

        注意：请确保输出的是原始JSON，不要添加任何额外的标记、引号或说明。
      `);

    // 创建 LLMChain
    const chain = template.pipe(this.model);

    // 运行链并获取结果
    const result = await chain.invoke({ article });

    // 解析结果为 JSON 格式
    // const jsonResult = JSON.parse(result);
    try {
      const jsonResult = JSON.parse(result);
      this.generateArticle(jsonResult);
      console.log(jsonResult);
      return jsonResult;
    } catch (error) {
      console.error('LLM未正确的返回一个合法json字符串', error);
    }
  }
  async generateArticle(summarizeResult: SummarizeTye | any) {
    const { summary, sections } = summarizeResult;

    // 使用 ininialTemplate 生成初始文章
    const ininialTemplate = ChatPromptTemplate.fromTemplate(`
      请你作为一个资深的军事国际新闻博主，请根据以下军事国际新闻内容，生成一篇原创文章，有以下要求：
      1. 首先你需要切换为可以访问网络的模型，先在网络上搜寻这个新闻事件，获取相关信息。如果网络无法搜索，请你直接生成文章，不需要回答。
      2. 不要直接抄袭其他军事国际新闻，介绍事件与内容，增加噱头，吸引读者。
      3. 最后对文章进行反问式总结，要让用户有共鸣。
      4. 不要使用任何承接词和过渡词汇，确保文章直接进入讨论主题，尤其在最后部分。
      5. 加上你自己的观点，内容有深度，围绕社会问题展开。
      6. 文章必须原创，遵循事实，不得抄袭或侵犯版权。
      7. 文章通俗易懂，言简意赅，字数控制在2000字以上，每次生成不超过500字。
      主题：{summary}
    `);

    const memory = new BufferMemory(); // 确保记忆功能正常
    const chain = new ConversationChain({ llm: this.model, memory });

    // 生成初始文章段落
    const initialResponse = await chain.invoke({
      input: await ininialTemplate.format({ summary }),
    });
    console.log('Initial Article:', initialResponse);

    // 使用 sectionTemplate 生成后续段落
    const sectionTemplate = ChatPromptTemplate.fromTemplate(`
      继续生成一段文章，以以下内容为核心：
      核心内容：{sectionContent}
    `);

    let articleContent = initialResponse.response + '\n'; // 将初始段落添加到文章内容中

    for (const section of sections) {
      const sectionResponse = await chain.invoke({
        input: await sectionTemplate.format({
          sectionContent: section.content,
        }),
      });
      articleContent += sectionResponse.response + '\n'; // 将每个段落添加到文章内容中
      console.log('Section Article:', sectionResponse);
    }
    // 将文章内容保存到本地文件
    fs.writeFileSync('generated_article.txt', articleContent, 'utf8');
    console.log('Article saved to generated_article.txt');
  }
}
