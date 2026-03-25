import { Module } from '@nestjs/common';
import { AnunciosService } from './anuncios.service';
import { AnunciosController } from './anuncios.controller';

@Module({
  providers: [AnunciosService],
  controllers: [AnunciosController],
})
export class AnunciosModule {}