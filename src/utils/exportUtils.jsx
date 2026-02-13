// Utility functions for export and print functionality

/**
 * Converts data to CSV format and triggers download
 * @param {Array} data - The data to export
 * @param {Array} headers - The column headers for CSV
 * @param {string} filename - The name of the file to download
 */
export const exportToCSV = (data, headers, filename) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create CSV content with BOM for proper Excel encoding
  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  
  // Add headers - use semicolon as delimiter for better Excel compatibility
  csvContent += headers.join(';') + '\r\n';
  
  // Add data rows
  data.forEach(row => {
    const rowData = headers.map(header => {
      let value = row[header];
      
      // Handle different data types properly
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'number') {
        // Keep numbers as numbers for Excel calculations
        return value.toString();
      } else if (typeof value === 'object' && value !== null) {
        if (value instanceof Date) {
          return value.toLocaleDateString();
        } else {
          return JSON.stringify(value);
        }
      } else {
        // Convert to string and clean up
        value = String(value)
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/;/g, ',') // Replace semicolons with commas to avoid delimiter conflicts
          .trim(); // Remove leading/trailing spaces
        return value;
      }
    });
    csvContent += rowData.join(';') + '\r\n';
  });
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Prints the current table or specified element
 * @param {string} elementId - Optional ID of element to print
 */
export const printTable = (elementId = null) => {
  if (elementId) {
    // Print specific element
    const printContent = document.getElementById(elementId);
    if (printContent) {
      // Clone the element to avoid modifying the original
      const clonedContent = printContent.cloneNode(true);
      
      // Clean up the cloned content for printing
      const badges = clonedContent.querySelectorAll('.inline-flex, .rounded-full, .bg-gradient-to-br');
      badges.forEach(badge => {
        // Convert badges to simple text
        badge.className = '';
        badge.style.cssText = 'display: inline; font-weight: bold; padding: 2px 4px; border: 1px solid #ccc; border-radius: 3px;';
      });
      
      // Remove icons and complex styling
      const icons = clonedContent.querySelectorAll('svg');
      icons.forEach(icon => icon.remove());
      
      // Simplify complex divs
      const complexDivs = clonedContent.querySelectorAll('div.flex, div.w-8, div.w-10, div.w-12');
      complexDivs.forEach(div => {
        if (div.textContent.trim()) {
          const span = document.createElement('span');
          span.textContent = div.textContent.trim();
          div.parentNode.replaceChild(span, div);
        } else {
          div.remove();
        }
      });
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Report - ${new Date().toLocaleDateString()}</title>
            <style>
              @media print {
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  font-size: 12px;
                  line-height: 1.4;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 20px;
                }
                th, td { 
                  border: 1px solid #333; 
                  padding: 6px 8px; 
                  text-align: left; 
                  vertical-align: top;
                }
                th { 
                  background-color: #f0f0f0; 
                  font-weight: bold; 
                  font-size: 11px;
                  text-transform: uppercase;
                }
                td {
                  font-size: 11px;
                }
                .print-header {
                  text-align: center;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #333;
                  padding-bottom: 10px;
                }
                .print-date {
                  text-align: right;
                  font-size: 10px;
                  margin-bottom: 10px;
                }
                tfoot td {
                  font-weight: bold;
                  background-color: #f5f5f5;
                }
                @page {
                  margin: 1cm;
                  size: A4;
                }
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                font-size: 12px;
                line-height: 1.4;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
              }
              th, td { 
                border: 1px solid #333; 
                padding: 6px 8px; 
                text-align: left; 
                vertical-align: top;
              }
              th { 
                background-color: #f0f0f0; 
                font-weight: bold; 
                font-size: 11px;
                text-transform: uppercase;
              }
              td {
                font-size: 11px;
              }
              .print-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
              }
              .print-date {
                text-align: right;
                font-size: 10px;
                margin-bottom: 10px;
              }
              tfoot td {
                font-weight: bold;
                background-color: #f5f5f5;
              }
            </style>
          </head>
          <body>
            <div class="print-date">Printed on: ${new Date().toLocaleString()}</div>
            <div class="print-header">
              <h2>SIMS Inventory Management System</h2>
              <h3>Report</h3>
            </div>
            ${clonedContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      console.error(`Element with ID '${elementId}' not found`);
    }
  } else {
    // Print entire page
    window.print();
  }
};

/**
 * Enhanced export function for products with better formatting
 * @param {Array} data - The products data to export
 * @param {string} filename - The name of the file to download
 */
