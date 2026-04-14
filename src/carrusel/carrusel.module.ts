// src/carrusel/carrusel.module.ts
import { Module } from '@nestjs/common';
import { CarruselController } from './carrusel.controller';
import { CarruselService } from './carrusel.service';

@Module({
    controllers: [CarruselController],
    providers: [CarruselService],
    exports: [CarruselService],
})
export class CarruselModule {}