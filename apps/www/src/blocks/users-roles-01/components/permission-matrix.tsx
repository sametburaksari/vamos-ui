"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Checkbox, Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import { actions, resourceGroups, type PermissionSet, type Resource } from "./data";

export interface PermissionMatrixProps {
  roleLabel: string;
  value: PermissionSet;
  onValueChange: (next: PermissionSet) => void;
  readOnly?: boolean;
}

/**
 * Resources × actions grid of checkboxes. The row checkbox toggles every action of a resource
 * (indeterminate when some are on). Turning off "View" turns off the rest; turning on any other
 * action also turns on "View" — a role can't edit what it can't see.
 */
export function PermissionMatrix({ roleLabel, value, onValueChange, readOnly }: PermissionMatrixProps) {
  const has = React.useCallback((key: string) => value.includes(key), [value]);

  const setCell = (r: Resource, action: string, on: boolean) => {
    const next = new Set(value);
    if (on) {
      next.add(`${r.id}.${action}`);
      if (action !== "view" && r.actions.includes("view")) next.add(`${r.id}.view`);
    } else if (action === "view") {
      for (const a of r.actions) next.delete(`${r.id}.${a}`);
    } else {
      next.delete(`${r.id}.${action}`);
    }
    onValueChange([...next]);
  };

  const setRow = (r: Resource, on: boolean) => {
    const next = new Set(value);
    for (const a of r.actions) {
      if (on) next.add(`${r.id}.${a}`);
      else next.delete(`${r.id}.${a}`);
    }
    onValueChange([...next]);
  };

  return (
    <TableContainer>
      <Table stickyFirstColumn bordered="rows" density="compact" className="min-w-[640px]">
        <TableCaption visuallyHidden>Permissions of the {roleLabel} role</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className="w-[40%]">
              Resource
            </TableHead>
            {actions.map((a) => (
              <TableHead key={a.id} scope="col" align="center">
                {a.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {resourceGroups.map((g) => (
          <TableBody key={g.app}>
            <TableRow className="bg-surface-2">
              <TableCell colSpan={actions.length + 1} className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
                {g.app}
              </TableCell>
            </TableRow>
            {g.resources.map((r) => {
              const on = r.actions.filter((a) => has(`${r.id}.${a}`)).length;
              const rowState = on === 0 ? false : on === r.actions.length ? true : "indeterminate";
              return (
                <TableRow key={r.id}>
                  <TableCell rowHeader>
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        checked={rowState}
                        onCheckedChange={(c) => setRow(r, c === true)}
                        disabled={readOnly}
                        aria-label={`${r.label}: all actions`}
                        className="mt-0.5"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-fg">{r.label}</div>
                        <div className="text-[12px] text-fg-subtle">{r.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  {actions.map((a) => (
                    <TableCell key={a.id} align="center">
                      {r.actions.includes(a.id) ? (
                        <Checkbox
                          checked={has(`${r.id}.${a.id}`)}
                          onCheckedChange={(c) => setCell(r, a.id, c === true)}
                          disabled={readOnly}
                          aria-label={`${a.label} ${r.label}`}
                          className="justify-center"
                        />
                      ) : (
                        <>
                          <span className="text-fg-subtle" aria-hidden>
                            —
                          </span>
                          <span className="sr-only">Not applicable</span>
                        </>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        ))}
      </Table>
      {readOnly ? (
        <p className="flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] text-fg-muted">
          <Lock className="size-3.5" aria-hidden />
          The Owner role always has every permission.
        </p>
      ) : null}
    </TableContainer>
  );
}
