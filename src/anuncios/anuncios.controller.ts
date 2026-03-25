import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { AnunciosService } from './anuncios.service';

@Controller('anuncios')
export class AnunciosController {
    constructor(private readonly anunciosService: AnunciosService) { }

    @Get()
    async getAnuncios() {
        return await this.anunciosService.getAnuncios();
    }

    @Post()
    async insertAnuncio(@Body() body: any) {
        return await this.anunciosService.insertAnuncio(body);
    }

    @Put(':id')
    async updateAnuncio(
        @Param('id') id: number,
        @Body() body: any
    ) {
        return await this.anunciosService.updateAnuncio(id, body);
    }
}