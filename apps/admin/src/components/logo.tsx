/**
 * NO:17 wordmark. Açık zeminde dolu lacivert logo, koyu zeminde beyaz konturlu
 * (dark) logo gösterilir — tema `.dark` sınıfına göre otomatik değişir.
 * Yükseklik `className` ile verilir (ör. "h-11"); genişlik oranı korunur.
 * `forceDark` her iki temada da koyu-zemin (beyaz konturlu) logoyu zorlar —
 * her zaman lacivert olan nav/badge zeminleri için.
 */
export function Logo({ className = "", forceDark = false }: { className?: string; forceDark?: boolean }) {
  if (forceDark) {
    return <img src="/logo-dark.png" alt="NO:17" className={className} />;
  }
  return (
    <span className="contents">
      <img src="/logo.png" alt="NO:17" className={`block dark:hidden ${className}`} />
      <img src="/logo-dark.png" alt="NO:17" aria-hidden className={`hidden dark:block ${className}`} />
    </span>
  );
}
