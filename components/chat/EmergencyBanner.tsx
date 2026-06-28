import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PhoneIcon } from "lucide-react";

type EmergencyBannerProps = {
  studentEmail?: string;
};

export function EmergencyBanner({ studentEmail }: EmergencyBannerProps) {
  return (
    <Alert variant="destructive" className="mx-4 mb-4 border-red-300 bg-red-50">
      <PhoneIcon className="size-4" />
      <AlertTitle className="font-semibold">Urgent support available now</AlertTitle>
      <AlertDescription className="mt-2 space-y-2 text-sm">
        <p>
          If you are in immediate danger, call{" "}
          <strong>
            <a href="tel:999" className="underline">
              999
            </a>
          </strong>
          . For urgent emotional support, call Samaritans on{" "}
          <strong>
            <a href="tel:116123" className="underline">
              116 123
            </a>
          </strong>{" "}
          (free, 24/7).
        </p>
        <p>
          A member of our team will follow up with you
          {studentEmail ? ` at ${studentEmail}` : ""} as a priority.
        </p>
      </AlertDescription>
    </Alert>
  );
}
