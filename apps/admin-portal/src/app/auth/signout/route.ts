import { signOutAction } from "../actions";

export async function POST() {
  await signOutAction();
}
