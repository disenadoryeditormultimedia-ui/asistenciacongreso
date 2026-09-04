// app/actions.ts
'use server';

export async function loginAction(formData: FormData) {
  const usuarioInput = formData.get('usuario');
  const passwordInput = formData.get('password');

  // Si Next.js no lee el .env, usamos "admin" y "supersecreto123" como plan B
  const usuarioCorrecto = process.env.ADMIN_USER || "admin";
  const passwordCorrecta = process.env.ADMIN_PASSWORD || "congreso2026";

  if (usuarioInput === usuarioCorrecto && passwordInput === passwordCorrecta) {
    return { success: true };
  }

  return { success: false, error: 'Usuario o contraseña incorrectos' };
}