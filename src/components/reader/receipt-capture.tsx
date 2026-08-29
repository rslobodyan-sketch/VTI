"use client";

import { useState } from "react";
import { useOperations } from "@/components/operations/operations-store";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { dayKey } from "@/lib/format";

export function ReceiptCapture({
  readerId,
  assignmentId,
  reportId,
}: {
  readerId: string;
  assignmentId: string;
  reportId?: string;
}) {
  const { addExpenseLine } = useOperations();
  const { notify } = useToast();
  const [fileName, setFileName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Ground travel");

  return (
    <form
      className="grid gap-3 border-t border-line pt-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!fileName) {
          notify({ title: "Choose a receipt photo or PDF first." });
          return;
        }
        const amountCents = Math.round(Number(amount) * 100);
        if (!amountCents || amountCents < 0) {
          notify({ title: "Enter the receipt amount." });
          return;
        }
        addExpenseLine({
          reportId,
          assignmentId,
          readerId,
          category,
          amountCents,
          incurredOn: dayKey(new Date().toISOString()),
          description: fileName,
          receiptLabel: `Receipt · ${fileName}`,
        });
        notify({
          title: "Receipt attached to this report.",
          message: "The image stays on the device for this walkthrough; the line is stored with the assignment.",
        });
        setFileName("");
        setAmount("");
      }}
    >
      <p className="text-sm font-medium">Add a receipt</p>
      <Field id={`receipt-file-${assignmentId}`} label="Photo or PDF">
        <input
          id={`receipt-file-${assignmentId}`}
          type="file"
          accept="image/*,.pdf"
          capture="environment"
          className="w-full min-h-12 text-sm file:mr-3 file:min-h-11 file:rounded-[var(--radius-md)] file:border file:border-line file:bg-paper-raised file:px-3 file:text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setFileName(file?.name ?? "");
          }}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id={`receipt-amount-${assignmentId}`} label="Amount (USD)" required>
          <Input
            id={`receipt-amount-${assignmentId}`}
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
        <Field id={`receipt-cat-${assignmentId}`} label="Category">
          <Select
            id={`receipt-cat-${assignmentId}`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            options={[
              { value: "Ground travel", label: "Ground travel" },
              { value: "Airfare", label: "Airfare" },
              { value: "Meals", label: "Meals" },
              { value: "Parking", label: "Parking" },
              { value: "Other", label: "Other" },
            ]}
          />
        </Field>
      </div>
      <Button type="submit" variant="secondary" className="w-full min-h-12">
        Attach receipt to report
      </Button>
    </form>
  );
}
