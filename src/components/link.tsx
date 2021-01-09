import NextLink from 'next/link';
import classnames from 'classnames';
import { ReactNode } from 'react';

const Link = ({
  className = '',
  href,
  children,
}: {
  className?: string;
  href: string;
  children: ReactNode;
}) => (
  <NextLink href={href} passHref>
    <a className={classnames(className, 'no-underline')}>{children}</a>
  </NextLink>
);

export default Link;
