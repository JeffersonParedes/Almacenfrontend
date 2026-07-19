import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AdministradorService } from '../../../services/administrador';
import { SuscripcionService } from '../../../services/suscripcion';
import { SuscripcionResponse } from '../../../models/suscripcion';

@Component({
  selector: 'app-administrador-suscripciones',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './suscripciones.html',
  styleUrls: ['./suscripciones.css']
})
export class AdministradorSuscripcionesComponent implements OnInit {
  suscripciones: SuscripcionResponse[] = [];
  selectedSub: SuscripcionResponse | null = null;

  renovacionForm = {
    fechaInicio: '',
    fechaFin: '',
    montoPagado: 150.00,
    metodoPago: 'TRANSFERENCIA'
  };

  constructor(
    private administradorService: AdministradorService,
    private suscripcionService: SuscripcionService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarSuscripciones();
    this.preestablecerFechas();
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

  preestablecerFechas(): void {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    
    const unMesDespues = new Date();
    unMesDespues.setMonth(unMesDespues.getMonth() + 1);
    const finStr = unMesDespues.toISOString().split('T')[0];

    this.renovacionForm.fechaInicio = hoyStr;
    this.renovacionForm.fechaFin = finStr;
  }

  seleccionarParaRenovar(sub: SuscripcionResponse): void {
    this.selectedSub = sub;
    this.preestablecerFechas();
  }

  cancelarRenovacion(): void {
    this.selectedSub = null;
  }

  renovar(): void {
    if (!this.selectedSub) return;

    this.suscripcionService.renovarSuscripcion(this.selectedSub.empresaId, this.renovacionForm).subscribe({
      next: (res) => {
        alert('Suscripción renovada con éxito.');
        this.selectedSub = null;
        this.cargarSuscripciones();
      },
      error: (err) => {
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