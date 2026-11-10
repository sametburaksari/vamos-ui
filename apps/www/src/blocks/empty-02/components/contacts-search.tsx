"use client";

import * as React from "react";
import { Building2, FileSpreadsheet, Plus, Search, Upload, UserRoundPlus } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Item,
  ItemContent,
  ItemDescription,
  ItemLeading,
  ItemList,
  ItemMeta,
  ItemTitle,
  ListLayout,
  PageHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vamos-ui/react";
import { contacts, matches, stageTone, suggest } from "./contacts-data";

/** Contacts search that finds nothing, and a Companies tab that has nothing yet. */
export function ContactsSearch() {
  const [query, setQuery] = React.useState("Nordwind");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const results = contacts.filter((c) => matches(c, query));
  const didYouMean = results.length ? null : suggest(query);
  const q = query.trim();

  const search = (value: string) => {
    setQuery(value);
    inputRef.current?.focus();
  };

  return (
    <ListLayout width="wide" stickyToolbar={false}>
      <PageHeader
        eyebrow="Customers"
        title="Contacts"
        description="People and companies you work with."
        actions={
          <>
            <Button>
              <Upload /> Import CSV
            </Button>
            <Button variant="solid">
              <Plus /> New contact
            </Button>
          </>
        }
      />

      <Tabs defaultValue="people">
        <TabsList className="mb-5">
          <TabsTrigger value="people" count={contacts.length}>People</TabsTrigger>
          <TabsTrigger value="companies" count={0}>Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          <Card className="overflow-hidden">
            <form role="search" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3 border-b border-line p-3">
              <Input
                ref={inputRef}
                type="search"
                aria-label="Search contacts"
                placeholder="Search by name, email or company"
                leading={<Search />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                clearable
                onClear={() => setQuery("")}
                className="max-w-md flex-1"
              />
              <span className="ms-auto hidden text-[13px] tabular text-fg-subtle sm:block" aria-hidden>
                {results.length} of {contacts.length}
              </span>
            </form>

            {results.length ? (
              <ItemList aria-label="Contacts">
                {results.map((c) => (
                  <Item key={c.id} asChild>
                    <a href={`#contact-${c.id}`}>
                      <ItemLeading>
                        <Avatar name={c.name} size="sm" />
                      </ItemLeading>
                      <ItemContent>
                        <ItemTitle>{c.name}</ItemTitle>
                        <ItemDescription className="text-fg-muted">
                          {c.role} · {c.company}
                        </ItemDescription>
                      </ItemContent>
                      <ItemMeta className="hidden text-fg-muted md:block">{c.email}</ItemMeta>
                      <Badge tone={stageTone[c.stage]}>{c.stage}</Badge>
                    </a>
                  </Item>
                ))}
              </ItemList>
            ) : (
              <EmptyState
                kind="no-results"
                as="h2"
                title={<>No contacts match “{q}”</>}
                description={
                  didYouMean ? (
                    <>
                      Did you mean{" "}
                      <Button variant="link" className="align-baseline" onClick={() => search(didYouMean)}>
                        {didYouMean}
                      </Button>
                      ? We searched names, emails, companies and job titles.
                    </>
                  ) : (
                    "We searched names, emails, companies and job titles. Check the spelling or try part of an email address."
                  )
                }
                actions={
                  <>
                    <Button onClick={() => search("")}>Clear search</Button>
                    <Button variant="primary">
                      <UserRoundPlus /> Add “{q}” as a contact
                    </Button>
                  </>
                }
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <EmptyState
              size="lg"
              as="h2"
              icon={<Building2 />}
              title="No companies yet"
              description="Companies group the people you work with and roll up their deals. Import a spreadsheet, or they’ll be created automatically from your contacts’ work emails."
              actions={
                <>
                  <Button variant="primary">
                    <FileSpreadsheet /> Import companies
                  </Button>
                  <Button>
                    <Plus /> Add a company
                  </Button>
                </>
              }
            >
              <p className="mt-1 font-mono text-[11.5px] text-fg-subtle">CSV or Excel · up to 10,000 rows · columns are matched for you</p>
            </EmptyState>
          </Card>
        </TabsContent>
      </Tabs>
    </ListLayout>
  );
}
