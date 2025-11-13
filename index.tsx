
import React from "react";
import ReactDOM from "react-dom/client";
import {HeroUIProvider} from "@heroui/react";
import AppLeadMagnet from "./AppLeadMagnet";
import AppScopeOfWork from "./AppScopeOfWork";
import AppDocumentChecklist from "./AppDocumentChecklist";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HeroUIProvider>
      <div className="w-full min-h-screen p-4 md:p-8 flex items-start justify-center">
        {
          (() => {
            const variant = new URLSearchParams(window.location.search).get("variant");
            if (!variant || variant === "checklist") return <AppDocumentChecklist />;
            if (variant === "sow") return <AppScopeOfWork />;
            return <AppLeadMagnet />;
          })()
        }
      </div>  
    </HeroUIProvider>
  </React.StrictMode>
);