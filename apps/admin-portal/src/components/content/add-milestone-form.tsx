import { createMilestoneAction } from "@/app/(app)/content/actions";
import { Field } from "@/components/field";
import { Button } from "@scalex/ui";

export function AddMilestoneForm({
  courseId,
  orderIndex,
  prominent = false,
}: {
  courseId: string;
  orderIndex: number;
  prominent?: boolean;
}) {
  return (
    <form
      action={createMilestoneAction}
      className={
        prominent
          ? "space-y-3 rounded-2xl border border-dashed border-line p-6"
          : "space-y-2"
      }
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="orderIndex" value={String(orderIndex)} />
      {prominent ? (
        <div className="text-center">
          <p className="font-display text-lg font-semibold">
            Add your first milestone
          </p>
          <p className="mt-1 text-sm text-muted">
            Milestones are the big steps students complete, like Foundation or
            Product Hunting.
          </p>
        </div>
      ) : null}
      <Field
        label={prominent ? "Name" : "New milestone"}
        name="title"
        required
        placeholder="Foundation"
      />
      <Button type="submit" className={prominent ? "w-full" : undefined}>
        {prominent ? "Add first milestone" : "+ Milestone"}
      </Button>
    </form>
  );
}
