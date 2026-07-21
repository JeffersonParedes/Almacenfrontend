import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdministradorService } from '../../../services/administrador';
import { SuscripcionService } from '../../../services/suscripcion';
import { SuscripcionResponse } from '../../../models/suscripcion';

@Component({
  selector: 'app-administrador-suscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './suscripciones.html',
  styleUrls: ['./suscripciones.css']
})
export class AdministradorSuscripcionesComponent implements OnInit {
  suscripciones: SuscripcionResponse[] = [];
  selectedSub: SuscripcionResponse | null = null;

  renovacionForm = {
    planSuscripcion: 'PLAN BÁSICO',
    metodoPago: 'TRANSFERENCIA BANCARIA',
    montoPagado: 15.00,
    duracionTexto: '1 mes',
    duracionMeses: 1,
    fechaInicio: '',
    fechaFin: ''
  };

  // Regla de Negocio de Renovación
  renovacionPermitida: boolean = true;
  mensajeBloqueoRenovacion: string = '';
  fechaPermitidaRenovacionStr: string = '';
  isProcesandoRenovacion: boolean = false;

  constructor(
    private administradorService: AdministradorService,
    private suscripcionService: SuscripcionService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarSuscripciones();
  }

  cargarSuscripciones(): void {
    this.administradorService.consultarSuscripciones().subscribe({
      next: (res) => {
        this.suscripciones = res;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar suscripciones', err);
      }
    });
  }

  seleccionarParaRenovar(sub: SuscripcionResponse): void {
    this.selectedSub = sub;
    this.validarElegibilidadRenovacion(sub);
    this.recalcularPlan();
  }

  validarElegibilidadRenovacion(sub: SuscripcionResponse): void {
    if (!sub.fechaFin) {
      this.renovacionPermitida = true;
      this.mensajeBloqueoRenovacion = '';
      return;
    }

    const fechaFinSub = new Date(sub.fechaFin + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    fechaFinSub.setHours(0,0,0,0);

    // Calcular fecha permitida (1 mes / 30 días antes del vencimiento)
    const fechaPermitida = new Date(fechaFinSub);
    fechaPermitida.setMonth(fechaPermitida.getMonth() - 1);

    if (hoy < fechaPermitida) {
      this.renovacionPermitida = false;
      
      const dia = String(fechaPermitida.getDate()).padStart(2, '0');
      const mes = String(fechaPermitida.getMonth() + 1).padStart(2, '0');
      const anio = fechaPermitida.getFullYear();
      this.fechaPermitidaRenovacionStr = `${dia}/${mes}/${anio}`;

      this.mensajeBloqueoRenovacion = `No es posible realizar una renovación todavía.\nLa suscripción podrá renovarse a partir del: ${this.fechaPermitidaRenovacionStr}.`;
    } else {
      this.renovacionPermitida = true;
      this.mensajeBloqueoRenovacion = '';
    }
  }

  recalcularPlan(): void {
    if (!this.selectedSub) return;

    const hoy = new Date();
    let fechaInicioBase = hoy;

    if (this.selectedSub.fechaFin) {
      const finActual = new Date(this.selectedSub.fechaFin + 'T00:00:00');
      if (finActual > hoy) {
        fechaInicioBase = finActual;
      }
    }

    this.renovacionForm.fechaInicio = fechaInicioBase.toISOString().split('T')[0];

    const plan = this.renovacionForm.planSuscripcion;

    if (plan === 'PLAN PRO') {
      this.renovacionForm.montoPagado = 85.00;
      this.renovacionForm.duracionMeses = 6;
      this.renovacionForm.duracionTexto = '6 meses';
      const fin = new Date(fechaInicioBase);
      fin.setMonth(fin.getMonth() + 6);
      this.renovacionForm.fechaFin = fin.toISOString().split('T')[0];
    } else if (plan === 'PLAN PREMIUM') {
      this.renovacionForm.montoPagado = 150.00;
      this.renovacionForm.duracionMeses = 12;
      this.renovacionForm.duracionTexto = '12 meses (1 año)';
      const fin = new Date(fechaInicioBase);
      fin.setFullYear(fin.getFullYear() + 1);
      this.renovacionForm.fechaFin = fin.toISOString().split('T')[0];
    } else {
      // PLAN BÁSICO por defecto
      this.renovacionForm.montoPagado = 15.00;
      this.renovacionForm.duracionMeses = 1;
      this.renovacionForm.duracionTexto = '1 mes';
      const fin = new Date(fechaInicioBase);
      fin.setMonth(fin.getMonth() + 1);
      this.renovacionForm.fechaFin = fin.toISOString().split('T')[0];
    }
  }

  cancelarRenovacion(): void {
    this.selectedSub = null;
    this.renovacionPermitida = true;
    this.mensajeBloqueoRenovacion = '';
    this.isProcesandoRenovacion = false;
  }

  renovar(): void {
    if (!this.selectedSub || this.isProcesandoRenovacion) return;
    if (!this.renovacionPermitida) {
      alert(this.mensajeBloqueoRenovacion);
      return;
    }

    this.isProcesandoRenovacion = true;

    const payload = {
      empresaId: this.selectedSub.empresaId,
      planSuscripcion: this.renovacionForm.planSuscripcion,
      metodoPago: this.renovacionForm.metodoPago,
      montoPagado: this.renovacionForm.montoPagado,
      fechaInicio: this.renovacionForm.fechaInicio,
      fechaFin: this.renovacionForm.fechaFin
    };

    this.suscripcionService.renovarSuscripcion(this.selectedSub.empresaId, payload).subscribe({
      next: (res) => {
        this.isProcesandoRenovacion = false;
        alert(`Suscripción renovada con éxito bajo el plan ${this.renovacionForm.planSuscripcion} hasta el ${res.fechaFin}.`);
        this.selectedSub = null;
        this.cargarSuscripciones();
      },
      error: (err) => {
        this.isProcesandoRenovacion = false;
        console.error('Error al renovar suscripción', err);
        alert('Error al renovar suscripción: ' + (err.error?.message || err.message));
      }
    });
  }

  actualizarEstados(): void {
    this.suscripcionService.actualizarEstadoSuscripciones().subscribe({
      next: () => {
        alert('Verificación de estados completada.');
        this.cargarSuscripciones();
      },
      error: (err) => {
        console.error('Error al actualizar estados', err);
        alert('Error al forzar actualización de estados.');
      }
    });
  }
}