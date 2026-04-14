// src/carrusel/carrusel.controller.ts
import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CarruselService } from './carrusel.service';

@Controller('carrusel')
export class CarruselController {
    constructor(private readonly carruselService: CarruselService) {}

    @Get()
    async findAll() {
        return await this.carruselService.findAll();
    }

    @Post()
    @UseInterceptors(FileInterceptor('imagen', {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const uploadDir = join(process.cwd(), 'uploads', 'carrusel');
                if (!existsSync(uploadDir)) {
                    mkdirSync(uploadDir, { recursive: true });
                }
                callback(null, uploadDir);
            },
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
            }
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                return callback(new Error('Solo imágenes'), false);
            }
            callback(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }
    }))
    async create(@UploadedFile() imagen: any) {
        const imageUrl = `/uploads/carrusel/${imagen.filename}`;
        return await this.carruselService.create(imageUrl);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.carruselService.delete(id);
    }
}