"use client";

import { Combobox, Field } from "@vamos-ui/react";

interface Person {
  id: string;
  name: string;
  team: string;
}

const people: Person[] = [
  "Leyla Aksoy · Design", "Daniel Okafor · Engineering", "Mina Kurt · Sales", "Omar Haddad · People", "Sofia Martins · Engineering",
  "Kenji Watanabe · Support", "Elif Yıldız · Marketing", "Lucas Moreau · Finance", "Ayşe Demir · Sales", "Noah Fischer · Engineering",
  "Priya Raman · Product", "Can Özkan · Support", "Hannah Becker · Design", "Mateo García · Sales", "Zeynep Arslan · Product",
  "Liam O'Brien · Engineering", "Fatma Çelik · Finance", "Jonas Lind · Support", "Chloé Dubois · Marketing", "Emre Şahin · Engineering",
  "Ana Costa · People", "Yusuf Koç · Sales", "Grace Kim · Product", "Deniz Aydın · Design", "Oliver Novak · Engineering",
].map((row, i) => {
  const [name, team] = row.split(" · ");
  return { id: `u${i + 1}`, name: name!, team: team! };
});

/** A fake API: 300 ms latency, 8 results per page, cursor paging, honours the abort signal. */
function searchPeople(query: string, signal: AbortSignal, cursor?: string): Promise<{ items: Person[]; cursor: string | null }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLocaleLowerCase("tr");
      const matches = people.filter((p) => `${p.name} ${p.team}`.toLocaleLowerCase("tr").includes(q));
      const start = cursor ? Number(cursor) : 0;
      const end = start + 8;
      resolve({ items: matches.slice(start, end), cursor: end < matches.length ? String(end) : null });
    }, 300);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export default function ComboboxAsync() {
  return (
    <Field label="Assignee" hint="Results come from the server, 8 at a time — scroll for more." className="w-full max-w-xs">
      <Combobox<Person>
        loadItems={searchPeople}
        getValue={(p) => p.id}
        getLabel={(p) => p.name}
        selectedItems={[people[1]!]}
        defaultValue="u2"
        placeholder="Assign to…"
        searchPlaceholder="Search people…"
        renderItem={(p, { highlight }) => (
          <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
            <span className="truncate">{highlight}</span>
            <span className="shrink-0 text-xs text-fg-subtle">{p.team}</span>
          </span>
        )}
      />
    </Field>
  );
}
