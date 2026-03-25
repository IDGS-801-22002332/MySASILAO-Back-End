import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SucursalesService {
    constructor(
        @InjectDataSource('db2') 
        private dataSource: DataSource,
    ) { }

    async getSucursales() {
        const query = `
        SELECT * FROM TbSucursalesMaquinaria
        ORDER BY nombre
    `;
        return await this.dataSource.query(query);
    }

    async insertSucursal(data: any) {
        const query = `
        INSERT INTO TbSucursalesMaquinaria (
            nombre,
            latitud,
            longitud,
            direccion,
            telefono,
            horarios
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;

        const values = [
            data.nombre,
            data.latitud,
            data.longitud,
            data.direccion,
            data.telefono,
            data.horarios,
        ];

        try {
            await this.dataSource.query(query, values);
            return {
                success: true,
                message: 'Sucursal agregada correctamente',
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al agregar sucursal',
                error: error.message,
            };
        }
    }

    async updateSucursal(id: number, data: any) {
        const query = `
        UPDATE TbSucursalesMaquinaria
        SET 
            nombre = ?,
            latitud = ?,
            longitud = ?,
            direccion = ?,
            telefono = ?,
            horarios = ?
        WHERE id = ?
    `;

        const values = [
            data.nombre,
            data.latitud,
            data.longitud,
            data.direccion,
            data.telefono,
            data.horarios,
            id,
        ];

        try {
            await this.dataSource.query(query, values);
            return {
                success: true,
                message: 'Sucursal actualizada correctamente',
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al actualizar sucursal',
                error: error.message,
            };
        }
    }

    async deleteSucursal(id: number) {
        const query = `
        DELETE FROM TbSucursalesMaquinaria
        WHERE id = ?
    `;

        try {
            await this.dataSource.query(query, [id]);
            return {
                success: true,
                message: 'Sucursal eliminada correctamente',
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al eliminar sucursal',
                error: error.message,
            };
        }
    }
}