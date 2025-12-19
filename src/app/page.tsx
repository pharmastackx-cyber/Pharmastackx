export const dynamic = 'force-dynamic';

import HomeClient from './HomeClient';

export default function Page({
  searchParams,
}: {
  searchParams: { view?: string; slug?: string };
}) {
  return <HomeClient initialView={searchParams.view} />;
}