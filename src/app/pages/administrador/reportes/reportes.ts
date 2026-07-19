import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../../services/reporte';
import { EmpresaService } from '../../../services/empresa';
import { Empresa } from '../../../models/empresa';

@Component({
  selector: 'app-administrador-reportes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class AdministradorReportesComponent implements OnInit {
  empresas: Empresa[] = [];

  suscripcionParams = {
    empresaId: '',
    estadoSuscripcion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  constructor(
    private reporteService: ReporteService,
    private empresaService: EmpresaService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.empresaService.listarTodas().subscribe({
      next: (res) => {
        this.empresas = res;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar empresas', err);
      }
    });
  }

  descargarReporteSuscripciones(): void {
    const rawParams = { ...this.suscripcionParams };
    
    // Si no se selecciona empresa, eliminar la clave del objeto para no mandarlo como parámetro vacío
    if (!rawParams.empresaId) {
      delete (rawParams as any).empresaId;
    }

    this.reporteService.generarSuscripcion(rawParams).subscribe({
      next: (res) => {
        this.reporteService.descargarPdf(res.archivo, res.nombreArchivo);
      },
      error: (err) => {
        console.error('Error al generar PDF de suscripciones', err);
        alert('Error al descargar el PDF.');
      }
    });
  }

  descargarReporteDashboard(): void {
    this.reporteService.generarDashboard().subscribe({
      next: (res) => {
        this.reporteService.descargarPdf(res.archivo, res.nombreArchivo);
      },
      error: (err) => {
        console.error('Error al generar PDF del dashboard', err);
        alert('Error al descargar el PDF.');
      }
    });
  }
}