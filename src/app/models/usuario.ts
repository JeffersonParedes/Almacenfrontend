export interface Usuario {
  id?: number;
  usuario: string;
  contrasena?: string; // Opcional porque en las respuestas no viene la contraseña
  nombreCompleto: string;
  rol: string;
  activo: boolean;
  ultimoAcceso?: string;
  empresaId?: number;
  dni?: string;
  correo?: string;
}