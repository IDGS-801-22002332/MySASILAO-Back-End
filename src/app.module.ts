import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'srv1442.hstgr.io', // <--- USA ESTE NOMBRE EN LUGAR DE LA IP
      port: 3306,
      username: 'u984104188_DbMSA',
      password: 'jav1erJava',
      database: 'u984104188_DbMSA',
      entities: [],
      synchronize: false,
      // Esto ayuda a manejar la conexión con servidores externos
      extra: {
        connectTimeout: 30000,
      }
    }),
    ProductosModule,
  ],
})
export class AppModule {}