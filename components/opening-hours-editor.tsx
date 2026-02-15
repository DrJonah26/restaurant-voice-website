"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  DAY_LABEL_BY_KEY,
  DAY_ORDER,
  type DayKey,
  type DayHours,
  type OpeningHours,
} from "@/lib/opening-hours"

type OpeningHoursEditorProps = {
  value: OpeningHours
  onChange: (next: OpeningHours) => void
}

export function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  const updateDay = (day: DayKey, patch: Partial<DayHours>) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        ...patch,
      },
    })
  }

  const applyFromSourceDay = (sourceDay: DayKey, targetDays: DayKey[]) => {
    const source = value[sourceDay]
    const next = { ...value }

    for (const day of targetDays) {
      next[day] = { ...source }
    }

    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            applyFromSourceDay("monday", [
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ])
          }
        >
          Mo-Fr übernehmen
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFromSourceDay("saturday", ["sunday"])}
        >
          Sa-So übernehmen
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            applyFromSourceDay("monday", [
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ])
          }
        >
          Alle übernehmen
        </Button>
      </div>

      <div className="space-y-3">
        {DAY_ORDER.map((day) => {
          const dayHours = value[day]

          return (
            <div
              key={day}
              className="grid gap-3 rounded-md border border-border bg-background p-3 md:grid-cols-[9rem_1fr_1fr_auto]"
            >
              <div className="flex items-center">
                <Label className="font-medium">{DAY_LABEL_BY_KEY[day]}</Label>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`${day}-open-time`} className="text-xs text-muted-foreground">
                  Öffnet
                </Label>
                <Input
                  id={`${day}-open-time`}
                  type="time"
                  value={dayHours.openTime}
                  onChange={(event) =>
                    updateDay(day, { openTime: event.target.value })
                  }
                  disabled={!dayHours.isOpen}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`${day}-close-time`} className="text-xs text-muted-foreground">
                  Schließt
                </Label>
                <Input
                  id={`${day}-close-time`}
                  type="time"
                  value={dayHours.closeTime}
                  onChange={(event) =>
                    updateDay(day, { closeTime: event.target.value })
                  }
                  disabled={!dayHours.isOpen}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Label htmlFor={`${day}-is-open`} className="text-xs text-muted-foreground">
                  {dayHours.isOpen ? "Geöffnet" : "Geschlossen"}
                </Label>
                <Switch
                  id={`${day}-is-open`}
                  checked={dayHours.isOpen}
                  onCheckedChange={(checked) => updateDay(day, { isOpen: checked })}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Schließzeit kleiner oder gleich Öffnungszeit bedeutet über Mitternacht
        (nächster Tag), z. B. 17:00-00:00.
      </p>
    </div>
  )
}
