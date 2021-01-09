import { ReactNode, ReactNodeArray } from 'react';

const Container = ({ children }: { children: ReactNode | ReactNodeArray }) => (
  <main className="container mx-auto my-40 p-4">{children}</main>
);

export default Container;
