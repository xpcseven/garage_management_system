import Image from "next/image";
import Link from "next/link";
import publicGarageImage from "@/public/System/Public_Garagr.png";
import outsideGarageImage from "@/public/System/Outside_Garage.png";

export default function LandingNetwork() {
  return (
    <section className="relative overflow-hidden bg-dusk py-20 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -end-20 top-10 h-64 w-64 rounded-full bg-orchid/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
            شبكة الشراكة
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl">
            لا تعاون قبل الاتفاق
          </h2>
          <p className="mt-5 text-sm leading-8 text-white/70 sm:text-base">
            الشركة السياحية تدعو الشريك برسالة. الشريك يرد قبولاً أو رفضاً. بعدها
            فقط يظهر الدليل، تُبنى الباقات، وتُفتح المراسلة — حماية للطرفين
            وللمسافر.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <figure className="text-start">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={publicGarageImage}
                alt="تشغيل الرحلات"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dusk via-transparent to-transparent" />
            </div>
            <figcaption className="mt-5">
              <h3 className="text-xl font-bold">تشغيل الشركة</h3>
              <p className="mt-2 text-sm leading-7 text-white/65">
                رحلات منتظمة، برامج بأماكن سياحية، حجز مقاعد من لوحة الشركة،
                وإدارة ظهور الشركاء في الدليل العام دون إنهاء الشراكة.
              </p>
              <Link
                href="/passenger/trips"
                className="mt-4 inline-block text-sm font-semibold text-orchid-light hover:text-white"
              >
                تصفّح الرحلات ←
              </Link>
            </figcaption>
          </figure>

          <figure className="text-start">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={outsideGarageImage}
                alt="شركاء الضيافة"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dusk via-transparent to-transparent" />
            </div>
            <figcaption className="mt-5">
              <h3 className="text-xl font-bold">شركاء الضيافة</h3>
              <p className="mt-2 text-sm leading-7 text-white/65">
                فندق ومطعم ومزرعة يستقبلون الدعوات، يديرون حجوزاتهم، ويتلقون
                إشعاراً عند ضمّهم لباقة أو عند رسالة من الشركة الشريكة.
              </p>
              <Link
                href="/auth/register"
                className="mt-4 inline-block text-sm font-semibold text-orchid-light hover:text-white"
              >
                انضم كشريك ←
              </Link>
            </figcaption>
          </figure>
        </div>

        <ul className="mt-14 grid gap-6 border-t border-white/10 pt-10 text-start sm:grid-cols-3">
          {[
            "دعوة + رسالة إلزامية من الشركة",
            "قبول / رفض مع رد اختياري",
            "دليل وباقات ومراسلة بعد القبول فقط",
          ].map((t) => (
            <li key={t} className="text-sm leading-7 text-white/70">
              <span className="mb-2 block h-px w-10 bg-orchid" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
