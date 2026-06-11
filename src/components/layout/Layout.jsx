import { Container, Header, Main } from "@/base";

import BottomNav from "./BottomNav";
import { supabase } from "@/lib/supabase";

export default function Layout({ title, action, children }) {
  function handleLogout() {
    supabase.auth.signOut();
  }

  return (
    <>
      <Header variant="site">
        <h1 className="text-xl font-semibold">Taskira</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Sign out
        </button>
      </Header>
      <Main>
        <Header variant="page">
          <h2 className="text-md font-semibold">{title}</h2>
          {action && <div>{action}</div>}
        </Header>
        <Container>{children}</Container>
      </Main>
      <BottomNav />
    </>
  );
}
