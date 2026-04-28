/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { SanityDocument } from "next-sanity";
import EditorialLanding from "../blocks/editorial/EditorialLanding";

type HomepagePageProps = {
  data?: SanityDocument;
};

const Homepage = ({ data: _data }: HomepagePageProps) => {
  return <EditorialLanding />;
};

export default Homepage;
