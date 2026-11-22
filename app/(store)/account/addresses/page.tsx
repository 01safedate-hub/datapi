import { nigerianStates } from "@/lib/data/settings";
import { AddressBook } from "./address-book";

export const metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <AddressBook
      states={nigerianStates}
      initial={[
        { id: "a1", label: "Home", name: "Adaeze Okafor", line1: "14 Admiralty Way", city: "Lekki", state: "Lagos", phone: "0803 111 2201", isDefault: true },
        { id: "a2", label: "Office", name: "Adaeze Okafor", line1: "3 Kofo Abayomi Street", city: "Victoria Island", state: "Lagos", phone: "0803 111 2201", isDefault: false },
      ]}
    />
  );
}
