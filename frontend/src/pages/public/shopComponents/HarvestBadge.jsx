import React from 'react'

export const getDaysUntilHarvest = (date) => {
  if (!date) return null
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
}

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : null

const HarvestBadge = ({ date }) => {
  const days = getDaysUntilHarvest(date)
  if (days === null) return null
  if (days < 0) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Harvested</span>
  )
  if (days <= 7) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">Harvest in {days}d</span>
  )
  if (days <= 30) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Harvest in {days}d</span>
  )
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">Harvest in {days}d</span>
  )
}

export default HarvestBadge