import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa';
import { AdministradorService } from '../../../services/administrador';
import { Empresa } from '../../../models/empresa';

@Component({
  selector: 'app-administrador-empresas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './empresas.html',
  styleUrls: ['./empresas.css']
})
export class AdministradorEmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  selectedEmpresa: Empresa | null = null;

  registroForm = {
    empresa: {
      ruc: '',
      razonSocial: '',
      correoContacto: '',
      telefonoContacto: '',
      direccionPrincipal: ''
    },
    usuarioBodeguero: '',
    correoBodeguero: '',
    contrasenaBodeguero: '',
    dniBodeguero: '',
    nombreBodeguero: '',
    planSuscripcion: 'PLAN MENSUAL BÁSICO',
    montoPago: 150.00,
    duracionMeses: 1
  };

  constructor(
    private empresaService: EmpresaService,
    private administradorService: AdministradorService,
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

  registrar(): void {
    // Validaciones básicas
    if (this.registroForm.empresa.ruc.length !== 11) {
      alert('El RUC debe tener 11 dígitos.');
      return;
    }
    if (this.registroForm.dniBodeguero.length !== 8) {
      alert('El DNI del bodeguero debe tener 8 dígitos.');
      return;
    }
    if (this.registroForm.contrasenaBodeguero.length < 6) {
      alert('La contraseña temporal debe tener al menos 6 caracteres.');
      return;
    }

    this.administradorService.registrarEmpresaSaaS(this.registroForm).subscribe({
      next: (res) => {
        alert('Empresa, Bodeguero y Suscripción inicial creados con éxito.');
        this.cargarEmpresas();
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('Error en el registro SaaS', err);
        alert('Error al registrar la empresa: ' + (err.error?.message || err.message));
      }
    });
  }

  suspender(id: number): void {
    if (confirm('¿Está seguro de suspender esta empresa? Se bloquearán todos sus accesos.')) {
      this.administradorService.suspenderEmpresa(id).subscribe({
        next: () => {
          alert('Empresa suspendida correctamente.');
          this.cargarEmpresas();
        },
        error: (err) => {
          console.error('Error al suspender', err);
          alert('Error al suspender empresa.');
        }
      });
    }
  }

  reactivar(id: number): void {
    this.administradorService.reactivarEmpresa(id).subscribe({
      next: () => {
        alert('Empresa reactivada correctamente.');
        this.cargarEmpresas();
      },
      error: (err) => {
        console.error('Error al reactivar', err);
        alert('Error al reactivar empresa.');
      }
    });
  }

  verDetalle(empresa: Empresa): void {
    this.selectedEmpresa = empresa;
  }

  cerrarDetalle(): void {
    this.selectedEmpresa = null;
  }

  private limpiarFormulario(): void {
    this.registroForm = {
      empresa: {
        ruc: '',
        razonSocial: '',
        correoContacto: '',
        telefonoContacto: '',
        direccionPrincipal: ''
      },
      usuarioBodeguero: '',
      correoBodeguero: '',
      contrasenaBodeguero: '',
      dniBodeguero: '',
      nombreBodeguero: '',
      planSuscripcion: 'PLAN MENSUAL BÁSICO',
      montoPago: 150.00,
      duracionMeses: 1
    };
  }
}