// src/ordenes/ordenes.controller.ts
import {
    Controller, Get, Post, Put, Body, Param, UseInterceptors,
    UploadedFiles, Query, ParseIntPipe
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { OrdenesReparacionService } from './ordenes_reparacion.service';

@Controller('ordenes')
export class OrdenesReparacionController {
    constructor(private readonly ordenesService: OrdenesReparacionService) { }

    @Post()
    @UseInterceptors(FilesInterceptor('fotos', 5, {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const uploadDir = join(process.cwd(), 'uploads', 'cotizaciones');
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
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return callback(new Error('Solo imágenes'), false);
            }
            callback(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }
    }))
    async create(@Body() body: any, @UploadedFiles() fotos: any[]) {
        return await this.ordenesService.create(body, fotos);
    }

    @Get()
    async findAll(
        @Query('rol') rol: string,
        @Query('usuarioId') usuarioId: number
    ) {
        return await this.ordenesService.findAll(rol, usuarioId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.ordenesService.findOne(id);
    }

    @Put(':id/asignar-mecanico')
    async asignarMecanico(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { mecanico_id: number }
    ) {
        return await this.ordenesService.asignarMecanico(id, body.mecanico_id);
    }

    @Put(':id/cotizacion-mecanico')
    async agregarCotizacionMecanico(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any
    ) {
        return await this.ordenesService.agregarCotizacionMecanico(id, body);
    }

    @Put(':id/aceptar-cliente')
    async aceptarRechazarCotizacion(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { aceptado: boolean }
    ) {
        return await this.ordenesService.aceptarRechazarCotizacion(id, body.aceptado);
    }

    @Put(':id/status')
    async actualizarStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { status: string }
    ) {
        return await this.ordenesService.actualizarStatus(id, body.status);
    }

    // ÓRDENES SIN MECÁNICO
    @Get('sin-asignar')
    async findOrdenesSinAsignar() {
        return await this.ordenesService.findOrdenesSinAsignar();
    }

    // ESTADÍSTICAS
    @Get('estadisticas/resumen')
    async getEstadisticas() {
        return await this.ordenesService.getEstadisticas();
    }

    // FILTRO POR STATUS
    @Get('filtro/status')
    async findOrdenesByStatus(@Query('status') status: string) {
        return await this.ordenesService.findOrdenesByStatus(status);
    }

    // FILTRO POR FECHAS
    @Get('filtro/fechas')
    async findOrdenesByFechaRange(
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string
    ) {
        return await this.ordenesService.findOrdenesByFechaRange(
            new Date(fechaInicio),
            new Date(fechaFin)
        );
    }
}