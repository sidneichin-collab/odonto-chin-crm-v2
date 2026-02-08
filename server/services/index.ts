/**
 * Services Index
 * 
 * Inicializa todos os serviços automáticos do Canal de Recordatórios
 */

import { startHealthMonitor, stopHealthMonitor } from "./channel-health-monitor";
import { startDailyResetService, stopDailyResetService } from "./daily-reset-service";

/**
 * Inicia todos os serviços
 */
export function startAllServices() {
  console.log("[Services] Starting all Canal de Recordatórios services...");
  
  try {
    // Iniciar monitor de saúde (a cada 5 minutos)
    startHealthMonitor();
    
    // Iniciar serviço de reset diário (à meia-noite)
    startDailyResetService();
    
    console.log("[Services] All services started successfully");
  } catch (error) {
    console.error("[Services] Error starting services:", error);
  }
}

/**
 * Para todos os serviços
 */
export function stopAllServices() {
  console.log("[Services] Stopping all Canal de Recordatórios services...");
  
  try {
    stopHealthMonitor();
    stopDailyResetService();
    
    console.log("[Services] All services stopped");
  } catch (error) {
    console.error("[Services] Error stopping services:", error);
  }
}

// Iniciar serviços automaticamente quando o módulo é importado
// Comentar esta linha se quiser controlar manualmente
// startAllServices();

// Parar serviços ao encerrar o processo
process.on('SIGINT', () => {
  console.log("\n[Services] Received SIGINT, stopping services...");
  stopAllServices();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log("\n[Services] Received SIGTERM, stopping services...");
  stopAllServices();
  process.exit(0);
});
