import styles from "./Header.module.scss"; //
import HamburgerButton from "../elements/HamburgerButton";
import { GetChildCategoriesBySlug } from "../../../lib/helpers/wpApiList";
// Categoryデータ用の型を定義（必要に応じて調整）
type CategoryChildren = {
  nodes: {
    slug: string;
    name: string;
  }[];
};


export const Header = async () => {
  const data: CategoryChildren | undefined = await GetChildCategoriesBySlug("coding");

  return (
    <>
    <nav className={styles.nav}>
      <div className={styles.headerContainer}>
          <HamburgerButton data={data?.nodes} />
      </div>
    </nav>
    </>
  );
}
