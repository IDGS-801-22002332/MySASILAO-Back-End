import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // 👈 IMPORTANTE
import { ProductosModule } from './productos/productos.module';
import { LoginModule } from './login/login.module';
import { AnunciosModule } from './anuncios/anuncios.module';
import { SucursalesModule } from './sucursales/sucursales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 esto hace que esté disponible en toda la app
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
  ],
})
export class AppModule { }