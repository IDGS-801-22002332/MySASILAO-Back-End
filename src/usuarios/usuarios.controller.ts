// src/usuarios/usuarios.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    @Get('hola')
    async hola() {
        return { mensaje: 'El módulo de usuarios funciona!' };
    }

    @Get('mecanicos')
    async getMecanicos() {
        console.log('Endpoint /usuarios/mecanicos llamado');
        return await this.usuariosService.findByRol('Mecanico');
    }

    @Get()
    async getUsuariosByRol(@Query('rol') rol: string) {
        console.log('Endpoint /usuarios llamado con rol:', rol);
        if (rol) {
            return await this.usuariosService.findByRol(rol);
        }
        return await this.usuariosService.findAll();
    }
}