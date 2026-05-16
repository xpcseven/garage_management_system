/**
 * يعيد المسار كما هو دون المرور على /_next/image (يتجنب 400 على السيرفر).
 */
export default function passthroughImageLoader({
  src,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return src;
}
