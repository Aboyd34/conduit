import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import RoomList from "../components/RoomList";
import Feed from "../components/Feed";
import ToolsPanel from "../components/ToolsPanel";
import IntelPanel from "../components/IntelPanel";
import IdentityPanel from "../components/IdentityPanel";
import AgeGate from "../components/AgeGate";

const AGE_KEY = "conduit_age_verified";

export default function AppPage() {
  const [verified, setVerified] = useState(() => !!localStorage.getItem(AGE_KEY));
  const [view, setView] = useState("rooms");

  if (!verified) return <AgeGate onVerify={() => setVerified(true)} />;

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Nav view={view} setView={setView} />
      <RoomList />
      <ToolsPanel />
      <Feed />
      <IntelPanel />
      <IdentityPanel />
    </div>
  );
}
