/**
 * Devuelve el precio correcto según quién está mirando:
 * - Técnico aprobado -> precio mayorista (si el producto tiene uno cargado)
 * - Cualquier otro visitante -> precio minorista
 */
export function precioParaUsuario(producto, perfil) {
  const esTecnicoAprobado = perfil?.rol === "tecnico" && perfil?.tecnico_aprobado === true;

  if (esTecnicoAprobado && producto.precio_mayorista) {
    return {
      precio: producto.precio_mayorista,
      tipo: "mayorista",
    };
  }

  return {
    precio: producto.precio_minorista,
    tipo: "minorista",
  };
}

/**
 * Decide si una categoría debe mostrarse a este visitante.
 * Las categorías marcadas "solo_tecnicos" (ej: Módulos) quedan ocultas
 * para quien no sea técnico aprobado.
 */
export function categoriaVisiblePara(categoria, perfil) {
  if (!categoria.solo_tecnicos) return true;
  return perfil?.rol === "tecnico" && perfil?.tecnico_aprobado === true;
}

export function formatearPrecio(numero) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(numero);
}
