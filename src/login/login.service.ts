import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { identity } from 'rxjs';

@Injectable()
export class LoginService {
    constructor(
        @InjectDataSource('db2')
        private dataSource: DataSource,
    ) { }

    async login(usuario: string, contrasenia: string) {
        const query = `
                SELECT id, usuario, rol, nombre, apellidoPaterno, apellidoMaterno, correo, telefono
                FROM login
                WHERE usuario = ? AND contrasenia = ?
                `;

        const result = await this.dataSource.query(query, [usuario, contrasenia]);
        if (result.length > 0) {
            const user = result[0];
            return {
                success: true,
                message: 'Inicio de sesión exitoso',
                id: user.id,
                usuario: user.usuario,
                rol: user.rol,
                nombre: user.nombre,
                apellidoPaterno: user.apellidoPaterno,
                apellidoMaterno: user.apellidoMaterno,
                correo: user.correo,
                telefono: user.telefono,
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
                message: 'Error al registrar usuario'
            };
        }
    }



    // ─── NUEVO: Paso 1 — Verificar correo y enviar código ───────────────────
    async forgotPassword(correo: string) {
        // 1. Verificar que el correo exista
        const result = await this.dataSource.query(
            'SELECT correo FROM login WHERE correo = ?',
            [correo]
        );

        if (result.length === 0) {
            return { success: false, message: 'El correo no está registrado' };
        }

        // 2. Generar código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Guardar código con timestamp en BD (expiración la manejas en la verificación)
        const expiracion = new Date(Date.now() + 5 * 60 * 1000); // +5 minutos
        await this.dataSource.query(
            'UPDATE login SET codigo = ? WHERE correo = ?',
            [`${codigo}|${expiracion.toISOString()}`, correo]
        );

        // 4. Enviar correo
        await this.sendRecoveryEmail(correo, codigo);

        return { success: true, message: 'Código enviado al correo' };
    }

    async verifyCode(correo: string, codigoIngresado: string) {
        const result = await this.dataSource.query(
            'SELECT codigo FROM login WHERE correo = ?',
            [correo]
        );

        if (result.length === 0) {
            return { success: false, message: 'Correo no encontrado' };
        }

        const stored = result[0].codigo;

        if (!stored || !stored.includes('|')) {
            return { success: false, message: 'No hay código activo' };
        }

        const [codigoGuardado, expiracionStr] = stored.split('|');
        const expiracion = new Date(expiracionStr);

        console.log("=== DEBUG CODIGO ===");
        console.log("Guardado:", codigoGuardado);
        console.log("Ingresado:", codigoIngresado);
        console.log("Raw BD:", stored);

        // Verificar expiración
        if (new Date() > expiracion) {
            return { success: false, message: 'El código ha expirado' };
        }

        // Verificar coincidencia
        if (codigoIngresado !== codigoGuardado) {
            return { success: false, message: 'Código incorrecto' };
        }

        return { success: true, message: 'Código válido' };
    }

    // login.service.ts (agregar la parte de verificación de código en resetPassword)
    async resetPassword(correo: string, codigo: string, nuevaContrasenia: string) {
        const result = await this.dataSource.query(
            'SELECT codigo FROM login WHERE correo = ?',
            [correo]
        );
        if (result.length === 0) {
            return { success: false, message: 'Correo no encontrado' };
        }
        const stored = result[0].codigo;
        if (!stored || !stored.includes('|')) {
            return { success: false, message: 'No hay código activo' };
        }
        const [codigoGuardado, expiracionStr] = stored.split('|');
        const expiracion = new Date(expiracionStr);
        // Validar expiración
        if (new Date() > expiracion) {
            return { success: false, message: 'El código ha expirado' };
        }
        // Validar código
        if (codigo.trim() !== codigoGuardado.trim()) {
            return { success: false, message: 'Código incorrecto' };
        }
        await this.dataSource.query(
            'UPDATE login SET contrasenia = ?, codigo = NULL WHERE correo = ?',
            [nuevaContrasenia, correo]
        );
        return { success: true, message: 'Contraseña actualizada correctamente' };
    }

    // ─── Helper: Enviar correo ───────────────────────────────────────────────
    private async sendRecoveryEmail(correo: string, codigo: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // o tu proveedor SMTP
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Maquinaria Agrícola" <${process.env.MAIL_USER}>`,
            to: correo,
            subject: 'Código de recuperación de contraseña',
            html: `
                <h2>Recuperación de contraseña</h2>
                <p>Tu código de verificación es:</p>
                <h1 style="letter-spacing: 8px; color: #2563eb;">${codigo}</h1>
                <p>Este código expira en <strong>5 minutos</strong>.</p>
                <p>Si no solicitaste esto, ignora este correo.</p>
            `,
        });
    }
}