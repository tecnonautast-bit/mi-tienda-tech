"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Al cargar la página, recuperamos el carrito guardado en el navegador
  useEffect(() => {
    const guardado = localStorage.getItem("carrito");
    if (guardado) setItems(JSON.parse(guardado));
  }, []);

  // Cada vez que cambia el carrito, lo guardamos
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(items));
  }, [items]);

  function agregarItem(producto, cantidad = 1) {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [...prev, { ...producto, cantidad }];
    });
  }

  function quitarItem(productoId) {
    setItems((prev) => prev.filter((i) => i.id !== productoId));
  }

  function cambiarCantidad(productoId, cantidad) {
    if (cantidad <= 0) return quitarItem(productoId);
    setItems((prev) =>
      prev.map((i) => (i.id === productoId ? { ...i, cantidad } : i))
    );
  }

  function vaciarCarrito() {
    setItems([]);
  }

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, agregarItem, quitarItem, cambiarCantidad, vaciarCarrito, total, cantidadTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
