import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { LangchainService } from './common/langchain.service';
import { UtilsService } from './common/utils.service';

@Module({
  imports: [CommonModule],
  controllers: [AppController],
  providers: [AppService, UtilsService, LangchainService],
})
export class AppModule {}
