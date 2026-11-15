// The app's root component. Step 3 of the setup replaces this placeholder with the providers and
// the router.
import { useLang } from "@/lang";

export function App() {
  const lang = useLang();

  return (
    <main>
      <h1>{lang.common.appName}</h1>
      <p>{lang.app.setupNotice}</p>
    </main>
  );
}