export const exportProductsToCSV = (data, filename = 'products') => {
  if (!data || data.length === 0) {
    console.warn('No products data to export');
    return;
  }

  // Define headers in the exact order we want them to appear
  const headers = ['Part_ID', 'Product_Name', 'Category', 'Manufacturer', 'Quantity', 'Buying_Price_RWF', 'Selling_Price_RWF', 'Total_Buy_Amount_RWF', 'Total_Sell_Amount_RWF', 'Potential_Profit_RWF'];
  
  // Create properly structured data array
  const formattedData = data.map(part => {
    const buyingPrice = part.buying_price ? parseFloat(part.buying_price) : 0;
    const quantity = part.Quantity || 0;
    const sellingPrice = part.selling_price ? parseFloat(part.selling_price) : 0;
    const totalBuyAmount = buyingPrice * quantity;
    const totalSellAmount = sellingPrice * quantity;
    const potentialProfit = totalSellAmount - totalBuyAmount;
    
    return {
      'Part_ID': part.PartID || '',
      'Product_Name': part.Name || 'N/A',
      'Category': part.category_name || 'N/A',
      'Manufacturer': part.manufacturer_name || 'N/A',
      'Quantity': quantity,
      'Buying_Price_RWF': buyingPrice,
      'Selling_Price_RWF': sellingPrice,
      'Total_Buy_Amount_RWF': totalBuyAmount,
      'Total_Sell_Amount_RWF': totalSellAmount,
      'Potential_Profit_RWF': potentialProfit
    };
  });

  // Calculate totals for numeric columns
  const totals = {
    'Part_ID': '',
    'Product_Name': 'TOTAL',
    'Category': '',
    'Manufacturer': '',
    'Quantity': formattedData.reduce((sum, item) => sum + item.Quantity, 0),
    'Buying_Price_RWF': '',
    'Selling_Price_RWF': '',
    'Total_Buy_Amount_RWF': formattedData.reduce((sum, item) => sum + item.Total_Buy_Amount_RWF, 0),
    'Total_Sell_Amount_RWF': formattedData.reduce((sum, item) => sum + item.Total_Sell_Amount_RWF, 0),
    'Potential_Profit_RWF': formattedData.reduce((sum, item) => sum + item.Potential_Profit_RWF, 0)
  };

  // Add totals row to the data
  const dataWithTotals = [...formattedData, totals];

  exportToCSV(dataWithTotals, headers, filename);
};

/**
 * Legacy export function for spare parts (alias for exportProductsToCSV)
 * @param {Array} data - The products data to export
 * @param {string} filename - The name of the file to download
 */
export const exportSparePartsToCSV = (data, filename = 'products') => {
  return exportProductsToCSV(data, filename);
};

/**
 * Enhanced export function for stock in records
 * @param {Array} data - The stock in data to export
 * @param {string} filename - The name of the file to download
 */
export const exportStockInToCSV = (data, filename = 'stock_in_records') => {
  if (!data || data.length === 0) {
    console.warn('No stock in data to export');
    return;
  }

  const headers = ['Stock_In_ID', 'Part_ID', 'Product_Name', 'Quantity', 'Buying_Price_RWF', 'Total_Cost_RWF', 'Date'];
  
  const formattedData = data.map(record => {
    const buyingPrice = record.buying_price ? parseFloat(record.buying_price) : 0;
    const quantity = record.StockInQuantity || 0;
    const totalCost = buyingPrice * quantity;
    
    return {
      'Stock_In_ID': record.StockInID || '',
      'Part_ID': record.PartID || '',
      'Product_Name': record.PartName || record.PartID || 'N/A',
      'Quantity': quantity,
      'Buying_Price_RWF': buyingPrice,
      'Total_Cost_RWF': totalCost,
      'Date': record.StockInDate ? new Date(record.StockInDate).toLocaleDateString() : ''
    };
  });

  exportToCSV(formattedData, headers, filename);
};

/**
 * Enhanced export function for stock out records
 * @param {Array} data - The stock out data to export
 * @param {string} filename - The name of the file to download
 */
export const exportStockOutToCSV = (data, filename = 'stock_out_records') => {
  if (!data || data.length === 0) {
    console.warn('No stock out data to export');
    return;
  }

  const headers = ['Stock_Out_ID', 'Part_ID', 'Product_Name', 'Quantity', 'Selling_Price_RWF', 'Total_Revenue_RWF', 'Date'];
  
  const formattedData = data.map(record => {
    const sellingPrice = record.selling_price ? parseFloat(record.selling_price) : 0;
    const quantity = record.StockOutQuantity || 0;
    const totalRevenue = sellingPrice * quantity;
    
    return {
      'Stock_Out_ID': record.StockOutID || '',
      'Part_ID': record.PartID || '',
      'Product_Name': record.PartName || record.PartID || 'N/A',
      'Quantity': quantity,
      'Selling_Price_RWF': sellingPrice,
      'Total_Revenue_RWF': totalRevenue,
      'Date': record.StockOutDate ? new Date(record.StockOutDate).toLocaleDateString() : ''
    };
  });

  exportToCSV(formattedData, headers, filename);
};
