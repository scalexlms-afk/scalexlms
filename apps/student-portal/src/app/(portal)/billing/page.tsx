import { requireStudentProfile } from "@/lib/auth";
import { getBillingPageData } from "@/lib/billing";
import { BillingWorkspace } from "@/components/billing/billing-workspace";

export default async function BillingPage() {
  const { userId, profile } = await requireStudentProfile();
  const data = await getBillingPageData(userId, profile);

  return (
    <div className="academy-page">
      <BillingWorkspace data={data} />
    </div>
  );
}
