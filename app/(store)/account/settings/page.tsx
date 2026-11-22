import { demoCustomer } from "@/lib/data/ops";
import { SettingsForms } from "./settings-forms";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsForms customer={demoCustomer} />;
}
