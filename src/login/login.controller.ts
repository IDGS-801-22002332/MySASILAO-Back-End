import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService) { }

    @Post()
    async login(
        @Body('usuario') usuario: string,
        @Body('contrasenia') contrasenia: string
    ) {
        return await this.loginService.login(usuario, contrasenia);
    }

    @Post('register')
    async register(@Body() body: any) {
        return await this.loginService.register(body);
    }
}