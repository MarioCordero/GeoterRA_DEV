// PDF Export utilities for GeoterRA points
// This file contains functions to export point data to PDF format

/**
 * Generate PDF report for a geothermal point
 * @param {Object} pointData - The point data object
 * @returns {Promise} - Promise that resolves when PDF is generated
 */
export const generatePointPDF = async (pointData) => {
  try {
    // TODO: Implement actual PDF generation
    // You can use libraries like jsPDF, react-pdf, or send data to a backend service
    
    console.log('Generating PDF for point:', pointData.id);
    
    // For now, we'll create a simple implementation
    // In the future, you can replace this with actual PDF generation
    
    const reportData = {
      title: `Reporte Geotérmico - ${pointData.id}`,
      date: new Date().toLocaleDateString('es-ES'),
      point: pointData
    };
    
    // This is a placeholder - replace with actual PDF generation
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GeoterRA_${pointData.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Export multiple points to a combined PDF report
 * @param {Array} pointsData - Array of point data objects
 * @param {string} regionName - Name of the region
 * @returns {Promise} - Promise that resolves when PDF is generated
 */
export const generateRegionPDF = async (pointsData, regionName) => {
  try {
    console.log('Generating region PDF for:', regionName);
    
    const reportData = {
      title: `Reporte Regional - ${regionName}`,
      date: new Date().toLocaleDateString('es-ES'),
      pointCount: pointsData.length,
      points: pointsData
    };
    
    // Placeholder implementation
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GeoterRA_Region_${regionName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating region PDF:', error);
    throw error;
  }
};

/**
 * Export point data to CSV format
 * @param {Array} pointsData - Array of point data objects
 * @param {string} filename - Filename for the CSV export
 * @returns {Promise} - Promise that resolves when CSV is generated
 */
export const exportToCSV = async (pointsData, filename = 'geoterra_data') => {
  try {
    if (!pointsData || pointsData.length === 0) {
      throw new Error('No data to export');
    }
    
    // Get all unique keys from all points
    const allKeys = [...new Set(pointsData.flatMap(point => Object.keys(point)))];
    
    // Create CSV header
    const csvHeader = allKeys.join(',') + '\n';
    
    // Create CSV rows
    const csvRows = pointsData.map(point => {
      return allKeys.map(key => {
        const value = point[key] || '';
        // Escape commas and quotes in values
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',');
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

/**
 * Format point data for sharing
 * @param {Object} pointData - The point data object
 * @returns {string} - Formatted text for sharing
 */
export const formatPointForSharing = (pointData) => {
  return `
🌋 Punto Geotérmico: ${pointData.id}
📍 Región: ${pointData.region}
📊 Coordenadas: ${pointData.coord_y}°, ${pointData.coord_x}°

🌡️ Medidas de Campo:
• Temperatura: ${pointData.temp}°C
• pH: ${pointData.pH_campo}
• Conductividad: ${pointData.cond_campo} μS/cm

🧪 Análisis de Laboratorio:
• pH Lab: ${pointData.pH_lab}
• Conductividad Lab: ${pointData.cond_lab} μS/cm
• Principales iones: Cl⁻(${pointData.Cl}), Ca²⁺(${pointData["Ca+"]}), Na⁺(${pointData.Na}) mg/L

Datos del proyecto GeoterRA
`.trim();
};
