import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductosModule } from './productos/productos.module';
import { LoginModule } from './login/login.module';
import { AnunciosModule } from './anuncios/anuncios.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { OrdenesReparacionModule } from './ordenes_reparacion/ordenes_reparacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CarruselModule } from './carrusel/carrusel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      name: 'db1',
      type: 'mysql',
      host: 'srv1442.hstgr.io',
      port: 3306,
      username: 'u984104188_DbMSA',
      password: 'jav1erJava',
      database: 'u984104188_DbMSA',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      extra: {
        connectTimeout: 30000,
      },
    }),

    TypeOrmModule.forRoot({
      name: 'db2',
      type: 'mysql',
      host: '193.203.166.183',
      port: 3306,
      username: 'u984104188_estadiastsu',
      password: '220080eStadiasTSUT24',
      database: 'u984104188_AgroDatos',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      extra: {
        connectTimeout: 30000,
      },
    }),

    ProductosModule,
    LoginModule,
    AnunciosModule,
    SucursalesModule,
    OrdenesReparacionModule,
    UsuariosModule,
    CarruselModule,
  ],
})
export class AppModule { }