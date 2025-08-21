import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartCategorias = ({ transacciones, cuentaSeleccionadaId, categorias }) => {
  // Filtrar por cuenta seleccionada
  const transaccionesFiltradas =
    cuentaSeleccionadaId === "todas"
      ? transacciones
      : transacciones.filter((t) => t.cuentaId === cuentaSeleccionadaId);

  // Contar transacciones por categoría
  const conteoCategorias = transaccionesFiltradas.reduce((acc, t) => {
    if (!t.categoriaId) return acc; // ignorar si no tiene categoría
    if (acc[t.categoriaId]) {
      acc[t.categoriaId].count += 1;
    } else {
      const cat = categorias.find((c) => c.id === t.categoriaId);
      acc[t.categoriaId] = {
        count: 1,
        color: cat ? cat.color : "#ccc",
        label: cat ? cat.nombre : "Sin categoría",
      };
    }
    return acc;
  }, {});

  const labels = Object.values(conteoCategorias).map((c) => c.label);
  const data = Object.values(conteoCategorias).map((c) => c.count);
  const backgroundColors = Object.values(conteoCategorias).map((c) => c.color);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChartCategorias;
