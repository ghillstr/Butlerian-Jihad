import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold text-ink">Game Night Assistant</h1>
      <div className="card">
        <ChatWindow />
      </div>
    </main>
  );
}
