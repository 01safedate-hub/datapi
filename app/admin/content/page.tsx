import { PageHeader } from "@/components/admin/ui";
import { ContentEditor } from "./content-editor";

export const metadata = { title: "Content" };

export default function ContentPage() {
  return (
    <>
      <PageHeader title="Content" description="Edit store copy and email templates without a developer." />
      <ContentEditor />
    </>
  );
}
