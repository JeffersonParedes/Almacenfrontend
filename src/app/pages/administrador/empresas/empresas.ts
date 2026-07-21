import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa';
import { AdministradorService } from '../../../services/administrador';
import { ValidacionService } from '../../../services/validacion';
import { Empresa } from '../../../models/empresa';

@Component({
  selector: 'app-administrador-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresas.html',
  styleUrls: ['./empresas.css']
})
export class AdministradorEmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  selectedEmpresa: Empresa | null = null;

  // Estado del Formulario
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
    planSuscripcion: 'PLAN BÁSICO',
    metodoPago: 'TRANSFERENCIA BANCARIA',
    montoPago: 15.00,
    duracionMeses: 1,
    duracionTexto: '1 mes',
    fechaInicio: '',
    fechaFin: ''
  };

  // Errores de validación en tiempo real (onBlur)
  errores = {
    ruc: '',
    correoEmpresa: '',
    telefonoEmpresa: '',
    direccionEmpresa: '',
    usuarioBodeguero: '',
    correoBodeguero: '',
    dniBodeguero: ''
  };

  // Estado de carga de validaciones
  validando = {
    ruc: false,
    correoEmpresa: false,
    telefonoEmpresa: false,
    direccionEmpresa: false,
    usuarioBodeguero: false,
    correoBodeguero: false,
    dniBodeguero: false
  };

  constructor(
    private empresaService: EmpresaService,
    private administradorService: AdministradorService,
    private validacionService: ValidacionService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarEmpresas();
    this.recalcularPlan();
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

  // --- Recálculo automático de planes ---

  recalcularPlan(): void {
    const plan = this.registroForm.planSuscripcion;
    const hoy = new Date();
    this.registroForm.fechaInicio = hoy.toISOString().split('T')[0];

    if (plan === 'PLAN PRO') {
      this.registroForm.montoPago = 85.00;
      this.registroForm.duracionMeses = 6;
      this.registroForm.duracionTexto = '6 meses';
      const fin = new Date(hoy);
      fin.setMonth(fin.getMonth() + 6);
      this.registroForm.fechaFin = fin.toISOString().split('T')[0];
    } else if (plan === 'PLAN PREMIUM') {
      this.registroForm.montoPago = 150.00;
      this.registroForm.duracionMeses = 12;
      this.registroForm.duracionTexto = '12 meses (1 año)';
      const fin = new Date(hoy);
      fin.setFullYear(fin.getFullYear() + 1);
      this.registroForm.fechaFin = fin.toISOString().split('T')[0];
    } else {
      // PLAN BÁSICO por defecto
      this.registroForm.montoPago = 15.00;
      this.registroForm.duracionMeses = 1;
      this.registroForm.duracionTexto = '1 mes';
      const fin = new Date(hoy);
      fin.setMonth(fin.getMonth() + 1);
      this.registroForm.fechaFin = fin.toISOString().split('T')[0];
    }
  }

  // --- Validaciones en Tiempo Real (onBlur) ---

  validarRucBlur(): void {
    const valor = this.registroForm.empresa.ruc.trim();
    if (!valor) {
      this.errores.ruc = 'El RUC es obligatorio.';
      return;
    }
    if (valor.length !== 11 || !/^\d+$/.test(valor)) {
      this.errores.ruc = 'El RUC debe tener exactamente 11 dígitos numéricos.';
      return;
    }

    this.validando.ruc = true;
    this.validacionService.validarRuc(valor).subscribe({
      next: (res) => {
        this.validando.ruc = false;
        this.errores.ruc = res.existe ? (res.mensaje || 'RUC ya registrado.') : '';
        this.cdRef.detectChanges();
      },
      error: () => this.validando.ruc = false
    });
  }

  validarCorreoEmpresaBlur(): void {
    const valor = this.registroForm.empresa.correoContacto.trim();
    if (!valor) return;

    this.validando.correoEmpresa = true;
    this.validacionService.validarCorreoEmpresa(valor).subscribe({
      next: (res) => {
        this.validando.correoEmpresa = false;
        this.errores.correoEmpresa = res.existe ? (res.mensaje || 'El correo empresarial ya existe.') : '';
        this.cdRef.detectChanges();
      },
      error: () => this.validando.correoEmpresa = false
    });
  }

  validarTelefonoEmpresaBlur(): void {
    const valor = this.registroForm.empresa.telefonoContacto.trim();
    if (!valor) return;

    this.validando.telefonoEmpresa = true;
    this.validacionService.validarTelefonoEmpresa(valor).subscribe({
      next: (res) => {
        this.validando.telefonoEmpresa = false;
        this.errores.telefonoEmpresa = res.existe ? (res.mensaje || 'El número telefónico ya pertenece a otra empresa.') : '';
        this.cdRef.detectChanges();
      },
      error: () => this.validando.telefonoEmpresa = false
    });
  }

  validarDireccionEmpresaBlur(): void {
    const valor = this.registroForm.empresa.direccionPrincipal.trim();
    if (!valor) return;

    this.validando.direccionEmpresa = true;
    this.validacionService.validarDireccionEmpresa(valor).subscribe({
      next: (res) => {
        this.validando.direccionEmpresa = false;
        this.errores.direccionEmpresa = res.existe ? (res.mensaje || 'La dirección ingresada ya se encuentra registrada.') : '';
        this.cdRef.detectChanges();
      },
      error: () => this.validando.direccionEmpresa = false
    });
  }

  validarUsuarioBodegueroBlur(): void {
    const valor = this.registroForm.usuarioBodeguero.trim();
    if (!valor) {
      this.errores.usuarioBodeguero = 'El nombre de usuario es obligatorio.';
      return;
    }

    this.validando.usuarioBodeguero = true;
    this.validacionService.validarUsuarioBodeguero(valor).subscribe({
      next: (res) => {
        this.validando.usuarioBodeguero = false;
        this.errores.usuarioBodeguero = res.existe ? (res.mensaje || 'El usuario ya se encuentra registrado.') : '';
        this.cdRef.detectChanges();
      },
      error: () => this.validando.usuarioBodeguero = false
    });
  }

  validarCorreoBodegueroBlur(): void {
    const valor = this.registroForm.correoBodeguero.trim();
    if (!valor) return;

    this.validando.correoBodeguero = true;
    this.validacionService.validarCorreoBodeguero(valor).subscribe({
      next: (res) => {
        this.validando.correoBodeguero = false;
        this.errores.correoBodeguero = res.existe ? (res.mensaje || 'El correo electrónico ya existe.') : '';
        this.cdRef.detectChanges();
      },
      error: () => this.validando.correoBodeguero = false
    });
  }

  validarDniBodegueroBlur(): void {
    const valor = this.registroForm.dniBodeguero.trim();
    if (!valor) {
      this.errores.dniBodeguero = 'El DNI es obligatorio.';
      return;
    }
    if (valor.length !== 8 || !/^\d+$/.test(valor)) {
      this.errores.dniBodeguero = 'El DNI debe tener 8 dígitos numéricos.';
      return;
    }

    this.validando.dniBodeguero = true;
    this.validacionService.validarDniBodeguero(valor).subscribe({
      next: (res) => {
        this.validando.dniBodeguero = false;
        this.errores.dniBodeguero = res.existe ? (res.mensaje || 'El DNI ingresado ya pertenece a otro usuario.') : '';
        this.cdRef.detectChanges();
      },
      error: () => this.validando.dniBodeguero = false
    });
  }

  // Comprobar si hay algún error activo
  tieneErrores(): boolean {
    return Object.values(this.errores).some(e => !!e);
  }

  registrar(): void {
    // Validar todo antes de enviar
    this.validarRucBlur();
    this.validarUsuarioBodegueroBlur();
    this.validarDniBodegueroBlur();

    if (this.tieneErrores()) {
      alert('Corrija los errores marcados en el formulario antes de continuar.');
      return;
    }

    const payload = {
      empresa: {
        ruc: this.registroForm.empresa.ruc,
        razonSocial: this.registroForm.empresa.razonSocial,
        correoContacto: this.registroForm.empresa.correoContacto,
        telefonoContacto: this.registroForm.empresa.telefonoContacto,
        direccionPrincipal: this.registroForm.empresa.direccionPrincipal
      },
      usuarioBodeguero: this.registroForm.usuarioBodeguero,
      correoBodeguero: this.registroForm.correoBodeguero,
      contrasenaBodeguero: this.registroForm.contrasenaBodeguero,
      dniBodeguero: this.registroForm.dniBodeguero,
      nombreBodeguero: this.registroForm.nombreBodeguero,
      planSuscripcion: this.registroForm.planSuscripcion,
      montoPago: this.registroForm.montoPago,
      duracionMeses: this.registroForm.duracionMeses
    };

    this.administradorService.registrarEmpresaSaaS(payload).subscribe({
      next: (res) => {
        alert(`Empresa "${res.razonSocial}" y usuario Bodeguero creados con éxito con suscripción ${this.registroForm.planSuscripcion}.`);
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
      planSuscripcion: 'PLAN BÁSICO',
      metodoPago: 'TRANSFERENCIA BANCARIA',
      montoPago: 15.00,
      duracionMeses: 1,
      duracionTexto: '1 mes',
      fechaInicio: '',
      fechaFin: ''
    };
    this.errores = {
      ruc: '',
      correoEmpresa: '',
      telefonoEmpresa: '',
      direccionEmpresa: '',
      usuarioBodeguero: '',
      correoBodeguero: '',
      dniBodeguero: ''
    };
    this.recalcularPlan();
  }
}