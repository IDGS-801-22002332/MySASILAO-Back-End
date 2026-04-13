import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';

/* The LoginController class in TypeScript defines methods for login, registration, and password
recovery. */
@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService) { }

    @Post()
    async login(
        @Body('usuario') usuario: string,
        @Body('contrasenia') contrasenia: string,
    ) {
        return await this.loginService.login(usuario, contrasenia);
    }

    @Post('register')
    async register(@Body() body: any) {
        return await this.loginService.register(body);
    }

    @Post('forgot-password')
    async forgotPassword(@Body('correo') correo: string) {
        return await this.loginService.forgotPassword(correo);
    }

    @Post('verify-code')
    async verifyCode(
        @Body('correo') correo: string,
        @Body('codigo') codigo: string,
    ) {
        return await this.loginService.verifyCode(correo, codigo);
    }

    @Post('reset-password')
    async resetPassword(
        @Body('correo') correo: string,
        @Body('codigo') codigo: string,
        @Body('nuevaContrasenia') nuevaContrasenia: string,
    ) {
        return await this.loginService.resetPassword(correo, codigo, nuevaContrasenia);
    }
}