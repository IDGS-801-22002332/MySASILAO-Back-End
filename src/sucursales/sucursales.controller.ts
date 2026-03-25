import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';

@Controller('sucursales')
export class SucursalesController {
    constructor(private readonly sucursalesService: SucursalesService) { }

    @Get()
    async getSucursales() {
        return await this.sucursalesService.getSucursales();
    }

    @Post()
    async insertSucursal(@Body() body: any) {
        return await this.sucursalesService.insertSucursal(body);
    }

    @Put(':id')
    async updateSucursal(
        @Param('id') id: number,
        @Body() body: any
    ) {
        return await this.sucursalesService.updateSucursal(id, body);
    }

    @Delete(':id')
    async deleteSucursal(@Param('id') id: number) {
        return await this.sucursalesService.deleteSucursal(id);
    }
}