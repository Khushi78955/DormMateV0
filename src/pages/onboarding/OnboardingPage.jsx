import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import CreateRoomStep from "./CreateRoomStep";
import JoinRoomStep from "./JoinRoomStep";

export default function OnboardingPage() {
  const { profile, loading } = useAuth();
  const [view, setView] = useState("select"); // select | create | join

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-white/50 mt-4">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="page-title">
            Welcome to DormMate, {profile?.displayName || ""}! 🏠
          </h1>
          <p className="text-white/50 mt-2">Set up your shared space</p>
        </div>

        {view !== "select" && (
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setView("select")}>{
              "← Back"
            }</Button>
          </div>
        )}

        {view === "select" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card glow onClick={() => setView("create")} className="p-6">
              <div className="text-4xl mb-3">🏗️</div>
              <h2 className="section-title">Create a Room</h2>
              <p className="text-white/50 text-sm mt-1">
                Start fresh with your roommates
              </p>
            </Card>

            <Card glow onClick={() => setView("join")} className="p-6">
              <div className="text-4xl mb-3">🔗</div>
              <h2 className="section-title">Join a Room</h2>
              <p className="text-white/50 text-sm mt-1">
                Join your roommate&apos;s existing space
              </p>
            </Card>
          </div>
        )}

        {view === "create" && <CreateRoomStep />}
        {view === "join" && <JoinRoomStep />}
      </div>
    </div>
  );
}
