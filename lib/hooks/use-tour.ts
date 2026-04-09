"use client"

import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useEffect } from "react"

interface TourStep {
  element: string
  title: string
  description: string
  side?: "top" | "left" | "right" | "bottom"
}

export function useTour(tourKey: string, steps: TourStep[]) {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: '下一步',
      prevBtnText: '上一步',
      doneBtnText: '完成引导',
      steps: steps.map(step => ({
        element: step.element,
        popover: {
          title: step.title,
          description: step.description,
          side: step.side || "bottom",
          align: 'start',
        }
      })),
      onDestroyStarted: () => {
        // 标记该指引已完成
        localStorage.setItem(`tour_completed_${tourKey}`, 'true')
        driverObj.destroy()
      }
    })

    driverObj.drive()
  }

  return { startTour }
}
