"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOperations } from "@/components/operations/operations-store";
import { RecordPending } from "@/components/operations/record-pending";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { addHoursIso, chicagoWallToIso } from "@/lib/format";
import type { EventStatus } from "@/types/domain";

export function EventCreateView({
  clientId: requestedClientId,
  inquiryId,
}: {
  clientId?: string;
  inquiryId?: string;
}) {
  const router = useRouter();
  const { catalog, createEvent, queries, ready } = useOperations();
  const { notify } = useToast();
  const inquiry = inquiryId ? catalog.inquiries.find((item) => item.id === inquiryId) : undefined;
  const requested = requestedClientId ?? inquiry?.clientId ?? "";
  const resolvedRequested = catalog.clients.some((item) => item.id === requested)
    ? requested
    : inquiry?.clientId && catalog.clients.some((item) => item.id === inquiry.clientId)
      ? inquiry.clientId
      : catalog.clients[0]?.id || "";
  const [manualClientId, setManualClientId] = useState<string | null>(null);
  const clientId =
    manualClientId && catalog.clients.some((item) => item.id === manualClientId)
      ? manualClientId
      : resolvedRequested;
  const client = queries.getClient(clientId);
  const [name, setName] = useState("");
  const eventName = name || (client ? `${client.name} Commencement` : "");
  const [status, setStatus] = useState<EventStatus>("tentative");
  const [quote, setQuote] = useState("8500");
  const [names, setNames] = useState("400");
  const [ceremonyName, setCeremonyName] = useState("Commencement");
  const [ceremonyDate, setCeremonyDate] = useState("2027-05-15");
  const [startTime, setStartTime] = useState("10:00");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [callTime, setCallTime] = useState("08:30");
  const [soundCheck, setSoundCheck] = useState("09:00");
  const [travel, setTravel] = useState("");
  const [airfare, setAirfare] = useState("None — local or TBD");
  const [hotel, setHotel] = useState("");
  const [transfer, setTransfer] = useState("Hotel ↔ venue rideshare, cap on file.");
  const [parking, setParking] = useState("");
  const [notes, setNotes] = useState("");

  if (!ready) return <RecordPending />;

  return (
    <div className="app-page">
      <PageHeader
        title="New event"
        description="Create the operational record: ceremonies, venue, travel, and later reader assignment."
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/events", label: "Events" },
          { label: "New" },
        ]}
      />
      <form
        className="grid max-w-3xl gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!client || !eventName.trim()) return;
          const startsAt = chicagoWallToIso(ceremonyDate, startTime);
          const callAt = chicagoWallToIso(ceremonyDate, callTime);
          const soundAt = chicagoWallToIso(ceremonyDate, soundCheck);
          const endsAtIso = addHoursIso(startsAt, 3);
          const id = createEvent({
            clientId: client.id,
            name: eventName.trim(),
            status,
            quoteAmountCents: Math.round(Number(quote) * 100) || 0,
            estimatedGraduateCount: Number(names) || 0,
            notes,
            travelNotes: travel,
            airfareNotes: airfare,
            accommodationNotes: hotel,
            transferNotes: [transfer, parking].filter(Boolean).join(" · "),
            inquiryId,
            ceremony: {
              name: ceremonyName,
              startsAt,
              endsAt: endsAtIso,
              venueName: venue || "TBD",
              venueAddress: address,
              soundCheckAt: soundAt,
              callTime: callAt,
              kind: "commencement",
              estimatedNames: Number(names) || undefined,
            },
          });
          notify({ title: "Event created." });
          router.push(`/admin/events/${id}`);
        }}
      >
        <Field id="ev-uni" label="University" required>
          <Select
            id="ev-uni"
            value={clientId}
            onChange={(e) => {
              setManualClientId(e.target.value);
              const next = catalog.clients.find((item) => item.id === e.target.value);
              if (next) setName(`${next.name} Commencement`);
            }}
            options={catalog.clients.map((item) => ({ value: item.id, label: item.name }))}
          />
        </Field>
        <Field id="ev-name" label="Event name" required>
          <Input id="ev-name" value={eventName} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="ev-status" label="Status">
            <Select
              id="ev-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              options={[
                { value: "tentative", label: "Tentative" },
                { value: "confirmed", label: "Confirmed" },
              ]}
            />
          </Field>
          <Field id="ev-quote" label="Quote (USD)">
            <Input id="ev-quote" type="number" value={quote} onChange={(e) => setQuote(e.target.value)} />
          </Field>
          <Field id="ev-names" label="Expected names">
            <Input id="ev-names" type="number" value={names} onChange={(e) => setNames(e.target.value)} />
          </Field>
        </div>

        <h2 className="font-serif text-lg font-semibold">Ceremony</h2>
        <Field id="cer-name" label="Ceremony name">
          <Input id="cer-name" value={ceremonyName} onChange={(e) => setCeremonyName(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="cer-date" label="Date">
            <Input id="cer-date" type="date" value={ceremonyDate} onChange={(e) => setCeremonyDate(e.target.value)} />
          </Field>
          <Field id="cer-start" label="Start time" hint="America/Chicago">
            <Input id="cer-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </Field>
          <Field id="cer-call" label="Call time">
            <Input id="cer-call" type="time" value={callTime} onChange={(e) => setCallTime(e.target.value)} />
          </Field>
        </div>
        <Field id="cer-sound" label="Sound check">
          <Input id="cer-sound" type="time" value={soundCheck} onChange={(e) => setSoundCheck(e.target.value)} />
        </Field>
        <Field id="cer-venue" label="Venue">
          <Input id="cer-venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
        </Field>
        <Field id="cer-addr" label="Address">
          <Input id="cer-addr" value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>

        <h2 className="font-serif text-lg font-semibold">Travel / hotel / transfer</h2>
        <Field id="tr" label="Reader travel">
          <Textarea id="tr" value={travel} onChange={(e) => setTravel(e.target.value)} />
        </Field>
        <Field id="air" label="Airfare">
          <Input id="air" value={airfare} onChange={(e) => setAirfare(e.target.value)} />
        </Field>
        <Field id="hot" label="Hotel">
          <Input id="hot" value={hotel} onChange={(e) => setHotel(e.target.value)} />
        </Field>
        <Field id="xfer" label="Transfers">
          <Input id="xfer" value={transfer} onChange={(e) => setTransfer(e.target.value)} />
        </Field>
        <Field id="park" label="Parking">
          <Input id="park" value={parking} onChange={(e) => setParking(e.target.value)} />
        </Field>
        <Field id="notes" label="Operational notes">
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Create event</Button>
        </div>
      </form>
    </div>
  );
}
