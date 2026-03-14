import { Controller, Get, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';

@Controller('productos') 
export class ProductosController {
    constructor(private readonly productosService: ProductosService) { }

    @Get()
    async getProductos(@Query('category') category: string) {
        const cat = category || '';
        return await this.productosService.obtenerPorCategoria(cat);
    }
}