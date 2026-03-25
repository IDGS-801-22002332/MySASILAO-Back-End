import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class LoginService {
    constructor(
        @InjectDataSource('db2') 
        private dataSource: DataSource,
    ) { }

    async login(usuario: string, contrasenia: string) {
        const query = `
        SELECT usuario, rol 
        FROM login 
        WHERE usuario = ? AND contrasenia = ?
    `;

        const result = await this.dataSource.query(query, [usuario, contrasenia]);

        if (result.length > 0) {
            return {
                success: true,
                message: 'Inicio de sesión exitoso',
                usuario: result[0].usuario,
                rol: result[0].rol,
            };
        } else {
            return {
                success: false,
                message: 'Usuario o contraseña incorrectos',
            };
        }
    }

    async register(data: any) {
        const existe = await this.dataSource.query(
            'SELECT * FROM login WHERE usuario = ?',
            [data.usuario]
        );

        if (existe.length > 0) {
            return {
                success: false,
                message: 'El usuario ya existe',
            };
        }

        const query = `
        INSERT INTO login (
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        telefono,
        correo,
        calle,
        numero,
        codigoPostal,
        colonia,
        ciudad,
        usuario,
        contrasenia,
        codigo,
        rol
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            data.nombre,
            data.apellidoPaterno,
            data.apellidoMaterno,
            data.telefono,
            data.correo,
            data.calle,
            data.numero,
            data.codigoPostal,
            data.colonia,
            data.ciudad,
            data.usuario,
            data.contrasenia,
            data.codigo,
            data.rol,
        ];

        try {
            await this.dataSource.query(query, values);

            return {
                success: true,
                message: 'Usuario registrado correctamente',
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al registrar usuario',
                error: error.message,
            };
        }
    }
}