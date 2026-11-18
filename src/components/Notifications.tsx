import React from 'react'
import { X, ClipboardCheck } from 'lucide-react'
import { useStore } from '../state/store'
import { cn } from '../lib/util'

/** The bell. Estimate completed → scheduling is told, with the special orders attached. */
export default function Notifications({ onClose, onOpenJob }: { onClose: () => void; onOpenJob: () => void }) {
  const { notifs, readAll } = useStore()
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute right-12 top-[52px] w-[400px] overflow-hidden rounded-xl border border-line bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[13px] font-semibold text-ink-950">Notifications</span>
          <button onClick={readAll} className="ml-auto text-2xs text-brand-400 hover:underline">Mark all read</button>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X size={14} /></button>
        </div>
        <div className="max-h-[420px] divide-y divide-line overflow-auto">
          {notifs.map(n => (
            <button key={n.id} onClick={() => { onOpenJob(); onClose() }}
              className={cn('flex w-full gap-2.5 px-4 py-2.5 text-left hover:bg-ink-50', !n.read && 'bg-brand-50/50')}>
              <ClipboardCheck size={14} className="mt-0.5 shrink-0 text-brand-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-[12.5px] font-medium text-ink-950">{n.title}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-ink-400">{n.at}</span>
                </div>
                <div className="text-2xs text-ink-500">{n.body}</div>
                <div className="mt-0.5 text-[10px] text-ink-400">To {n.to} · in-app and push · <span className="font-medium text-warn-700">proposed</span> — Merlin doesn't send this one yet</div>
              </div>
              {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />}
            </button>
          ))}
        </div>
        <div className="border-t border-line bg-ink-50 px-4 py-2 text-[10px] text-ink-500">
          Replaces the $0.01 in Estimated Cost and the email to the scheduling team.
        </div>
      </div>
    </div>
  )
}
