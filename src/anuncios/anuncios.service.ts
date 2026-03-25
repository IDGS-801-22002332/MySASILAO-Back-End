import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class AnunciosService {
    constructor(
        @InjectDataSource('db2') 
        private dataSource: DataSource,
    ) { }

    async getAnuncios() {
        const query = `
      SELECT * FROM TboAnuncios
    `;
        return await this.dataSource.query(query);
    }

    async insertAnuncio(data: any) {
        const query = `
        INSERT INTO TboAnuncios (titulo, descripcion, pie)
        VALUES (?, ?, ?)
    `;

        const values = [
            data.titulo,
            data.descripcion,
            data.pie
        ];

        try {
            await this.dataSource.query(query, values);
            return {
                success: true,
                message: 'Anuncio creado correctamente'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al crear anuncio',
                error: error.message
            };
        }
    }

    async updateAnuncio(id: number, data: any) {
        const query = `
        UPDATE TboAnuncios
        SET titulo = ?, descripcion = ?, pie = ?
        WHERE id = ?
    `;

        const values = [
            data.titulo,
            data.descripcion,
            data.pie,
            id
        ];

        try {
            await this.dataSource.query(query, values);
            return {
                success: true,
                message: 'Anuncio actualizado correctamente'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al actualizar anuncio',
                error: error.message
            };
        }
    }
}