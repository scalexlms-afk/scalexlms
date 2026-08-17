import { PortalChrome } from "@/components/portal-chrome";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalChrome>{children}</PortalChrome>;
}
