"use client";

import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import { resolvePublicImageSrc } from "@/lib/image-src";
import Link from "next/link";
import React from "react";

function placeCaption(p: TourismPlaceRow) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return null;
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

const Dashboard_Tourism_Places = ({
  tourismPlaces,
}: {
  tourismPlaces: TourismPlaceRow[];
}) => {
  const featured = tourismPlaces[0];
  const caption = featured ? placeCaption(featured) : null;

  return (
    <div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-8 lg:items-stretch">
        <div className="min-w-0">
          {featured ? (
            <Link
              href="/tourism-places"
              className="group relative isolate block aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-100 shadow-md ring-1 ring-slate-900/5 transition-[box-shadow,transform] hover:shadow-xl hover:ring-purple-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 sm:aspect-[3/2] lg:aspect-[3/2]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvePublicImageSrc(featured.imageUrl)}
                alt={featured.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-0 z-10 w-full p-5 text-right text-white sm:p-6 lg:p-8">
                <p className="text-xs font-medium text-white/80 sm:text-sm">
                  اكتشف المزيد
                </p>
                <h3 className="mt-1 text-xl font-bold leading-snug sm:text-2xl lg:text-3xl">
                  الأماكن السياحية في العراق
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/90 sm:text-base">
                  {featured.name}
                  {caption ? (
                    <span className="mt-1 block text-white/75">{caption}</span>
                  ) : null}
                </p>
              </div>
            </Link>
          ) : (
            <p className="flex min-h-[12rem] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
              لا توجد أماكن سياحية متاحة حالياً.
            </p>
          )}
        </div>

        <aside className="flex flex-col justify-center rounded-3xl border border-purple-100/90 bg-gradient-to-b from-purple-50/90 to-white p-6 shadow-sm sm:p-7 lg:p-8">
          <h3 className="text-lg font-bold text-purple-800 sm:text-xl">
            السياحة في العراق
          </h3>
          <p className="mt-4 text-sm leading-8 text-slate-700 sm:text-[15px] sm:leading-8">
            يتميّز العراق بتنوع سياحي غني يجمع بين المواقع الأثرية، الطبيعة،
            والموروث الحضاري العريق. من الأهوار الجنوبية إلى المدن التاريخية،
            يجد الزائر تجربة فريدة تجمع التاريخ والثقافة.
          </p>
          <p className="mt-4 text-sm leading-8 text-slate-700 sm:text-[15px] sm:leading-8">
            كما تُعد العتبات المقدسة في النجف الأشرف وكربلاء المقدسة وسامراء
            والكاظمية من أبرز المقاصد الدينية، وتستقبل ملايين الزائرين سنوياً،
            ما يجعل السياحة الدينية ركيزة أساسية في المشهد السياحي العراقي.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard_Tourism_Places;
