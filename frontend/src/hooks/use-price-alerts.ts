"use client"

import { useState, useEffect } from "react"
import { productsApi, type PriceAlert } from "@/lib/api"
import { toast } from "sonner"

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [triggeredCount, setTriggeredCount] = useState(0)

  const loadAlerts = async () => {
    setIsLoading(true)
    try {
      const response = await productsApi.getPriceAlerts()
      setAlerts(response.items)
      setTotal(response.total)
      setActiveCount(response.active_count)
      setTriggeredCount(response.triggered_count)
    } catch (error: any) {
      console.error("Erro ao carregar alertas:", error)
      toast.error("Erro ao carregar alertas")
    } finally {
      setIsLoading(false)
    }
  }

  const createAlert = async (data: {
    favorite_product_id: number
    target_price: number
    alert_type?: "below" | "above" | "exact"
  }) => {
    try {
      const newAlert = await productsApi.createPriceAlert(data)
      setAlerts([newAlert, ...alerts])
      setTotal(total + 1)
      setActiveCount(activeCount + 1)
      toast.success("Alerta criado com sucesso!")
      return newAlert
    } catch (error: any) {
      console.error("Erro ao criar alerta:", error)
      toast.error(error.detail || "Erro ao criar alerta")
      throw error
    }
  }

  const updateAlert = async (alertId: number, data: {
    target_price?: number
    alert_type?: "below" | "above" | "exact"
    is_active?: boolean
  }) => {
    try {
      const updated = await productsApi.updatePriceAlert(alertId, data)
      setAlerts(alerts.map(a => a.id === alertId ? updated : a))
      toast.success("Alerta atualizado")
      return updated
    } catch (error: any) {
      console.error("Erro ao atualizar alerta:", error)
      toast.error("Erro ao atualizar alerta")
      throw error
    }
  }

  const deleteAlert = async (alertId: number) => {
    try {
      await productsApi.deletePriceAlert(alertId)
      setAlerts(alerts.filter(a => a.id !== alertId))
      setTotal(total - 1)
      toast.success("Alerta removido")
    } catch (error: any) {
      console.error("Erro ao remover alerta:", error)
      toast.error("Erro ao remover alerta")
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  return {
    alerts,
    isLoading,
    total,
    activeCount,
    triggeredCount,
    loadAlerts,
    createAlert,
    updateAlert,
    deleteAlert
  }
}
