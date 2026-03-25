import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class ProductosService {
    constructor(
        @InjectDataSource('db1') 
        private dataSource: DataSource,
    ) { }

    async obtenerPorCategoria(category: string) {
        let query = '';
        let parameters: any[] = [];

        if (!category || category === '') {
            query = 'SELECT IdProducto, Nombre FROM `dbo.TbProductosMaquinaria` ORDER BY Nombre';
        } else {
            switch (category) {
                case 'tractor':
                    query = 'SELECT IdProducto, Nombre FROM vistaTractores ORDER BY Nombre';
                    break;
                case 'sembradora':
                    query = 'SELECT IdProducto, Nombre FROM vistaSembradoras ORDER BY Nombre';
                    break;
                case 'cultivadora':
                    query = 'SELECT IdProducto, Nombre FROM vistaCultivadora ORDER BY Nombre';
                    break;
                case 'svh':
                    query = 'SELECT IdProducto, Nombre FROM vistaSVH ORDER BY Nombre';
                    break;
                case 'otros':
                    query = 'SELECT IdProducto, Nombre FROM vistaOtros ORDER BY Nombre';
                    break;
                default:
                    query = 'SELECT IdProducto, Nombre FROM `dbo.TbProductosMaquinaria` WHERE Nombre LIKE ? ORDER BY Nombre';
                    parameters = [`%${category}%`];
            }
        }

        return await this.dataSource.query(query, parameters);
    }
}