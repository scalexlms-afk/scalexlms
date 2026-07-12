"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@scalex/db";
import type { LeadStage } from "@scalex/db/types";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { getServiceDb, LEAD_STAGES } from "@/lib/admin-db";

export async function createLeadAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || null;
  const source = (formData.get("source") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) throw new Error("Name is required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "crm");

  const db = getServiceDb();
  const assignedSalesId =
    profile.role === "sales" ? userId : (formData.get("assignedSalesId") as string) || userId;

  const { data, error } = await db
    .from("leads")
    .insert({
      name,
      email,
      whatsapp,
      source,
      notes,
      assigned_sales_id: assignedSalesId,
      stage: "new_lead",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "lead.created",
    targetType: "lead",
    targetId: data.id,
    metadata: { name, stage: "new_lead" },
  });

  revalidatePath("/crm");
}

export async function updateLeadStageAction(formData: FormData) {
  const leadId = formData.get("leadId") as string;
  const stage = formData.get("stage") as LeadStage;

  if (!leadId || !LEAD_STAGES.includes(stage)) {
    throw new Error("Invalid lead stage update");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "crm");

  const db = getServiceDb();
  let query = db.from("leads").update({ stage }).eq("id", leadId);
  if (profile.role === "sales") {
    query = query.eq("assigned_sales_id", userId);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "lead.stage_changed",
    targetType: "lead",
    targetId: leadId,
    metadata: { stage },
  });

  revalidatePath("/crm");
}

export async function updateLeadAction(formData: FormData) {
  const leadId = formData.get("leadId") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || null;
  const source = (formData.get("source") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!leadId || !name) throw new Error("Invalid lead update");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "crm");

  const db = getServiceDb();
  let query = db
    .from("leads")
    .update({ name, email, whatsapp, source, notes })
    .eq("id", leadId);
  if (profile.role === "sales") {
    query = query.eq("assigned_sales_id", userId);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "lead.updated",
    targetType: "lead",
    targetId: leadId,
  });

  revalidatePath("/crm");
}
