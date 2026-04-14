// src/carrusel/carrusel.service.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CarruselService {
    constructor(
        @InjectDataSource('db2')
        private dataSource: DataSource,
    ) {}

    async findAll(): Promise<any[]> {
        const query = `
            SELECT id, imagen
            FROM carrusel
            WHERE activo = 1
            ORDER BY id ASC
        `;
        return await this.dataSource.query(query);
    }

    async create(imagenUrl: string): Promise<any> {
        const query = `
            INSERT INTO carrusel (imagen, activo)
            VALUES (?, 1)
        `;
        const result = await this.dataSource.query(query, [imagenUrl]);
        return { success: true, id: result.insertId };
    }

    async delete(id: number): Promise<any> {
        const query = `DELETE FROM carrusel WHERE id = ?`;
        await this.dataSource.query(query, [id]);
        return { success: true };
    }
}