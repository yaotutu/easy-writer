import { Module } from '@nestjs/common';
import { LangchainService } from './langchain.service';
import { UtilsService } from './utils.service';

@Module({})
export class CommonModule {
  import: [UtilsService, LangchainService];
  export: [UtilsService, LangchainService];
}
