"use client";

import { useState } from "react";
import { CalendarDays, Edit3, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const statusPresets = [
  "Normal working day.",
  "Public Holiday - Office Closed.",
  "Half-day operational schedule.",
  "Scheduled System Maintenance.",
  "Special Corporate Event.",
];

type StatusModalProps = {
  date: string;
  initialValue: string;
  isSaving: boolean;
  error: string;
  onDateChange: (date: string) => void;
  onClose: () => void;
  onSave: (value: string) => Promise<void>;
};

export function StatusModal({
  date,
  initialValue,
  isSaving,
  error,
  onDateChange,
  onClose,
  onSave,
}: StatusModalProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:p-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
            <Edit3 className="h-5 w-5 text-indigo-600" />
            Update Day Status
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">
          <label
            htmlFor="status-date"
            className="text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            Date
          </label>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/80 p-1.5 text-sm font-semibold text-indigo-900">
            <CalendarDays className="h-4 w-4 shrink-0 text-indigo-600" />
            <input
              id="status-date"
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="w-full bg-transparent p-1.5 text-sm font-semibold text-indigo-900 outline-none"
            />
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Template Presets
          </p>
          <div className="flex flex-wrap gap-1.5">
            {statusPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue(preset)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description / Notes
            </label>
            <span className="text-[11px] text-slate-400">
              {value.length}/500
            </span>
          </div>
          <Textarea
            className="min-h-28 text-sm"
            maxLength={500}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter daily status, scheduling notes, or operational events..."
          />
        </div>
        {error && (
          <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            disabled={!value.trim() || isSaving}
            onClick={() => void onSave(value.trim())}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Save Status
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
