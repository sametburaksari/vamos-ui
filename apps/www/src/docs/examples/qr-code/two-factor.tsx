import { Button, Input, QrCode } from "@vamos-ui/react";

const secret = "JBSWY3DPEHPK3PXP";
const uri = `otpauth://totp/Kiln%20%26%20Linen:defne.kaya%40example.com?secret=${secret}&issuer=Kiln%20%26%20Linen&digits=6&period=30`;

export default function QrCodeTwoFactor() {
  return (
    <div className="grid w-full max-w-lg gap-5 rounded-ui-lg border border-line bg-surface p-6 sm:grid-cols-[auto_1fr]">
      <QrCode value={uri} size={156} aria-label="QR code to add Kiln & Linen to your authenticator app" />
      <div className="grid content-start gap-3 text-sm">
        <div>
          <p className="font-medium text-fg">Scan with your authenticator app</p>
          <p className="mt-1 text-[13px] text-fg-muted">Can't scan? Enter this key instead:</p>
          <p className="mt-1.5 font-mono text-[13px] tracking-[0.12em] text-fg select-all">{secret.match(/.{1,4}/g)!.join(" ")}</p>
        </div>
        <label className="grid gap-1.5 text-[13px] font-medium text-fg">
          6-digit code
          <Input inputMode="numeric" autoComplete="one-time-code" placeholder="000 000" className="font-mono tracking-[0.2em]" />
        </label>
        <Button variant="primary" className="justify-self-start">
          Verify and turn on
        </Button>
      </div>
    </div>
  );
}
