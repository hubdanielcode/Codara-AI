import type { Session } from "@supabase/supabase-js";
import React from "react";
import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ChatProvider } from "@/features/code-review/context/ChatContext";
import { CodeReviewProvider } from "@/features/code-review/context/CodeReviewContext";
import { MessageProvider } from "@/features/code-review/context/MessageContext";
import { PatchProvider } from "@/features/code-review/context/PatchContext";

interface AppProvidersProps {
  session: Session | null;
  children: React.ReactNode;
}

const AppProviders = ({
  session,
  children,
}: AppProvidersProps): React.ReactElement => (
  <AuthenticationProvider session={session}>
    <ThemeProvider>
      <CodeReviewProvider>
        <PatchProvider>
          <ChatProvider>
            <MessageProvider>{children}</MessageProvider>
          </ChatProvider>
        </PatchProvider>
      </CodeReviewProvider>
    </ThemeProvider>
  </AuthenticationProvider>
);
export { AppProviders };
