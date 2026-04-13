// src/ordenes_reparacion/ordenes_reparacion.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export enum StatusOrden {
    EN_REVISION = 'En revisión',
    EN_PROCESO_ACEPTACION = 'En proceso de aceptación',
    BUSCA_REFACCIONES = 'Busca de refacciones',
    TRABAJO_PROCESO = 'Trabajo en proceso',
    TERMINADO = 'Terminado',
    ENTREGADO = 'Entregado',
    CANCELADO = 'Cancelado'
}

@Injectable()
export class OrdenesReparacionService {
    constructor(
        @InjectDataSource('db2')
        private dataSource: DataSource,
    ) { }

    async create(data: any, fotos: any[]): Promise<any> {
        const rutasFotos = fotos.map(foto => `/uploads/cotizaciones/${foto.filename}`);

        const query = `
        INSERT INTO TboOrdenesReparacion (
            cliente_nombre,
            cliente_apellido_paterno,
            cliente_apellido_materno,
            cliente_correo,
            cliente_telefono,
            descripcion_problema,
            fotos,
            creado_por,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            data.cliente_nombre,
            data.cliente_apellido_paterno,
            data.cliente_apellido_materno || null,
            data.cliente_correo,
            data.cliente_telefono,
            data.descripcion_problema,
            JSON.stringify(rutasFotos),
            data.creado_por,
            StatusOrden.EN_REVISION
        ];

        const result = await this.dataSource.query(query, values);

        return {
            success: true,
            id: result.insertId,
            message: 'Cotización creada exitosamente'
        };
    }

    async findAll(rol?: string, usuarioId?: number): Promise<any[]> {
        let query = `
        SELECT o.*, 
            u.nombre as mecanico_nombre,
            u.apellidoPaterno as mecanico_apellido
        FROM TboOrdenesReparacion o
        LEFT JOIN login u ON o.mecanico_asignado_id = u.id
        WHERE o.activo = 1
    `;

        const params: any[] = [];

        // 🔥 MEJORA: Filtrar correctamente por rol
        if (rol === 'cliente' && usuarioId) {
            query += ` AND o.creado_por = ?`;
            params.push(usuarioId);
        }
        else if (rol === 'mecanico' && usuarioId) {
            query += ` AND o.mecanico_asignado_id = ?`;
            params.push(usuarioId);
        }
        else if (rol === 'interno') {
            // INTERNO ve TODAS las órdenes activas (sin filtro adicional)
            // No agregamos condiciones extra
            console.log('Interno: Mostrando todas las órdenes');
        }

        query += ` ORDER BY o.fecha_creacion DESC`;
        const results = await this.dataSource.query(query, params);

        return results.map(row => ({
            ...row,
            fotos: row.fotos ? this.parseFotos(row.fotos) : []
        }));
    }

    // 🔥 NUEVO: Método auxiliar para parsear fotos
    private parseFotos(fotos: string): string[] {
        if (!fotos) return [];
        try {
            // Si ya es un array, retornarlo
            if (Array.isArray(fotos)) return fotos;
            // Si es string, parsear JSON
            return JSON.parse(fotos);
        } catch (e) {
            // Si no es JSON válido, retornar array vacío
            console.warn('Error parsing fotos:', e);
            return [];
        }
    }

    async findOne(id: number): Promise<any> {
        const query = `
            SELECT o.*, 
                u.nombre as mecanico_nombre,
                u.apellidoPaterno as mecanico_apellido,
                u.telefono as mecanico_telefono,
                u.correo as mecanico_correo
            FROM TboOrdenesReparacion o
            LEFT JOIN login u ON o.mecanico_asignado_id = u.id
            WHERE o.id = ? AND o.activo = 1
        `;

        const results = await this.dataSource.query(query, [id]);

        if (results.length === 0) {
            throw new NotFoundException(`Orden con ID ${id} no encontrada`);
        }

        const orden = results[0];
        orden.fotos = orden.fotos ? this.parseFotos(orden.fotos) : [];

        return orden;
    }

    async asignarMecanico(id: number, mecanico_id: number): Promise<any> {
        await this.findOne(id);

        const mecanico = await this.dataSource.query(
            'SELECT id, nombre, apellidoPaterno FROM login WHERE id = ? AND rol = "mecanico"',
            [mecanico_id]
        );

        if (mecanico.length === 0) {
            throw new BadRequestException('El mecánico no existe o no tiene el rol correcto');
        }

        const mecanico_nombre = `${mecanico[0].nombre} ${mecanico[0].apellidoPaterno}`;

        await this.dataSource.query(`
            UPDATE TboOrdenesReparacion 
            SET mecanico_asignado_id = ?,
                mecanico_asignado_nombre = ?,
                status = ?,
                fecha_asignacion = NOW()
            WHERE id = ?
        `, [mecanico_id, mecanico_nombre, StatusOrden.EN_PROCESO_ACEPTACION, id]);

        return { success: true, message: 'Mecánico asignado exitosamente' };
    }

    async agregarCotizacionMecanico(id: number, data: any): Promise<any> {
        const orden = await this.findOne(id);

        if (orden.status !== StatusOrden.EN_PROCESO_ACEPTACION) {
            throw new BadRequestException('La orden no está en proceso de aceptación');
        }

        const cotizacion_total = data.mano_obra_costo;

        await this.dataSource.query(`
            UPDATE TboOrdenesReparacion 
            SET refacciones_necesarias = ?,
                mano_obra_costo = ?,
                cotizacion_total = ?,
                observaciones_mecanico = ?,
                status = ?
            WHERE id = ?
        `, [
            data.refacciones_necesarias,
            data.mano_obra_costo,
            cotizacion_total,
            data.observaciones_mecanico || null,
            StatusOrden.BUSCA_REFACCIONES,
            id
        ]);

        return { success: true, message: 'Cotización guardada exitosamente' };
    }

    async aceptarRechazarCotizacion(id: number, aceptado: boolean): Promise<any> {
        const orden = await this.findOne(id);

        if (orden.status !== StatusOrden.BUSCA_REFACCIONES) {
            throw new BadRequestException('La orden no está en búsqueda de refacciones');
        }

        const nuevoStatus = aceptado ? StatusOrden.TRABAJO_PROCESO : StatusOrden.CANCELADO;
        const fechaCampo = aceptado ? 'fecha_aceptacion_cliente = NOW()' : 'fecha_cancelado = NOW()';

        await this.dataSource.query(`
            UPDATE TboOrdenesReparacion 
            SET aceptacion_cliente = ?,
                status = ?,
                ${fechaCampo}
            WHERE id = ?
        `, [aceptado ? 1 : 0, nuevoStatus, id]);

        return {
            success: true,
            message: aceptado ? 'Cotización aceptada' : 'Cotización rechazada',
            status: nuevoStatus
        };
    }

    async actualizarStatus(id: number, status: string): Promise<any> {
        await this.findOne(id);

        let fechaCampo = '';
        switch (status) {
            case StatusOrden.TERMINADO:
                fechaCampo = 'fecha_terminado = NOW()';
                break;
            case StatusOrden.ENTREGADO:
                fechaCampo = 'fecha_entregado = NOW()';
                break;
            case StatusOrden.CANCELADO:
                fechaCampo = 'fecha_cancelado = NOW()';
                break;
        }

        let query = `UPDATE TboOrdenesReparacion SET status = ?`;
        const params: any[] = [status];

        if (fechaCampo) {
            query += `, ${fechaCampo}`;
        }

        query += ` WHERE id = ?`;
        params.push(id);

        await this.dataSource.query(query, params);

        return { success: true, message: 'Estado actualizado exitosamente' };
    }

    // 🔥 NUEVO: Obtener órdenes sin mecánico asignado (para interno)
    async findOrdenesSinAsignar(): Promise<any[]> {
        const query = `
            SELECT o.*, 
                u.nombre as mecanico_nombre,
                u.apellidoPaterno as mecanico_apellido
            FROM TboOrdenesReparacion o
            LEFT JOIN login u ON o.mecanico_asignado_id = u.id
            WHERE o.mecanico_asignado_id IS NULL AND o.activo = 1
            ORDER BY o.fecha_creacion ASC
        `;

        const results = await this.dataSource.query(query);
        return results.map(row => ({
            ...row,
            fotos: row.fotos ? this.parseFotos(row.fotos) : []
        }));
    }

    // 🔥 NUEVO: Obtener estadísticas para el dashboard del interno
    async getEstadisticas(): Promise<any> {
        const query = `
            SELECT 
                COUNT(*) as total_ordenes,
                SUM(CASE WHEN status = 'En revisión' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN status = 'En proceso de aceptación' THEN 1 ELSE 0 END) as en_proceso_aceptacion,
                SUM(CASE WHEN status = 'Busca de refacciones' THEN 1 ELSE 0 END) as busca_refacciones,
                SUM(CASE WHEN status = 'Trabajo en proceso' THEN 1 ELSE 0 END) as trabajo_proceso,
                SUM(CASE WHEN status = 'Terminado' THEN 1 ELSE 0 END) as terminados,
                SUM(CASE WHEN status = 'Entregado' THEN 1 ELSE 0 END) as entregados,
                SUM(CASE WHEN status = 'Cancelado' THEN 1 ELSE 0 END) as cancelados,
                SUM(CASE WHEN mecanico_asignado_id IS NULL THEN 1 ELSE 0 END) as sin_asignar,
                SUM(CASE WHEN aceptacion_cliente = 1 THEN 1 ELSE 0 END) as cotizaciones_aceptadas,
                SUM(CASE WHEN aceptacion_cliente = 0 AND aceptacion_cliente IS NOT NULL THEN 1 ELSE 0 END) as cotizaciones_rechazadas,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, fecha_creacion, fecha_terminado)), 2) as horas_promedio_terminado
            FROM TboOrdenesReparacion
            WHERE activo = 1
        `;

        const results = await this.dataSource.query(query);
        return results[0];
    }

    // 🔥 NUEVO: Obtener órdenes por rango de fechas
    async findOrdenesByFechaRange(fechaInicio: Date, fechaFin: Date): Promise<any[]> {
        const query = `
            SELECT o.*, 
                u.nombre as mecanico_nombre,
                u.apellidoPaterno as mecanico_apellido
            FROM TboOrdenesReparacion o
            LEFT JOIN login u ON o.mecanico_asignado_id = u.id
            WHERE o.fecha_creacion BETWEEN ? AND ? AND o.activo = 1
            ORDER BY o.fecha_creacion DESC
        `;

        const results = await this.dataSource.query(query, [fechaInicio, fechaFin]);
        return results.map(row => ({
            ...row,
            fotos: row.fotos ? this.parseFotos(row.fotos) : []
        }));
    }

    // 🔥 NUEVO: Obtener órdenes por status específico
    async findOrdenesByStatus(status: string): Promise<any[]> {
        const query = `
            SELECT o.*, 
                u.nombre as mecanico_nombre,
                u.apellidoPaterno as mecanico_apellido
            FROM TboOrdenesReparacion o
            LEFT JOIN login u ON o.mecanico_asignado_id = u.id
            WHERE o.status = ? AND o.activo = 1
            ORDER BY o.fecha_creacion DESC
        `;

        const results = await this.dataSource.query(query, [status]);
        return results.map(row => ({
            ...row,
            fotos: row.fotos ? this.parseFotos(row.fotos) : []
        }));
    }
}