import { Header } from '@/components/chat/Header';
import { Chat } from '@/components/chat/Chat';

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-ctp-base">
      <Header />
      <Chat />
    </div>
  );
}
