// src/usuarios/usuarios.service.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectDataSource('db2') 
        private dataSource: DataSource,
    ) {}

    async findByRol(rol: string): Promise<any[]> {
        console.log('🔍 Buscando usuarios con rol:', rol);
        
        const query = `
            SELECT 
                id, 
                nombre, 
                apellidoPaterno, 
                apellidoMaterno, 
                telefono, 
                correo,
                usuario,
                rol
            FROM login 
            WHERE rol = ?
            ORDER BY nombre ASC
        `;
        
        try {
            const results = await this.dataSource.query(query, [rol]);
            console.log(`✅ Encontrados ${results.length} usuarios`);
            return results;
        } catch (error) {
            console.error('❌ Error en consulta:', error);
            throw error;
        }
    }

    async findAll(): Promise<any[]> {
        const query = `
            SELECT 
                id, 
                nombre, 
                apellidoPaterno, 
                apellidoMaterno, 
                telefono, 
                correo,
                usuario,
                rol
            FROM login 
            ORDER BY nombre ASC
        `;
        
        const results = await this.dataSource.query(query);
        return results;
    }
}