import { Module } from '@nestjs/common';
import { OrdenesReparacionService } from './ordenes_reparacion.service';
import { OrdenesReparacionController } from './ordenes_reparacion.controller';

@Module({
  providers: [OrdenesReparacionService],
  controllers: [OrdenesReparacionController],
  exports: [OrdenesReparacionService]
})
export class OrdenesReparacionModule {}
