import { Container, Header, Main } from "@/base";
import { AppNavigation } from "../AppNavigation/AppNavigation";
import { supabase } from "@/lib/supabase";
import css from "./Layout.module.css";

export function Layout({ title, action, children }) {
  function handleLogout() {
    supabase.auth.signOut();
  }

  return (
    <>
      <Header variant="site">
        <h1 className={css.siteTitle}>Taskira</h1>
        <button onClick={handleLogout} className={css.signOut}>
          Sign out
        </button>
      </Header>
      <Main>
        <Header variant="page">
          <h2 className={css.pageTitle}>{title}</h2>
          {action && <div>{action}</div>}
        </Header>
        <Container>{children}</Container>
      </Main>
      <AppNavigation />
    </>
  );
}
