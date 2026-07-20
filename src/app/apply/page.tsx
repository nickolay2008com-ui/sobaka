import type { Metadata } from "next";
import { ApplicationWizard } from "@/components/ApplicationWizard";
import { TrackPage } from "@/components/TrackPage";

export const metadata: Metadata = {
  title: "Проверка проекта",
  description: "Многошаговая заявка для предварительной оценки совместимости партнёрского проекта.",
};

export default function ApplyPage() {
  return (
    <>
      <TrackPage name="apply_view" />
      <section className="application-page">
        <div className="shell"><ApplicationWizard /></div>
      </section>
    </>
  );
}
