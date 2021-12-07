import { FC } from "react";
import Link from "next/link";

import styles from "./header.module.scss";

const Header: FC = () => {
  return (
    <div className={styles.Container}>
      <header className={styles.ContentHeader}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </header>
    </div>
  );
};

export default Header;
